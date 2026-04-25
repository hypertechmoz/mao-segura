import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '../../utils/useAuthGuard';

export default function WorkerDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportText, setReportText] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    const REPORT_REASONS = ['Perfil Falso', 'Comportamento Abusivo', 'Fraude ou Burla', 'Outro'];

    const handleReportSubmit = async () => {
        if (!requireAuth()) {
            setShowReportModal(false);
            return;
        }
        if (!reportReason) {
            Alert.alert('Atenção', 'Selecione um motivo para a denúncia.');
            return;
        }
        setIsReporting(true);
        try {
            await addDoc(collection(db, 'reports'), {
                reporter_id: user.uid,
                reported_id: worker.id,
                reason: reportReason,
                details: reportText,
                status: 'pending',
                created_at: serverTimestamp()
            });
            setShowReportModal(false);
            setReportReason('');
            setReportText('');
            Alert.alert('Sucesso', 'A sua denúncia foi registada e será analisada pela nossa equipa.');
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível enviar a denúncia.');
        } finally {
            setIsReporting(false);
        }
    };

    const loadWorker = useCallback(async () => {
        try {
            // Fetch User Basic Info
            const userRef = doc(db, 'users', id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) throw new Error('Profissional não encontrado');
            const userData = userSnap.data();

            // Fetch Worker Profile Info
            const profileRef = doc(db, 'worker_profiles', id);
            const profileSnap = await getDoc(profileRef);
            const profileData = profileSnap.exists() ? profileSnap.data() : {};

            setWorker({
                id: userSnap.id,
                ...userData,
                ...profileData
            });
        } catch (err) {
            Alert.alert('Erro', err.message);
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const q = query(
                collection(db, 'reviews'),
                where('to_id', '==', id),
                orderBy('created_at', 'desc')
            );
            const snap = await getDocs(q);
            const reviewsData = [];
            
            // Fetch reviewer names
            for (const d of snap.docs) {
                const rev = { id: d.id, ...d.data() };
                const uSnap = await getDoc(doc(db, 'users', rev.from_id));
                if (uSnap.exists()) {
                    rev.reviewer_name = uSnap.data().name;
                    rev.reviewer_photo = uSnap.data().profile_photo;
                }
                reviewsData.push(rev);
            }
            setReviews(reviewsData);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    }, [id]);

    const checkConnection = useCallback(async () => {
        if (!user || !id) return;
        try {
            const reqQ1 = query(collection(db, 'connection_requests'), where('sender_id', '==', user.uid), where('receiver_id', '==', id), where('status', '==', 'PENDING'));
            const reqQ2 = query(collection(db, 'connection_requests'), where('sender_id', '==', id), where('receiver_id', '==', user.uid), where('status', '==', 'PENDING'));
            
            const [snap1, snap2] = await Promise.all([getDocs(reqQ1), getDocs(reqQ2)]);
            if (!snap1.empty || !snap2.empty) setHasPendingRequest(true);

            const connQ1 = query(collection(db, 'connections'), where('user1_id', '==', user.uid), where('user2_id', '==', id));
            const connQ2 = query(collection(db, 'connections'), where('user1_id', '==', id), where('user2_id', '==', user.uid));
            
            const [csnap1, csnap2] = await Promise.all([getDocs(connQ1), getDocs(connQ2)]);
            if (!csnap1.empty || !csnap2.empty) setIsConnected(true);
        } catch(e) {
            console.log(e);
        }
    }, [user, id]);

    useEffect(() => {
        loadWorker();
        loadReviews();
        checkConnection();
    }, [loadWorker, loadReviews, checkConnection]);

    const handleChat = async () => {
        if (!requireAuth()) return;
        
        if (isConnected) {
            try {
                const isEmployer = user.role === 'EMPLOYER';
                const q = query(
                    collection(db, 'chat_conversations'), 
                    where('employer_id', '==', isEmployer ? user.uid : id), 
                    where('worker_id', '==', isEmployer ? id : user.uid)
                );
                const snap = await getDocs(q);

                let conversationId;
                if (!snap.empty) {
                    conversationId = snap.docs[0].id;
                } else {
                    const newRef = await addDoc(collection(db, 'chat_conversations'), {
                        employer_id: isEmployer ? user.uid : id,
                        worker_id: isEmployer ? id : user.uid,
                        created_at: serverTimestamp(),
                        updated_at: serverTimestamp(),
                        last_message: 'Conectados',
                        is_authorized: true,
                        initiated_by: user.uid
                    });
                    conversationId = newRef.id;
                }
                router.push({ pathname: `/chat/${conversationId}`, params: { name: worker.name } });
            } catch (err) {
                Alert.alert('Erro', err.message);
            }
        } else if (hasPendingRequest) {
            Alert.alert("Aviso", "Já enviou um pedido de conexão para este utilizador.");
        } else {
            try {
                import('../../utils/chatSecureHelper').then(async ({ sendConnectionRequest }) => {
                    await sendConnectionRequest(user, id, { type: 'CONTACT' });
                    setHasPendingRequest(true);
                    Alert.alert("Pedido Enviado", "Será notificado quando a outra parte aceitar iniciar a conversa.");
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!worker) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {worker.profile_photo ? (
                        <Image source={{ uri: worker.profile_photo }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>{worker.name?.[0] || '?'}</Text>
                        </View>
                    )}
                    {worker.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                        </View>
                    )}
                </View>

                <Text style={styles.name}>{worker.name}</Text>
                <Text style={styles.role}>{worker.work_types?.join(' & ') || worker.profession_category || 'Profissional em Geral'}</Text>
                
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{worker.city}, {worker.bairro || worker.province}</Text>
                </View>

                {/* Rating Summary */}
                <View style={styles.ratingSummary}>
                    <View style={styles.starsRow}>
                        {[1,2,3,4,5].map(s => (
                            <Ionicons 
                                key={s} 
                                name={s <= Math.round(worker.rating_avg || 0) ? "star" : "star-outline"} 
                                size={16} 
                                color="#FFB800" 
                            />
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {worker.rating_avg ? worker.rating_avg.toFixed(1) : 'Sem avaliações'} 
                        {worker.rating_count > 0 && ` (${worker.rating_count})`}
                    </Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.completedText}>
                        {worker.completed_contracts || 0} trabalhos concluídos
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sobre</Text>
                <Text style={styles.description}>
                    {worker.description || 'Este profissional ainda não adicionou uma descrição ao seu perfil.'}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especialidades / Tipos de Trabalho</Text>
                <View style={styles.chips}>
                    {worker.work_types?.length > 0 ? worker.work_types.map((type, index) => (
                        <View key={index} style={styles.chip}>
                            <Text style={styles.chipText}>{type}</Text>
                        </View>
                    )) : <Text style={styles.emptyText}>Nenhuma especialidade listada</Text>}
                </View>
            </View>

            {worker.skills && worker.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Habilidades Adicionais</Text>
                    <View style={styles.chips}>
                        {worker.skills.map((skill, index) => (
                            <View key={index} style={[styles.chip, { backgroundColor: Colors.info + '15' }]}>
                                <Text style={[styles.chipText, { color: Colors.info }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações Adicionais</Text>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Disponibilidade</Text>
                        <Text style={styles.infoValue}>{worker.availability === 'DAILY' ? 'Diarista' : 'Permanente'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Dorme no Local</Text>
                        <Text style={styles.infoValue}>{worker.can_sleep_onsite ? 'Sim' : 'Não'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Experiência</Text>
                        <Text style={styles.infoValue}>{worker.has_experience ? 'Com Experiência' : 'Iniciante'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Bairro</Text>
                        <Text style={styles.infoValue}>{worker.bairro || 'Não informado'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.chatButton, { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primary, marginBottom: 12 }]} 
                    onPress={async () => {
                        if (!requireAuth()) return;
                        if (isConnected) return;
                        if (hasPendingRequest) {
                            Alert.alert("Aviso", "Já enviou um pedido de conexão.");
                            return;
                        }
                        try {
                            import('../../utils/chatSecureHelper').then(async ({ sendConnectionRequest }) => {
                                await sendConnectionRequest(user, id, { type: 'CONTACT' });
                                setHasPendingRequest(true);
                                Alert.alert("Sucesso", "Pedido de conexão enviado!");
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name={isConnected ? "checkmark" : (hasPendingRequest ? "time" : "person-add")} size={22} color={Colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.chatButtonText, { color: Colors.primary }]}>
                        {isConnected ? 'Conectado' : (hasPendingRequest ? 'Pedido Pendente' : 'Conectar')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.chatButton} onPress={handleChat} activeOpacity={0.8}>
                    <Ionicons name="chatbubble-ellipses" size={22} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.chatButtonText}>Contactar Profissional</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReportModal(true)}>
                    <Ionicons name="flag" size={16} color={Colors.textLight} style={{ marginRight: 6 }} />
                    <Text style={styles.reportBtnText}>Denunciar Perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Avaliações de Clientes</Text>
                    <Text style={styles.reviewCount}>{reviews.length}</Text>
                </View>
                
                {loadingReviews ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
                ) : reviews.length > 0 ? (
                    reviews.map((rev) => (
                        <View key={rev.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerAvatar}>
                                    {rev.reviewer_photo ? (
                                        <Image source={{ uri: rev.reviewer_photo }} style={styles.reviewerAvatarImg} />
                                    ) : (
                                        <Text style={styles.reviewerInitial}>{rev.reviewer_name?.[0] || '?'}</Text>
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.reviewerName}>{rev.reviewer_name}</Text>
                                    <View style={styles.reviewStars}>
                                        {[1,2,3,4,5].map(s => (
                                            <Ionicons 
                                                key={s} 
                                                name={s <= rev.rating ? "star" : "star-outline"} 
                                                size={12} 
                                                color="#FFB800" 
                                            />
                                        ))}
                                        <Text style={styles.reviewDate}>
                                            • {rev.created_at?.seconds ? new Date(rev.created_at.seconds * 1000).toLocaleDateString('pt-MZ') : ''}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {rev.comment ? (
                                <Text style={styles.reviewComment}>{rev.comment}</Text>
                            ) : null}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyReviews}>Este profissional ainda não recebeu avaliações.</Text>
                )}
            </View>

            <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Denunciar Perfil</Text>
                            <TouchableOpacity onPress={() => setShowReportModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>Por que motivo deseja denunciar {worker.name}?</Text>
                        
                        {REPORT_REASONS.map((r, i) => (
                            <TouchableOpacity 
                                key={i} 
                                style={[styles.reasonOption, reportReason === r && styles.reasonActive]} 
                                onPress={() => setReportReason(r)}
                            >
                                <View style={[styles.radio, reportReason === r && styles.radioActive]}>
                                    {reportReason === r && <View style={styles.radioInner} />}
                                </View>
                                <Text style={[styles.reasonText, reportReason === r && styles.reasonTextActive]}>{r}</Text>
                            </TouchableOpacity>
                        ))}

                        <TextInput
                            style={styles.reportInput}
                            placeholder="Tem mais detalhes? (Opcional)"
                            placeholderTextColor={Colors.textLight}
                            multiline
                            numberOfLines={3}
                            value={reportText}
                            onChangeText={setReportText}
                        />

                        <TouchableOpacity 
                            style={[styles.modalSubmitBtn, isReporting && {opacity: 0.7}]} 
                            onPress={handleReportSubmit} 
                            disabled={isReporting}
                        >
                            {isReporting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSubmitText}>Enviar Denúncia</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: Spacing.xxl },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: Colors.white, padding: Spacing.xl, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryBg, borderWidth: 3, borderColor: Colors.white },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 40, fontWeight: '800', color: Colors.primary },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
    name: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
    role: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginBottom: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 14, color: Colors.textSecondary },
    section: { backgroundColor: Colors.white, borderRadius: 20, padding: Spacing.lg, marginHorizontal: Spacing.md, marginTop: Spacing.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: Colors.primaryBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    infoItem: { width: '45%' },
    infoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
    infoValue: { fontSize: 14, color: Colors.text, fontWeight: '600' },
    actions: { padding: Spacing.xl },
    chatButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    chatButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    emptyText: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic' },
    reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl },
    reportBtnText: { color: Colors.textLight, fontSize: 14, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
    modalSubtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: Spacing.lg },
    reasonOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    reasonActive: { backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 8 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: Colors.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
    reasonText: { fontSize: 15, color: Colors.text },
    reasonTextActive: { color: Colors.primary, fontWeight: '600' },
    reportInput: { backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.md, marginTop: Spacing.lg, height: 80, textAlignVertical: 'top' },
    modalSubmitBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl },
    modalSubmitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

    // Rating & Review Styles
    ratingSummary: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    starsRow: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
    ratingText: { fontSize: 13, fontWeight: '700', color: Colors.text },
    dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textLight, marginHorizontal: 8 },
    completedText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    reviewCount: { backgroundColor: Colors.primaryBg, color: Colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12, fontWeight: '700' },
    reviewItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 16 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
    reviewerAvatarImg: { width: 32, height: 32, borderRadius: 16 },
    reviewerInitial: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
    reviewerName: { fontSize: 14, fontWeight: '700', color: Colors.text },
    reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    reviewDate: { fontSize: 11, color: Colors.textLight, marginLeft: 6 },
    reviewComment: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
    emptyReviews: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 }
});
