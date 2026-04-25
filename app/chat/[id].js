import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, doc, getDoc, updateDoc, addDoc, serverTimestamp, onSnapshot, getDocs, increment } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { formatTime as formatTimeUtil } from '../../utils/profileUtils';

import { sendPushNotification } from '../../services/notificationService';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [receiverId, setReceiverId] = useState(null);
    const [receiverProfile, setReceiverProfile] = useState(null);
    const [activeContract, setActiveContract] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isHiring, setIsHiring] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [contractStatus, setContractStatus] = useState(null); // 'hired', 'rejected', 'completed'
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [initiatedBy, setInitiatedBy] = useState(null);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!user || !id) return;

        // Ensure we know the other person's ID by checking the conversation
        const getReceiver = async () => {
            const convSnap = await getDoc(doc(db, 'chat_conversations', id));
            if (convSnap.exists()) {
                const data = convSnap.data();
                const otherUid = data.employer_id === user.uid ? data.worker_id : data.employer_id;
                setReceiverId(otherUid);
                setIsAuthorized(data.is_authorized !== false);
                setInitiatedBy(data.initiated_by || null);
                
                // Fetch the other user's profile for the avatar
                const uSnap = await getDoc(doc(db, 'users', otherUid));
                if (uSnap.exists()) {
                    setReceiverProfile(uSnap.data());
                }

                // Check for active contract
                const isEmployer = user.role === 'EMPLOYER';
                const contractsQ = query(
                    collection(db, 'contracts'),
                    where('conversation_id', '==', id),
                    where(isEmployer ? 'employer_id' : 'worker_id', '==', user.uid),
                    where('status', '==', 'hired')
                );
                const contractsSnap = await getDocs(contractsQ);
                if (!contractsSnap.empty) {
                    setActiveContract({ id: contractsSnap.docs[0].id, ...contractsSnap.docs[0].data() });
                    setContractStatus('hired');
                }

                // Clear unread count for current user
                if (data.unread_count && data.unread_count[user.uid] > 0) {
                    await updateDoc(doc(db, 'chat_conversations', id), {
                        [`unread_count.${user.uid}`]: 0
                    });
                }
            }
        };

        getReceiver();

        // Real-time subscription for conversation authorization status
        const convUnsubscribe = onSnapshot(doc(db, 'chat_conversations', id), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setIsAuthorized(data.is_authorized !== false);
            }
        });

        // Real-time subscription for messages
        const messagesQuery = query(
            collection(db, 'messages'),
            where('conversation_id', '==', id),
            orderBy('created_at', 'asc')
        );
        const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(msgs);
        });

        return () => {
            messagesUnsubscribe();
            convUnsubscribe();
        };
    }, [id, user]);

    const handleSend = async () => {
        if (!text.trim() || !user || !receiverId) return;

        const sentText = text.trim();
        setText('');

        try {
            await addDoc(collection(db, 'messages'), {
                conversation_id: id,
                sender_id: user.uid,
                receiver_id: receiverId,
                content: sentText,
                read: false,
                created_at: serverTimestamp()
            });

            await updateDoc(doc(db, 'chat_conversations', id), {
                updated_at: serverTimestamp(),
                last_message: sentText,
                [`unread_count.${receiverId}`]: increment(1)
            });

            if (receiverProfile?.pushToken) {
                sendPushNotification(
                    receiverProfile.pushToken,
                    user.name || 'Mensagem nova',
                    sentText,
                    { type: 'chat', chatId: id }
                );
            }
        } catch (err) {
            console.error('Send message error:', err);
        }
    };

    
    const handleHire = async () => {
        if (!user || user.role !== 'EMPLOYER' || !receiverId || isHiring) return;
        
        setIsHiring(true);
        try {
            const contractData = {
                conversation_id: id,
                employer_id: user.uid,
                worker_id: receiverId,
                status: 'hired',
                created_at: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, 'contracts'), contractData);
            setActiveContract({ id: docRef.id, ...contractData });
            setContractStatus('hired');
            
            // Send system message in chat
            await addDoc(collection(db, 'messages'), {
                conversation_id: id,
                sender_id: 'system',
                receiver_id: 'all',
                content: '🎉 Profissional contratado! O histórico será atualizado quando o trabalho for concluído.',
                type: 'system',
                created_at: serverTimestamp()
            });

            // Push notification to worker
            if (receiverProfile?.pushToken) {
                sendPushNotification(
                    receiverProfile.pushToken,
                    'Contratado!',
                    `${user.name} aceitou o seu serviço.`,
                    { type: 'hire', chatId: id }
                );
            }
        } catch (err) {
            console.error('Hire error:', err);
            Alert.alert('Erro', 'Não foi possível concluir a contratação.');
        } finally {
            setIsHiring(false);
        }
    };

    const handleReject = async () => {
        if (!user || user.role !== 'EMPLOYER' || !receiverId || isRejecting) return;
        
        setIsRejecting(true);
        try {
            await addDoc(collection(db, 'contracts'), {
                conversation_id: id,
                employer_id: user.uid,
                worker_id: receiverId,
                status: 'rejected',
                created_at: serverTimestamp()
            });
            setContractStatus('rejected');
            
            // Send system message
            await addDoc(collection(db, 'messages'), {
                conversation_id: id,
                sender_id: 'system',
                receiver_id: 'all',
                content: '🚫 O empregador decidiu não prosseguir com a contratação neste momento.',
                type: 'system',
                created_at: serverTimestamp()
            });

            // Push notification
            if (receiverProfile?.pushToken) {
                sendPushNotification(
                    receiverProfile.pushToken,
                    'Contrato Negado',
                    `${user.name} encerrou a negociação.`,
                    { type: 'reject', chatId: id }
                );
            }
        } catch (err) {
            console.error('Reject error:', err);
        } finally {
            setIsRejecting(false);
        }
    };

    const handleCompleteJob = async () => {
        if (!activeContract || isSubmittingReview) return;
        
        setIsSubmittingReview(true);
        try {
            // Update contract status
            await updateDoc(doc(db, 'contracts', activeContract.id), {
                status: 'completed',
                completed_at: serverTimestamp()
            });

            // Create review
            await addDoc(collection(db, 'reviews'), {
                contract_id: activeContract.id,
                from_id: user.uid,
                to_id: receiverId,
                rating,
                comment: reviewComment,
                created_at: serverTimestamp()
            });

            // Update Worker Profile (Completed Jobs & Rating)
            const profRef = doc(db, 'worker_profiles', receiverId);
            const profSnap = await getDoc(profRef);
            
            if (profSnap.exists()) {
                const data = profSnap.data();
                const currentCount = data.completed_contracts || 0;
                const currentRatingAvg = data.rating_avg || 0;
                const currentRatingCount = data.rating_count || 0;

                const newCount = currentCount + 1;
                const newRatingCount = currentRatingCount + 1;
                const newRatingAvg = ((currentRatingAvg * currentRatingCount) + rating) / newRatingCount;

                await updateDoc(profRef, {
                    completed_contracts: newCount,
                    rating_avg: newRatingAvg,
                    rating_count: newRatingCount
                });
            }

            // System message
            await addDoc(collection(db, 'messages'), {
                conversation_id: id,
                sender_id: 'system',
                receiver_id: 'all',
                content: `✨ Trabalho concluído e avaliado com ${rating} estrelas!`,
                type: 'system',
                created_at: serverTimestamp()
            });

            setActiveContract(null);
            setShowReviewModal(false);
            Alert.alert('Sucesso', 'Trabalho concluído e avaliação enviada!');
        } catch (err) {
            console.error('Review error:', err);
            Alert.alert('Erro', 'Não foi possível gravar a avaliação.');
        } finally {
            setIsSubmittingReview(false);
            setContractStatus('completed');
        }
    };

    const handleAuthorize = async () => {
        if (!user || isAuthorizing) return;
        setIsAuthorizing(true);
        try {
            await updateDoc(doc(db, 'chat_conversations', id), {
                is_authorized: true,
                updated_at: serverTimestamp(),
                last_message: 'Contacto autorizado'
            });

            // System message
            await addDoc(collection(db, 'messages'), {
                conversation_id: id,
                sender_id: 'system',
                receiver_id: 'all',
                content: '✅ Contacto autorizado. Podem agora trocar mensagens.',
                type: 'system',
                created_at: serverTimestamp()
            });

            // Notification
            if (receiverProfile?.pushToken) {
                sendPushNotification(
                    receiverProfile.pushToken,
                    'Contacto Autorizado',
                    `${user.name} aceitou o seu pedido de contacto.`,
                    { type: 'auth', chatId: id }
                );
            }
        } catch (err) {
            console.error('Authorize error:', err);
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleRejectApplication = async () => {
        if (!user || isAuthorizing) return;
        Alert.alert(
            "Recusar Contacto",
            "Deseja recusar este pedido de contacto? A conversa será encerrada.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Recusar", 
                    style: "destructive", 
                    onPress: async () => {
                        setIsAuthorizing(true);
                        try {
                            // Marcar como rejeitado (usamos o sistema de contratos existente ou um campo na conv)
                            await updateDoc(doc(db, 'chat_conversations', id), {
                                is_authorized: false,
                                status: 'rejected',
                                updated_at: serverTimestamp(),
                                last_message: 'Contacto recusado'
                            });

                            const systemMsg = '🚫 Infelizmente, o empregador decidiu não prosseguir com esta candidatura. Contacto encerrado.';
                            
                            await addDoc(collection(db, 'messages'), {
                                conversation_id: id,
                                sender_id: 'system',
                                receiver_id: 'all',
                                content: systemMsg,
                                type: 'system',
                                created_at: serverTimestamp()
                            });

                            // Enviar notificação ao iniciador (candidato)
                            if (receiverProfile?.pushToken && user.uid !== initiatedBy) {
                                sendPushNotification(
                                    receiverProfile.pushToken,
                                    'Candidatura Recusada',
                                    'O empregador decidiu não prosseguir com o seu contacto.',
                                    { type: 'reject_auth', chatId: id }
                                );
                            } else {
                                // Se o receiver for o empregador (quem está a ver agora é o outro), 
                                // precisamos de garantir que quem iniciou receba.
                                // Na verdade, quem iniciou é sempre 'initiatedBy'.
                                // Se user.uid (quem recusa) !== initiatedBy, então o outro é o iniciado.
                                // Já tratamos isso acima.
                            }

                            // Feedback visual rápido antes de sair
                            Alert.alert("Sucesso", "Contacto recusado e candidatura encerrada.");
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(tabs)/home');
                            }
                        } catch (err) {
                            console.error('Reject app error:', err);
                        } finally {
                            setIsAuthorizing(false);
                        }
                    } 
                }
            ]
        );
    };

    const formatTime = (date) => {
        if (!date) return '';
        return formatTimeUtil(date);
    };

    const isMyMessage = (msg) => {
        if (!msg || !user) return false;
        const myId = user.uid || user.id;
        return msg.sender_id === myId;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.headerBar}>
                <TouchableOpacity 
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(tabs)/messages');
                        }
                    }} 
                    style={{ marginRight: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerAvatar}>
                    {receiverProfile?.profile_photo ? (
                        <Image source={{ uri: receiverProfile.profile_photo }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.headerAvatarText}>{receiverProfile?.name?.[0] || name?.[0] || '?'}</Text>
                    )}
                </View>
                <Text style={styles.headerName}>{receiverProfile?.name || name || 'Conversa'}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => {
                    const mine = isMyMessage(item);
                    const isSystem = item.sender_id === 'system' || item.type === 'system';
                    
                    if (isSystem) {
                        return (
                            <View style={styles.systemMessage}>
                                <Text style={styles.systemMessageText}>{item.content}</Text>
                            </View>
                        );
                    }

                    return (
                        <View style={[styles.messageBubble, mine ? styles.myMessage : styles.otherMessage]}>
                            <Text style={[styles.messageText, mine ? styles.myMessageText : styles.otherMessageText]}>
                                {item.content}
                            </Text>
                            <View style={styles.messageFooter}>
                                <Text style={[styles.messageTime, mine ? styles.myMessageTime : styles.otherMessageTime]}>
                                    {formatTime(item.created_at)}
                                </Text>
                                {mine && (
                                    <Ionicons 
                                        name={item.read ? "checkmark-done" : "checkmark"} 
                                        size={14} 
                                        color={item.read ? "#4CAF50" : "rgba(255,255,255,0.5)"} 
                                        style={{ marginLeft: 4 }} 
                                    />
                                )}
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Envie uma mensagem para começar a conversa</Text>
                    </View>
                )}
            />

            {/* Contract Control Bar (Top) */}
            {user?.role === 'EMPLOYER' && isAuthorized && !['rejected', 'completed'].includes(contractStatus) && (
                <View style={styles.contractBar}>
                    {!activeContract ? (
                        <View style={styles.hireOptionsRow}>
                            <TouchableOpacity 
                                style={[styles.hireBtn, { flex: 2 }]} 
                                onPress={handleHire}
                                disabled={isHiring || isRejecting}
                            >
                                {isHiring ? <ActivityIndicator size="small" color={Colors.white} /> : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                                        <Text style={styles.hireBtnText}>Contratar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.rejectBtn} 
                                onPress={handleReject}
                                disabled={isHiring || isRejecting}
                            >
                                {isRejecting ? <ActivityIndicator size="small" color={Colors.error} /> : (
                                    <Text style={styles.rejectBtnText}>Não Contratar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.activeContractRow}>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Contrato Activo</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.completeBtn} 
                                onPress={() => setShowReviewModal(true)}
                            >
                                <Ionicons name="checkmark-circle" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                                <Text style={styles.completeBtnText}>Concluir Trabalho</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Authorization Action Bar */}
            {!isAuthorized && (
                <View style={styles.authorizationBar}>
                    {user?.uid !== initiatedBy ? (
                        // Receiver sees Accept/Reject
                        <View style={styles.authActions}>
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.authTitle}>Deseja autorizar o contacto?</Text>
                                <Text style={styles.authSubtitle}>{receiverProfile?.name} candidatou-se ou demonstrou interesse.</Text>
                            </View>
                            <View style={styles.authButtons}>
                                <TouchableOpacity 
                                    style={styles.authAcceptBtn} 
                                    onPress={handleAuthorize}
                                    disabled={isAuthorizing}
                                >
                                    {isAuthorizing ? <ActivityIndicator size="small" color={Colors.white} /> : (
                                        <Text style={styles.authAcceptText}>Autorizar Contacto</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.authRejectBtn} 
                                    onPress={handleRejectApplication}
                                    disabled={isAuthorizing}
                                >
                                    <Text style={styles.authRejectText}>Recusar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        // Initiator sees "Awaiting"
                        <View style={styles.authPending}>
                            <Ionicons name="time-outline" size={24} color={Colors.primary} style={{ marginBottom: 8 }} />
                            <Text style={styles.authTitle}>Aguardando Autorização</Text>
                            <Text style={styles.authSubtitle}>O seu pedido foi enviado. O cliente poderá autorizar o contacto para começarem a falar.</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Review Modal */}
            <Modal visible={showReviewModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Avaliar Profissional</Text>
                        <Text style={styles.modalSubtitle}>Como foi o serviço realizado por {receiverProfile?.name}?</Text>
                        
                        <View style={styles.starsRow}>
                            {[1,2,3,4,5].map(s => (
                                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                                    <Ionicons name={s <= rating ? "star" : "star-outline"} size={36} color={s <= rating ? "#FFB800" : Colors.textLight} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Deixe um comentário curto (opcional)"
                            value={reviewComment}
                            onChangeText={setReviewComment}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.submitBtn} 
                                onPress={handleCompleteJob}
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.submitBtnText}>Enviar e Concluir</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.inputBar, !isAuthorized && styles.inputDisabled]}>
                <TextInput
                    style={[styles.textInput, !isAuthorized && {backgroundColor: '#f1f1f1'}]}
                    placeholder={isAuthorized ? "Mensagem..." : "Chat bloqueado..."}
                    placeholderTextColor={Colors.textLight}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxHeight={120}
                    maxLength={1000}
                    editable={isAuthorized}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, (!text.trim() || !isAuthorized) && {opacity: 0.5}]} 
                    onPress={handleSend} 
                    disabled={!text.trim() || !isAuthorized}
                >
                    <Ionicons name="send" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    headerBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: Colors.white, 
        paddingHorizontal: Spacing.md, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.borderLight 
    },
    headerAvatar: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: Colors.primaryBg, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 10,
        overflow: 'hidden'
    },
    avatarImage: { width: 36, height: 36, borderRadius: 18 },
    headerAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    headerName: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
    messagesList: { padding: Spacing.md, paddingBottom: Spacing.sm },
    messageBubble: { maxWidth: '85%', borderRadius: 18, padding: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    myMessage: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: 'flex-start', backgroundColor: '#E9E9EB', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, color: '#333', lineHeight: 21 },
    myMessageText: { color: Colors.white },
    otherMessageText: { color: Colors.text },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    messageTime: { fontSize: 10, color: Colors.textLight },
    myMessageTime: { color: 'rgba(255,255,255,0.7)' },
    otherMessageTime: { color: Colors.textLight },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.white, padding: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 8 },
    textInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: Fonts.sizes.md, color: Colors.text },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendText: { color: Colors.white, fontSize: 20 },
    empty: { flex: 1, alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center' },

    // Contract System
    contractBar: { 
        backgroundColor: Colors.white, 
        paddingHorizontal: Spacing.md, 
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        zIndex: 10,
    },
    hireBtn: { 
        backgroundColor: Colors.primary, 
        paddingVertical: 10, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    hireBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
    activeContractRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
    completeBtn: { backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
    completeBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

    // Reject Flow
    hireOptionsRow: { flexDirection: 'row', gap: 10 },
    rejectBtn: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        borderRadius: 12, 
        paddingVertical: 10, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    rejectBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13 },
    
    // Review Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 20 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
    reviewInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 12, height: 80, textAlignVertical: 'top', fontSize: 14, color: Colors.text },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: { color: Colors.textLight, fontWeight: '600' },
    submitBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: Colors.white, fontWeight: '700' },
    
    // System message style (bonus)
    systemMessage: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginVertical: 12 },
    systemMessageText: { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },

    // Authorization System Styles
    authorizationBar: {
        backgroundColor: Colors.white,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        flex: 1,
        justifyContent: 'center',
    },
    authActions: { alignItems: 'center' },
    authPending: { alignItems: 'center', padding: 20 },
    authTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
    authSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    authButtons: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
    authAcceptBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    authAcceptText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
    authRejectBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    authRejectText: { color: Colors.textSecondary, fontWeight: '600' },
    inputDisabled: { opacity: 0.8 },
});
