import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, TextInput, Platform, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import VerifiedBadge from '../../components/VerifiedBadge';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '../../utils/useAuthGuard';
import PostCard from '../../components/PostCard';
import JobCard from '../../components/JobCard';

export default function UserDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportText, setReportText] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reviews, setReviews] = useState([]);
    const insets = useSafeAreaInsets();
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [isProcessingChat, setIsProcessingChat] = useState(false);
    
    // Novas Tabs
    const [activeTab, setActiveTab] = useState('SOBRE');
    const [userPosts, setUserPosts] = useState([]);
    const [userHistory, setUserHistory] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUser();
        await loadReviews();
        await checkConnection();
        if (activeTab === 'POSTS') await loadPosts();
        if (activeTab === 'HISTORICO') await loadHistory();
        setRefreshing(false);
    };

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
            await supabase.from('reports').insert({
                reporter_id: user.uid || user.id,
                reported_id: profileUser.id,
                reason: reportReason,
                details: reportText,
                status: 'pending',
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

    const loadUser = useCallback(async () => {
        try {
            // Fetch User Basic Info
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (userError || !userData) throw new Error('Utilizador não encontrado');

            let profileData = {};
            const profileTable = userData.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
            const { data: pData } = await supabase
                .from(profileTable)
                .select('*')
                .eq('user_id', id)
                .maybeSingle();
            
            profileData = pData || {};

            setProfileUser({
                id: id,
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
            const { data: reviewsData, error } = await supabase
                .from('reviews')
                .select('*, reviewer:users!from_id(name, profile_photo)')
                .eq('to_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const formattedReviews = reviewsData.map(rev => ({
                ...rev,
                reviewer_name: rev.reviewer?.name,
                reviewer_photo: rev.reviewer?.profile_photo
            }));

            setReviews(formattedReviews);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    }, [id]);

    const checkConnection = useCallback(async () => {
        const uid = user?.uid || user?.id;
        
        try {
            if (id) {
                const { count } = await supabase
                    .from('connections')
                    .select('*', { count: 'exact', head: true })
                    .or(`user1_id.eq.${id},user2_id.eq.${id}`);
                setConnectionsCount(count || 0);
            }

        if (!uid || !id) return;
            const { data: reqs } = await supabase
                .from('connection_requests')
                .select('*')
                .or(`and(sender_id.eq.${uid},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${uid})`)
                .eq('status', 'PENDING');

            if (reqs && reqs.length > 0) {
                setHasPendingRequest(true);
                setPendingRequest(reqs[0]);
            }

            const { data: conns } = await supabase
                .from('chat_conversations')
                .select('*')
                .or(`and(worker_id.eq.${uid},employer_id.eq.${id}),and(worker_id.eq.${id},employer_id.eq.${uid})`)
                .eq('is_authorized', true);
            
            if (conns && conns.length > 0) setIsConnected(true);
        } catch(e) {
            console.log(e);
        }
    }, [user, id]);

    const loadPosts = useCallback(async () => {
        if (!id) return;
        setLoadingPosts(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, author:users!inner(name, profile_photo, role, is_verified, is_premium)')
                .eq('user_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserPosts(data || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    }, [id]);

    const loadHistory = useCallback(async () => {
        if (!id || !profileUser) return;
        setLoadingHistory(true);
        try {
            if (profileUser.role === 'WORKER') {
                const { data, error } = await supabase
                    .from('applications')
                    .select('*, job:jobs(*, employer:users!employer_id(id,name,is_verified,is_premium))')
                    .eq('worker_id', id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setUserHistory(data?.map(app => app.job).filter(j => j != null) || []);
            } else {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*, employer:users!employer_id(id,name,is_verified,is_premium)')
                    .eq('employer_id', id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setUserHistory(data || []);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    }, [id, profileUser]);

    useEffect(() => {
        loadUser();
        loadReviews();
        checkConnection();
    }, [loadUser, loadReviews, checkConnection]);

    useEffect(() => {
        if (activeTab === 'POSTS' && userPosts.length === 0) loadPosts();
        if (activeTab === 'HISTORICO' && userHistory.length === 0) loadHistory();
    }, [activeTab, loadPosts, loadHistory]);

    const handleChat = async () => {
        if (!requireAuth()) return;
        if (isProcessingChat) return;

        setIsProcessingChat(true);
        try {
            if (isConnected) {
                const { startOrGetConversation } = await import('../../utils/chatHelper');
                const conversationId = await startOrGetConversation(user, id);
                router.push({ pathname: `/chat/${conversationId}`, params: { name: profileUser.name } });
            } else if (hasPendingRequest) {
                const uid = user?.uid || user?.id;
                const isReceiver = pendingRequest && pendingRequest.receiver_id === uid;
                if (isReceiver) {
                    const { acceptConnectionRequest } = await import('../../utils/chatSecureHelper');
                    const chatId = await acceptConnectionRequest(pendingRequest.id, user, id);
                    if (chatId) {
                        setIsConnected(true);
                        setHasPendingRequest(false);
                        router.push({ pathname: `/chat/${chatId}`, params: { name: profileUser.name } });
                    }
                } else {
                    Alert.alert("Aviso", "Já enviou um pedido de permissão para este utilizador.");
                }
            } else {
                const { sendConnectionRequest } = await import('../../utils/chatSecureHelper');
                await sendConnectionRequest(user, id, { type: 'CONNECTION' });
                setHasPendingRequest(true);
                Alert.alert("Pedido Enviado", "Será notificado quando o profissional aceitar o seu pedido para iniciar a conexão.");
            }
        } catch (e) {
            console.error('Erro no handleChat:', e);
            Alert.alert("Erro", "Não foi possível realizar a ação.");
        } finally {
            setIsProcessingChat(false);
        }
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!profileUser) return null;

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
            <TouchableOpacity 
                style={[styles.backButton, { top: Math.max(insets.top, 10) + 10 }]} 
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)/home');
                    }
                }}
            >
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 20 }]}>
                <View style={styles.avatarContainer}>
                    {profileUser.profile_photo ? (
                        <Image source={{ uri: profileUser.profile_photo }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>{profileUser.name?.[0] || '?'}</Text>
                        </View>
                    )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.name}>{profileUser.name}</Text>
                    {(profileUser.is_premium || profileUser.is_verified) && <VerifiedBadge size={18} style={{ marginLeft: 6 }} />}
                </View>
                <Text style={styles.role}>{profileUser.role === 'EMPLOYER' ? 'Empregador' : (profileUser.work_types?.join(' & ') || profileUser.profession_category || 'Profissional em Geral')}</Text>
                
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{profileUser.city}, {profileUser.bairro || profileUser.province}</Text>
                </View>

                {/* Connection Status Badge */}
                {user && id !== user.uid && id !== user.id && (
                    <View style={{ marginTop: 12 }}>
                        {isConnected ? (
                            <View style={{ backgroundColor: Colors.success + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={14} color={Colors.success} style={{ marginRight: 4 }} />
                                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.success }}>Conectados</Text>
                            </View>
                        ) : hasPendingRequest ? (
                            <View style={{ backgroundColor: Colors.warning + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={(pendingRequest && pendingRequest.receiver_id === (user?.uid || user?.id)) ? "person-add" : "time"} size={14} color={Colors.warning} style={{ marginRight: 4 }} />
                                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.warning }}>
                                    {(pendingRequest && pendingRequest.receiver_id === (user?.uid || user?.id)) ? 'Recebeu um Pedido' : 'Ligação Pendente'}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Stats Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 24, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 20 }}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text }}>{connectionsCount || 0}</Text>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>Conexões</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: Colors.borderLight, height: 40 }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text }}>{profileUser.rating_count || 0}</Text>
                            {profileUser.rating_avg > 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFB800' }}>⭐ {profileUser.rating_avg.toFixed(1)}</Text>}
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>Recomendações</Text>
                    </View>
                </View>

                {profileUser.role === 'WORKER' && (
                    <View style={{ alignItems: 'center', marginTop: 12 }}>
                        <Text style={styles.completedText}>
                            {profileUser.completed_contracts || 0} trabalhos concluídos
                        </Text>
                    </View>
                )}

            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.chatButton, isProcessingChat && { opacity: 0.7 }]} onPress={handleChat} disabled={isProcessingChat}>
                    {isProcessingChat ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name={isConnected ? "chatbubbles" : (hasPendingRequest ? ((pendingRequest && pendingRequest.receiver_id === (user?.uid || user?.id)) ? "checkmark-circle" : "time") : "chatbubble-ellipses")} size={22} color={Colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.chatButtonText}>{isConnected ? 'Escrever Mensagem' : (hasPendingRequest ? ((pendingRequest && pendingRequest.receiver_id === (user?.uid || user?.id)) ? 'Aceitar Pedido' : 'Pedido Pendente') : 'Pedir para Contactar')}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReportModal(true)}>
                    <Ionicons name="flag" size={16} color={Colors.textLight} style={{ marginRight: 6 }} />
                    <Text style={styles.reportBtnText}>Denunciar Perfil</Text>
                </TouchableOpacity>
            </View>

            {/* TABS */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'SOBRE' && styles.activeTab]} onPress={() => setActiveTab('SOBRE')}>
                    <Text style={[styles.tabText, activeTab === 'SOBRE' && styles.activeTabText]}>Sobre</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'POSTS' && styles.activeTab]} onPress={() => setActiveTab('POSTS')}>
                    <Text style={[styles.tabText, activeTab === 'POSTS' && styles.activeTabText]}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'HISTORICO' && styles.activeTab]} onPress={() => setActiveTab('HISTORICO')}>
                    <Text style={[styles.tabText, activeTab === 'HISTORICO' && styles.activeTabText]}>Histórico</Text>
                </TouchableOpacity>
            </View>

            {/* TAB CONTENT: SOBRE */}
            {activeTab === 'SOBRE' && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sobre</Text>
                        <Text style={styles.description}>
                            {profileUser.description || (profileUser.role === 'EMPLOYER' ? 'Este empregador não adicionou uma descrição.' : 'Este profissional ainda não adicionou uma descrição ao seu perfil.')}
                        </Text>
                    </View>

                    {profileUser.role === 'WORKER' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Especialidades / Tipos de Trabalho</Text>
                            <View style={styles.chips}>
                                {profileUser.work_types?.length > 0 ? profileUser.work_types.map((type, index) => (
                                    <View key={index} style={styles.chip}>
                                        <Text style={styles.chipText}>{type}</Text>
                                    </View>
                                )) : <Text style={styles.emptyText}>Nenhuma especialidade listada</Text>}
                            </View>
                        </View>
                    )}

                    {profileUser.role === 'WORKER' && profileUser.skills && profileUser.skills.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Habilidades Adicionais</Text>
                            <View style={styles.chips}>
                                {profileUser.skills.map((skill, index) => (
                                    <View key={index} style={[styles.chip, { backgroundColor: Colors.info + '15' }]}>
                                        <Text style={[styles.chipText, { color: Colors.info }]}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {profileUser.role === 'WORKER' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Informações Adicionais</Text>
                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Disponibilidade</Text>
                                    <Text style={styles.infoValue}>{profileUser.availability === 'DAILY' ? 'Diarista' : 'Permanente'}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Dorme no Local</Text>
                                    <Text style={styles.infoValue}>{profileUser.can_sleep_onsite ? 'Sim' : 'Não'}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Experiência</Text>
                                    <Text style={styles.infoValue}>{profileUser.has_experience ? 'Com Experiência' : 'Iniciante'}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Bairro</Text>
                                    <Text style={styles.infoValue}>{profileUser.bairro || 'Não informado'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recomendações</Text>
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
                            <Text style={styles.emptyReviews}>Nenhuma recomendação recebida.</Text>
                        )}
                    </View>
                </>
            )}

            {/* TAB CONTENT: POSTS */}
            {activeTab === 'POSTS' && (
                <View style={{ paddingHorizontal: 0, marginTop: 10 }}>
                    {loadingPosts ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="document-text-outline" size={48} color={Colors.border} />
                            <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>Nenhuma publicação encontrada.</Text>
                        </View>
                    )}
                </View>
            )}

            {/* TAB CONTENT: HISTORICO */}
            {activeTab === 'HISTORICO' && (
                <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
                    {loadingHistory ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : userHistory.length > 0 ? (
                        userHistory.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="briefcase-outline" size={48} color={Colors.border} />
                            <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>Nenhum histórico encontrado.</Text>
                        </View>
                    )}
                </View>
            )}


            <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Denunciar Perfil</Text>
                            <TouchableOpacity onPress={() => setShowReportModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>Por que motivo deseja denunciar {profileUser.name}?</Text>
                        
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
    header: { 
        backgroundColor: Colors.white, padding: Spacing.xl, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, 
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.border, borderWidth: 3, borderColor: Colors.primary },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryBg },
    avatarInitial: { fontSize: 40, fontWeight: '700', color: Colors.primary },
    verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: Colors.primary, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
    name: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4, textAlign: 'center' },
    role: { fontSize: 15, color: Colors.primary, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    locationText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6 },
    tabContainer: { flexDirection: 'row', backgroundColor: Colors.white, marginTop: 15, borderRadius: 16, padding: 4, marginHorizontal: 15 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: Colors.primaryBg },
    tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    activeTabText: { color: Colors.primary },
    section: { backgroundColor: Colors.white, marginHorizontal: 15, marginTop: 15, padding: 20, borderRadius: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: Colors.primaryBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    infoItem: { width: '45%' },
    infoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
    infoValue: { fontSize: 14, color: Colors.text, fontWeight: '600' },
    actions: { padding: Spacing.xl },
    chatButton: { 
        backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        elevation: 8,
        ...Platform.select({
            web: { boxShadow: '0 6px 12px rgba(46,125,50,0.3)' },
            default: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 }
        })
    },
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
