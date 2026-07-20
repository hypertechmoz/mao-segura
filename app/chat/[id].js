import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import VerifiedBadge from '../../components/VerifiedBadge';
import { Ionicons } from '@expo/vector-icons';
import { formatTime as formatTimeUtil } from '../../utils/profileUtils';

import { sendPushNotification } from '../../services/notificationService';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { id, name, pending_post_id, pending_job_id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
    const [replyContext, setReplyContext] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!user || !id) return;
        const uid = user.uid || user.id;

        // Ensure we know the other person's ID by checking the conversation
        const getReceiver = async () => {
            const { data: convData, error } = await supabase
                .from('chat_conversations')
                .select('*')
                .eq('id', id)
                .single();

            if (convData) {
                const otherUid = convData.employer_id === uid ? convData.worker_id : convData.employer_id;
                setReceiverId(otherUid);
                setIsAuthorized(convData.is_authorized !== false);
                setInitiatedBy(convData.initiated_by || null);

                // Fetch the other user's profile
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', otherUid)
                    .single();

                if (userData) setReceiverProfile(userData);

                // Fetch context
                if (pending_post_id) {
                    const { data: post } = await supabase.from('posts').select('*, author:users!inner(name, profile_photo)').eq('id', pending_post_id).single();
                    if (post) setReplyContext({ type: 'post', data: post });
                } else if (pending_job_id) {
                    const { data: job } = await supabase.from('jobs').select('*, employer:users!employer_id(name, profile_photo)').eq('id', pending_job_id).single();
                    if (job) setReplyContext({ type: 'job', data: job });
                }

                // Check for active contract
                const isEmployer = user.role === 'EMPLOYER';
                const { data: contracts } = await supabase
                    .from('contracts')
                    .select('*')
                    .eq('conversation_id', id)
                    .eq(isEmployer ? 'employer_id' : 'worker_id', uid)
                    .eq('status', 'hired');

                if (contracts && contracts.length > 0) {
                    setActiveContract(contracts[0]);
                    setContractStatus('hired');
                }

                // Clear unread count
                if (convData.unread_count && convData.unread_count[uid] > 0) {
                    const newUnread = { ...convData.unread_count, [uid]: 0 };
                    await supabase.from('chat_conversations').update({
                        unread_count: newUnread
                    }).eq('id', id);
                }
            }
        };

        getReceiver();

        // Subscriptions
        const channelId = `chat-${id}-${Date.now()}`;
        const convChannel = supabase
            .channel(channelId)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations', filter: `id=eq.${id}` }, payload => {
                if (payload.new) {
                    setIsAuthorized(payload.new.is_authorized !== false);
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, async payload => {
                if (payload.new.post_id || payload.new.job_id) {
                    const { data } = await supabase.from('messages').select('*, post:posts(id, content, category, image_url, author:users(name)), job:jobs(id, title, city, type, employer:users(name))').eq('id', payload.new.id).single();
                    if (data) {
                        setMessages(prev => {
                            if (!prev.find(m => m.id === data.id)) return [...prev, data];
                            return prev;
                        });
                        return;
                    }
                }
                setMessages(prev => {
                    if (!prev.find(m => m.id === payload.new.id)) return [...prev, payload.new];
                    return prev;
                });
            })
            .subscribe();

        // Initial messages fetch
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*, post:posts(id, content, category, image_url, author:users(name)), job:jobs(id, title, city, type, employer:users(name))')
                .eq('conversation_id', id)
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();

        return () => {
            supabase.removeChannel(convChannel);
        };
    }, [id, user]);

    const handleSend = async () => {
        if (!text.trim() || !user || !receiverId) return;
        const uid = user.uid || user.id;

        const sentText = text.trim();
        setText('');

        try {
            const payload = {
                conversation_id: id,
                sender_id: uid,
                receiver_id: receiverId,
                content: sentText,
                read: false
            };
            if (replyContext?.type === 'post') payload.post_id = replyContext.data.id;
            if (replyContext?.type === 'job') payload.job_id = replyContext.data.id;

            await supabase.from('messages').insert(payload);
            setReplyContext(null); // Limpa o contexto após enviar

            // Update conversation
            const { data: conv } = await supabase.from('chat_conversations').select('unread_count').eq('id', id).single();
            const unread = conv?.unread_count || {};
            const newUnread = { ...unread, [receiverId]: (unread[receiverId] || 0) + 1 };

            await supabase.from('chat_conversations').update({
                last_message: sentText,
                updated_at: new Date().toISOString(),
                unread_count: newUnread
            }).eq('id', id);

            if (receiverProfile?.push_token) {
                sendPushNotification(
                    receiverProfile.push_token,
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
        const uid = user.uid || user.id;

        setIsHiring(true);
        try {
            const contractData = {
                conversation_id: id,
                employer_id: uid,
                worker_id: receiverId,
                status: 'hired'
            };
            const { data: newContract, error } = await supabase
                .from('contracts')
                .insert(contractData)
                .select()
                .single();

            if (error) throw error;
            setActiveContract(newContract);
            setContractStatus('hired');

            // Send system message
            await supabase.from('messages').insert({
                conversation_id: id,
                sender_id: '00000000-0000-0000-0000-000000000000', // Use a zero UUID for system or add a sender_type
                content: '🎉 Profissional contratado! O histórico será atualizado quando o trabalho for concluído.'
            });

            // Push notification to worker
            if (receiverProfile?.push_token) {
                sendPushNotification(
                    receiverProfile.push_token,
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
        const uid = user.uid || user.id;

        setIsRejecting(true);
        try {
            await supabase.from('contracts').insert({
                conversation_id: id,
                employer_id: uid,
                worker_id: receiverId,
                status: 'rejected'
            });
            setContractStatus('rejected');

            // Send system message
            await supabase.from('messages').insert({
                conversation_id: id,
                sender_id: '00000000-0000-0000-0000-000000000000',
                content: '🚫 O empregador decidiu não prosseguir com a contratação neste momento.'
            });

            if (receiverProfile?.push_token) {
                sendPushNotification(
                    receiverProfile.push_token,
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
        const uid = user.uid || user.id;

        setIsSubmittingReview(true);
        try {
            // Update contract status
            await supabase.from('contracts').update({
                status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', activeContract.id);

            // Check if review already exists
            const { data: existingReview } = await supabase
                .from('reviews')
                .select('*')
                .eq('from_id', uid)
                .eq('to_id', receiverId)
                .maybeSingle();

            // Update Worker Profile
            const { data: prof } = await supabase
                .from('worker_profiles')
                .select('*')
                .eq('user_id', receiverId)
                .single();

            if (prof) {
                const currentCount = prof.completed_contracts || 0;
                const currentRatingAvg = prof.rating_avg || 0;
                const currentRatingCount = prof.rating_count || 0;

                const newCount = currentCount + 1;

                if (existingReview) {
                    // Update existing review
                    await supabase.from('reviews').update({
                        rating,
                        comment: reviewComment,
                        contract_id: activeContract.id,
                        created_at: new Date().toISOString()
                    }).eq('id', existingReview.id);

                    // Recalculate average without changing count
                    const newRatingAvg = currentRatingCount > 0
                        ? ((currentRatingAvg * currentRatingCount) - existingReview.rating + rating) / currentRatingCount
                        : rating;

                    await supabase.from('worker_profiles').update({
                        completed_contracts: newCount,
                        rating_avg: newRatingAvg
                    }).eq('user_id', receiverId);
                } else {
                    // Insert new review
                    await supabase.from('reviews').insert({
                        contract_id: activeContract.id,
                        from_id: uid,
                        to_id: receiverId,
                        rating,
                        comment: reviewComment
                    });

                    const newRatingCount = currentRatingCount + 1;
                    const newRatingAvg = ((currentRatingAvg * currentRatingCount) + rating) / newRatingCount;

                    await supabase.from('worker_profiles').update({
                        completed_contracts: newCount,
                        rating_avg: newRatingAvg,
                        rating_count: newRatingCount
                    }).eq('user_id', receiverId);
                }
            } else {
                if (!existingReview) {
                    await supabase.from('reviews').insert({
                        contract_id: activeContract.id,
                        from_id: uid,
                        to_id: receiverId,
                        rating,
                        comment: reviewComment
                    });
                }
            }

            // System message
            await supabase.from('messages').insert({
                conversation_id: id,
                sender_id: '00000000-0000-0000-0000-000000000000',
                content: `✨ Trabalho concluído e recomendado com ${rating} estrelas!`
            });

            setActiveContract(null);
            setShowReviewModal(false);
            Alert.alert('Sucesso', 'Trabalho concluído e recomendação enviada!');
        } catch (err) {
            console.error('Review error:', err);
            Alert.alert('Erro', 'Não foi possível gravar a recomendação.');
        } finally {
            setIsSubmittingReview(false);
            setContractStatus('completed');
        }
    };

    const handleAuthorize = async () => {
        if (!user || isAuthorizing) return;
        setIsAuthorizing(true);
        try {
            await supabase.from('chat_conversations').update({
                is_authorized: true,
                updated_at: new Date().toISOString(),
                last_message: 'Contacto autorizado'
            }).eq('id', id);

            // System message
            await supabase.from('messages').insert({
                conversation_id: id,
                sender_id: '00000000-0000-0000-0000-000000000000',
                content: '✅ Contacto autorizado. Podem agora trocar mensagens.'
            });

            // Adicionar à lista de notificações da app
            await supabase.from('notifications').insert({
                user_id: receiverId,
                sender_id: user.uid || user.id,
                title: 'Contacto Autorizado ✅',
                description: `${user.name} aceitou o seu pedido de chat. Podem agora conversar e negociar.`,
                type: 'CHAT_AUTHORIZED',
                is_read: false,
                route: `/chat/${id}`
            });

            if (receiverProfile?.push_token) {
                sendPushNotification(
                    receiverProfile.push_token,
                    'Contacto Autorizado',
                    `${user.name} aceitou o seu pedido de chat.`,
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
        const uid = user.uid || user.id;

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
                            await supabase.from('chat_conversations').update({
                                is_authorized: false,
                                last_message: 'Contacto recusado',
                                updated_at: new Date().toISOString()
                            }).eq('id', id);

                            await supabase.from('messages').insert({
                                conversation_id: id,
                                sender_id: '00000000-0000-0000-0000-000000000000',
                                content: '🚫 Infelizmente, o empregador decidiu não prosseguir com esta candidatura. Contacto encerrado.'
                            });

                            if (receiverProfile?.push_token && uid !== initiatedBy) {
                                sendPushNotification(
                                    receiverProfile.push_token,
                                    'Candidatura Recusada',
                                    'O empregador decidiu não prosseguir com o seu contacto.',
                                    { type: 'reject_auth', chatId: id }
                                );
                            }

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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[styles.headerBar, { paddingTop: insets.top + 10 }]}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingHorizontal: 12 }}>
                    <Text style={styles.headerName} numberOfLines={1}>{receiverProfile?.name || name || 'Conversa'}</Text>
                    {(receiverProfile?.is_premium || receiverProfile?.is_verified) && <VerifiedBadge size={14} style={{ marginLeft: 4 }} />}
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id || index.toString()}
                ListHeaderComponent={() => (
                    <View>

                        {messages.filter(m => m.sender_id !== 'system' && m.sender_id !== '00000000-0000-0000-0000-000000000000').length <= 1 && isAuthorized && (
                            <View style={styles.suggestionsContainer}>
                                <Text style={styles.suggestionsTitle}>Sugestões de Mensagem</Text>
                                <View style={styles.suggestionsScroll}>
                                    {['Olá, tenho interesse!', 'Podemos falar sobre a vaga?', 'Gostaria de saber mais detalhes.'].map((sugg, i) => (
                                        <TouchableOpacity key={i} style={styles.suggestionBtn} onPress={() => setText(sugg)}>
                                            <Text style={styles.suggestionText}>{sugg}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}
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
                            {(item.post || item.job) && (
                                <View style={[styles.replyReference, mine ? styles.myReplyReference : styles.otherReplyReference]}>
                                    <View style={[styles.replyReferenceTypeBar, mine ? {backgroundColor: 'rgba(255,255,255,0.4)'} : {backgroundColor: Colors.primary}]} />
                                    <View style={styles.replyReferenceContent}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
                                            <Ionicons name={item.post ? "document-text" : "briefcase"} size={12} color={mine ? 'rgba(255,255,255,0.8)' : Colors.primary} />
                                            <Text style={[styles.replyReferenceType, mine ? {color: 'rgba(255,255,255,0.8)'} : {color: Colors.primary}]}>
                                                {item.post ? 'Post' : 'Vaga'}
                                            </Text>
                                        </View>
                                        <Text style={[styles.replyReferenceTitle, mine ? {color: Colors.white} : {color: Colors.text}]} numberOfLines={1}>
                                            {item.post ? (item.post.content?.substring(0, 30) + '...') : item.job.title}
                                        </Text>
                                    </View>
                                </View>
                            )}
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

            {/* Contract Control Bar (Top) - Only show if enough messages exchanged */}
            {user?.role === 'EMPLOYER' && isAuthorized && messages.filter(m => m.sender_id !== '00000000-0000-0000-0000-000000000000').length >= 5 && !['rejected', 'completed'].includes(contractStatus) && (
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
                        <Text style={styles.modalTitle}>Recomendar Profissional</Text>
                        <Text style={styles.modalSubtitle}>Como foi o serviço realizado por {receiverProfile?.name}?</Text>

                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(s => (
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

            {replyContext && (
                <View style={styles.replyPreviewContainer}>
                    <View style={styles.replyPreviewContent}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
                            <Ionicons name={replyContext.type === 'post' ? "document-text" : "briefcase"} size={12} color={Colors.primary} />
                            <Text style={styles.replyPreviewType}>
                                {replyContext.type === 'post' ? 'Post' : 'Vaga'}
                            </Text>
                        </View>
                        <Text style={styles.replyPreviewTitle} numberOfLines={1}>
                            {replyContext.type === 'post' ? (replyContext.data.content?.substring(0, 30) + '...') : replyContext.data.title}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.replyPreviewClose} onPress={() => setReplyContext(null)}>
                        <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.inputBar, !isAuthorized && styles.inputDisabled, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                <TextInput
                    style={[styles.textInput, !isAuthorized && { backgroundColor: '#f1f1f1' }]}
                    placeholder={isAuthorized ? "Mensagem..." : "Chat bloqueado..."}
                    placeholderTextColor={Colors.textLight}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxHeight={120}
                    maxLength={1000}
                    editable={isAuthorized}
                    onKeyPress={(e) => {
                        if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                            e.preventDefault();
                            if (text.trim() && isAuthorized) {
                                handleSend();
                            }
                        }
                    }}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!text.trim() || !isAuthorized) && { opacity: 0.5 }]}
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

    replyReference: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, marginBottom: 6, overflow: 'hidden' },
    myReplyReference: { backgroundColor: 'rgba(255,255,255,0.2)' },
    otherReplyReference: { backgroundColor: 'rgba(0,0,0,0.05)' },
    replyReferenceTypeBar: { width: 4 },
    replyReferenceContent: { paddingHorizontal: 8, paddingVertical: 6, flex: 1 },
    replyReferenceType: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
    replyReferenceTitle: { fontSize: 12 },

    replyPreviewContainer: { flexDirection: 'row', backgroundColor: '#F0F2F5', marginHorizontal: 10, padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderLeftWidth: 4, borderLeftColor: Colors.primary, alignItems: 'center' },
    replyPreviewContent: { flex: 1 },
    replyPreviewType: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginLeft: 4 },
    replyPreviewTitle: { fontSize: 13, color: Colors.text, marginTop: 2 },
    replyPreviewClose: { padding: 4 },


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

    // Context Card
    contextCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, margin: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
    contextHeader: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    contextBody: { flexDirection: 'row', alignItems: 'center' },
    contextAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    contextInfo: { flex: 1 },
    contextTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
    contextSubtitle: { fontSize: 12, color: Colors.textSecondary },

    // Suggestions
    suggestionsContainer: { marginHorizontal: 16, marginBottom: 16, marginTop: 8 },
    suggestionsTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
    suggestionsScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suggestionBtn: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary + '30' },
    suggestionText: { color: Colors.primary, fontSize: 13, fontWeight: '600' }
});
