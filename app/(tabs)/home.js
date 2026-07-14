import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, ScrollView, Image, ActivityIndicator, useWindowDimensions, Animated, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts, PROFESSION_CATEGORIES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/PostCard';
import JobCard from '../../components/JobCard';
import WorkerCard from '../../components/WorkerCard';
import { useAuthGuard } from '../../utils/useAuthGuard';
import { startOrGetConversation } from '../../utils/chatHelper';
import { calculateCompleteness, formatTime, formatRelativeTime } from '../../utils/profileUtils';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackHandler } from 'react-native';
import { handleError } from '../../utils/errorHandler';

// === Shared Components ===
function ProfileBanner({ completeness }) {
    const router = useRouter();
    if (completeness >= 100) return null;
    return (
        <TouchableOpacity style={styles.banner} onPress={() => router.push('/settings/edit-profile')} activeOpacity={0.8}>
            <View style={styles.bannerContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="sparkles" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.bannerText}>
                            Complete o seu perfil
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '700' }}>Finalizar ›</Text>
                </View>
                <View style={styles.progressBar}>
                    {completeness > 0 && <View style={[styles.progressFill, { width: `${completeness}%` }]} />}
                </View>
                <Text style={styles.bannerPercent}>{Math.round(completeness)}% completo</Text>
            </View>
        </TouchableOpacity>
    );
}


// === Web-Only: Left Sidebar ===
function WebLeftSidebar({ user, completeness, router }) {
    if (!user) return <View style={webStyles.leftSidebar} />;

    return (
        <View style={webStyles.leftSidebar}>
            <View style={webStyles.profileCard}>
                <View style={webStyles.profileBanner} />
                <View style={webStyles.profileCardContent}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={webStyles.profileAvatar}>
                        {user.profile_photo ? (
                            <Image source={{ uri: user.profile_photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                        ) : (
                            <Text style={webStyles.profileAvatarText}>{user.name?.[0] || '?'}</Text>
                        )}
                    </TouchableOpacity>
                    <Text style={webStyles.profileName} numberOfLines={1}>{user.name}</Text>
                    <Text style={webStyles.profileRole}>
                        {user.role === 'WORKER' ? user.profession_category || 'Profissional' : 'Cliente'}
                    </Text>
                    {user.city && (
                        <Text style={webStyles.profileLocation}>{user.city}{(user.bairro || user.province) ? `, ${user.bairro || user.province}` : ''}</Text>
                    )}
                </View>

                <View style={webStyles.profileDivider} />

                {completeness < 100 && (
                    <View style={webStyles.completenessSection}>
                        <View style={webStyles.completenessRow}>
                            <Text style={webStyles.completenessLabel}>Perfil completo</Text>
                            <Text style={webStyles.completenessValue}>{Math.round(completeness)}%</Text>
                        </View>
                        <View style={webStyles.completenessBar}>
                            <View style={[webStyles.completenessFill, { width: `${completeness}%` }]} />
                        </View>
                    </View>
                )}

                <View style={webStyles.profileDivider} />

                <TouchableOpacity style={webStyles.statRow} onPress={() => router.push('/(tabs)/network')}>
                    <View>
                        <Text style={webStyles.statLabel}>Conexões</Text>
                        <Text style={[webStyles.statLabel, { color: Colors.text, fontSize: 12 }]}>Gerir a sua rede</Text>
                    </View>
                    <Text style={[webStyles.statArrow, { color: Colors.primary, fontWeight: '700' }]}>+</Text>
                </TouchableOpacity>

                <View style={webStyles.profileDivider} />

                <TouchableOpacity style={[webStyles.statRow, { paddingVertical: 12 }]} onPress={() => router.push('/settings/premium')}>
                    <Text style={[webStyles.statLabel, { color: Colors.text }]}>
                        <Ionicons name="star" size={12} color={Colors.premium} /> Tentar Premium Grátis
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// === Web-Only: Right Sidebar (Widgets) ===
function WebRightSidebar({ router, suggestedUsers, handleContact, actionedIds }) {
    const trendingTypes = PROFESSION_CATEGORIES.slice(0, 5);

    return (
        <View style={{ flex: 1 }}>
            {/* Tips Card Redesigned */}
            <View style={webStyles.premiumWidget}>
                <View style={webStyles.premiumWidgetHeader}>
                    <View style={webStyles.bulbIconBox}>
                        <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
                    </View>
                    <Text style={webStyles.premiumWidgetTitle}>Dicas de Sucesso</Text>
                </View>
                <Text style={webStyles.premiumWidgetText}>
                    Sabia que utilizadores com o <Text style={{ fontWeight: '700' }}>perfil Completo</Text> recebem em média <Text style={{ color: Colors.primary, fontWeight: '700' }}>3x mais</Text> propostas de trabalho em Moçambique?
                </Text>
                <TouchableOpacity
                    style={webStyles.premiumWidgetBtn}
                    onPress={() => router.push('/settings/edit-profile')}
                >
                    <Text style={webStyles.premiumWidgetBtnText}>Melhorar Perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Recomendado para si */}
            {suggestedUsers && suggestedUsers.length > 0 && (
                <View style={webStyles.widget}>
                    <Text style={webStyles.widgetTitle}>Recomendado para si</Text>
                    {suggestedUsers.map((sugg, i) => {
                        const status = actionedIds?.get(sugg.id);
                        const isPending = status === 'PENDING';
                        const isConnected = status && status !== 'PENDING' && status !== 'AUTHORIZED';

                        return (
                            <View key={`sugg-${i}`} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
                                <TouchableOpacity onPress={() => router.push(`/user/${sugg.id}`)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' }}>
                                    {sugg.profile_photo ? (
                                        <Image source={{ uri: sugg.profile_photo }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                    ) : (
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary }}>{sugg.name?.[0] || '?'}</Text>
                                    )}
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity onPress={() => router.push(`/user/${sugg.id}`)}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }} numberOfLines={1}>{sugg.name}</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 11, color: Colors.textSecondary }} numberOfLines={1}>
                                        {sugg.role === 'EMPLOYER' ? 'Cliente' : (sugg.profession_category || 'Profissional')}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isConnected) {
                                                router.push(`/chat/${status}`);
                                            } else if (!isPending) {
                                                handleContact('CONTACT', sugg);
                                            }
                                        }}
                                        style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}
                                        disabled={isPending}
                                    >
                                        <Ionicons
                                            name={isConnected ? "chatbubbles" : (isPending ? "time" : "add")}
                                            size={14}
                                            color={isPending ? Colors.textLight : Colors.primary}
                                        />
                                        <Text style={{ fontSize: 12, color: isPending ? Colors.textLight : Colors.primary, fontWeight: '600', marginLeft: 4 }}>
                                            {isConnected ? 'Mensagem' : (isPending ? 'Pendente' : 'Conectar')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}



            {/* Support Links */}
            <View style={webStyles.widget}>
                <Text style={webStyles.widgetTitle}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.primary} /> Sobre e Suporte
                </Text>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/how')}>
                    <Text style={webStyles.trendText}>Como Funciona</Text>
                    <Text style={webStyles.trendSub}>Guia de utilização</Text>
                </TouchableOpacity>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/privacy')}>
                    <Text style={webStyles.trendText}>Privacidade</Text>
                    <Text style={webStyles.trendSub}>Proteção de dados</Text>
                </TouchableOpacity>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/terms')}>
                    <Text style={webStyles.trendText}>Termos de Uso</Text>
                    <Text style={webStyles.trendSub}>Contrato de plataforma</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={webStyles.footer}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => router.push('/info/help')}><Text style={webStyles.footerLink}>Ajuda</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/info/privacy')}><Text style={webStyles.footerLink}>Privacidade</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/info/terms')}><Text style={webStyles.footerLink}>Termos</Text></TouchableOpacity>
                </View>
                <Text style={webStyles.footerText}>A maior rede de contactos perto de si</Text>
                <Text style={webStyles.footerSub}>© 2026 Konekta. Todos os direitos reservados ao <Text onPress={() => Linking.openURL('https://studio-do-scott-ps2k.vercel.app/')} style={{ color: Colors.primary }}>Studio do Scott</Text>.</Text>
            </View>
        </View>
    );
}

// === Main Component ===
export default function Home() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const { unreadMessages, unreadNotifications } = useUnreadCount();
    const { requireAuth } = useAuthGuard();
    const [jobs, setJobs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [feedTab, setFeedTab] = useState('POSTS');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionedIds, setActionedIds] = useState(new Map());
    const [completeness, setCompleteness] = useState(user?.completeness || 0);
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isSmallScreen = width < 800;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // --- Pagination State ---
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 10;

    // --- Header Animation (Mobile) ---
    const scrollY = useRef(new Animated.Value(0)).current;
    const TAB_BAR_HEIGHT = 58;
    const HEADER_HEIGHT = 64 + insets.top + TAB_BAR_HEIGHT;

    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
    const headerTranslateY = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
    });

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, (HEADER_HEIGHT - TAB_BAR_HEIGHT) * 0.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const uid = user?.uid || user?.id || null;
    const userRole = user?.role || null;
    const userProvince = user?.province || null;
    const userCity = user?.city || null;

    const handleContact = useCallback(async (type, item) => {
        if (!requireAuth()) return;

        // Ensure we have a valid target ID regardless of the item source (job vs user)
        const targetId = type === 'APPLY' ? item.employer_id : (item.employer_id || item.id);
        if (uid === targetId) return;

        // Feedback imediato na UI
        setActionedIds(prev => new Map(prev).set(item.id, 'PENDING'));

        try {
            if (type === 'MESSAGE' && item.title) {
                // Job Message -> Creates candidataure silently
                const { data, error } = await supabase.rpc('apply_to_job', {
                    p_job_id: item.id,
                    p_worker_id: user.uid || user.id,
                    p_is_connected: true
                });
                if (error) throw error;
                setActionedIds(prev => new Map(prev).set(item.id, data.chat_id));
                router.push({ pathname: `/chat/${data.chat_id}`, params: { name: item.employer?.name } });
                return;
            } else if (type === 'MESSAGE') {
                const { startOrGetConversation } = await import('../../utils/chatHelper');
                const convId = await startOrGetConversation(user, targetId);
                router.push({ pathname: `/chat/${convId}`, params: { name: item.name } });
                return;
            }

            if (type === 'APPLY') {
                const { data, error } = await supabase.rpc('apply_to_job', {
                    p_job_id: item.id,
                    p_worker_id: user.uid || user.id,
                    p_is_connected: false
                });
                if (error) throw error;

                const { useAlertStore } = await import('../../store/alertStore');
                useAlertStore.getState().showAlert('Sucesso', 'Candidatura enviada para a vaga!', 'success');
                return;
            }

            if (type === 'CONTACT') {
                const { startOrGetConversation } = await import('../../utils/chatHelper');
                const convId = await startOrGetConversation(user, targetId, { last_message: 'Gostaria de falar consigo!' });

                router.push({ pathname: `/chat/${convId}`, params: { name: item.name || 'Utilizador' } });
                return;
            }

        } catch (err) {
            console.error('Error sending request:', err);
            // Reverter em caso de erro
            setActionedIds(prev => {
                const next = new Map(prev);
                next.delete(item.id);
                return next;
            });
            const { useAlertStore } = await import('../../store/alertStore');
            useAlertStore.getState().showAlert('Erro', err.message || 'Não foi possível enviar o pedido.', 'error');
        }
    }, [user, requireAuth, router]);

    const loadData = useCallback(async (isSilent = false, isLoadMore = false) => {
        if (authLoading) return;

        const currentPage = isLoadMore ? page + 1 : 0;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            if (!isSilent) setLoading(true);
            setPage(0);
            setHasMore(true);
        }

        try {
            const isWorker = !user || user?.role === 'WORKER';

            // 1. Preparar todos os pedidos para rodar em paralelo
            const queries = [];

            // [0] Feed Principal (Vagas ou Trabalhadores) - Com Paginação
            if (isWorker) {
                let jobQuery = supabase.from('jobs')
                    .select('*, employer:users!employer_id(id, name, city, province, is_verified)')
                    .eq('status', 'ACTIVE');

                if (user?.province) {
                    jobQuery = jobQuery.eq('province', user.province);
                }

                queries.push(jobQuery.order('created_at', { ascending: false }).range(from, to));
            } else {
                let workerQuery = supabase.from('users')
                    .select('id, name, city, bairro, province, profile_photo, role, worker_profiles(*)')
                    .eq('role', 'WORKER');

                if (user?.province) {
                    workerQuery = workerQuery.eq('province', user.province);
                }

                queries.push(workerQuery.order('created_at', { ascending: false }).range(from, to));
            }

            // [1] Posts - Com Paginação
            queries.push(
                supabase.from('posts')
                    .select('*, author:users!user_id(name, profile_photo, role, province)')
                    .order('created_at', { ascending: false })
                    .range(from, to)
            );

            // Pedidos específicos do utilizador (Apenas no carregamento inicial)
            if (user && uid && !isLoadMore) {
                // [2] Conversas
                queries.push(supabase.from('chat_conversations').select('*').or(`worker_id.eq.${uid},employer_id.eq.${uid}`));
                // [3] Pedidos de conexão
                queries.push(supabase.from('connection_requests').select('*').eq('sender_id', uid));
                // [4] Candidaturas
                queries.push(supabase.from('applications').select('*').eq('worker_id', uid));

                // [5] Utilizadores Sugeridos
                let sQuery = supabase.from('users').select('*').limit(15);
                if (user.province) sQuery = sQuery.eq('province', user.province);
                queries.push(sQuery);

                // [6 e 7] Dados de Perfil e Completude
                const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                queries.push(supabase.from('users').select('*').eq('id', uid).maybeSingle());
                queries.push(supabase.from(profileTable).select('*').eq('user_id', uid).maybeSingle());
            }

            // 2. Executar todos os pedidos ao mesmo tempo
            const results = await Promise.all(queries);

            const mainFeedError = results[0].error;
            if (mainFeedError) throw mainFeedError;
            let mainFeedData = results[0].data || [];

            const postsError = results[1].error;
            if (postsError) throw postsError;
            let postsData = results[1].data || [];

            // Verificar se ainda há mais dados
            if (mainFeedData.length < PAGE_SIZE && postsData.length < PAGE_SIZE) {
                setHasMore(false);
            }

            // 3. Processar resultados do Feed Principal
            if (isWorker) {
                // Manter ordenação por localização mas dentro do chunk recebido
                const userProvince = user?.province?.toLowerCase();
                const userCity = user?.city?.toLowerCase();
                mainFeedData.sort((a, b) => {
                    const locA = (userCity && a.city?.toLowerCase() === userCity ? 2 : (userProvince && a.province?.toLowerCase() === userProvince ? 1 : 0));
                    const locB = (userCity && b.city?.toLowerCase() === userCity ? 2 : (userProvince && b.province?.toLowerCase() === userProvince ? 1 : 0));
                    if (locA !== locB) return locB - locA;
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                setJobs(prev => isLoadMore ? [...prev, ...mainFeedData] : mainFeedData);
            } else {
                const flattenedWorkers = mainFeedData.map(w => ({
                    ...w,
                    ...(w.worker_profiles?.[0] || {}),
                    id: w.id
                }));
                setJobs(prev => isLoadMore ? [...prev, ...flattenedWorkers] : flattenedWorkers);
            }

            // 4. Processar Posts
            const postUserProvince = user?.province?.toLowerCase();
            const postUserCity = user?.city?.toLowerCase();

            // Filtrar posts apenas da mesma província
            let filteredPosts = postsData;
            if (postUserProvince) {
                filteredPosts = postsData.filter(p => p.author?.province?.toLowerCase() === postUserProvince);
            }

            filteredPosts.sort((a, b) => {
                const locA = (postUserCity && a.author?.city?.toLowerCase() === postUserCity ? 2 : (postUserProvince && a.author?.province?.toLowerCase() === postUserProvince ? 1 : 0));
                const locB = (postUserCity && b.author?.city?.toLowerCase() === postUserCity ? 2 : (postUserProvince && b.author?.province?.toLowerCase() === postUserProvince ? 1 : 0));
                if (locA !== locB) return locB - locA;
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setPosts(prev => isLoadMore ? [...prev, ...filteredPosts] : filteredPosts);

            // 5. Processar dados do utilizador logado (Apenas se não for Load More)
            if (user && uid && !isLoadMore) {
                let currentActionedIds = new Map();

                // Conversas [2]
                results[2].data?.forEach(d => {
                    if (d.is_authorized) {
                        if (d.job_id) currentActionedIds.set(d.job_id, d.id);
                        const otherId = user.role === 'WORKER' ? d.employer_id : d.worker_id;
                        if (otherId) currentActionedIds.set(otherId, d.id);
                    }
                });

                // Pedidos [3]
                results[3].data?.forEach(d => {
                    if (d.job_id && !currentActionedIds.has(d.job_id)) {
                        currentActionedIds.set(d.job_id, d.status === 'PENDING' ? 'PENDING' : 'AUTHORIZED');
                    }
                    if (d.receiver_id && !currentActionedIds.has(d.receiver_id)) {
                        currentActionedIds.set(d.receiver_id, d.status === 'PENDING' ? 'PENDING' : 'AUTHORIZED');
                    }
                });

                // Candidaturas [4]
                results[4].data?.forEach(d => {
                    if (d.job_id && !currentActionedIds.has(d.job_id)) {
                        currentActionedIds.set(d.job_id, d.status === 'PENDING' ? 'PENDING' : 'AUTHORIZED');
                    }
                });
                setActionedIds(currentActionedIds);

                // Sugeridos [5]
                if (!results[5].error) {
                    const filteredSugg = (results[5].data || [])
                        .filter(u => u.id !== uid && !currentActionedIds.has(u.id))
                        .slice(0, 3);
                    setSuggestedUsers(filteredSugg);
                }

                // Completude [6 e 7]
                const userData = results[6].data || {};
                const profileData = results[7].data || {};
                const finalCompleteness = calculateCompleteness(userData, profileData, user.role);
                setCompleteness(finalCompleteness);
            } else if (!user || !uid) {
                if (!isLoadMore) setCompleteness(100);
            }

            if (isLoadMore) setPage(currentPage);

        } catch (err) {
            console.error('Home load error:', err);
            if (!isSilent) handleError(err, 'Atualização de Dados');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [authLoading, uid, userRole, userProvince, userCity, page]);

    useEffect(() => {
        if (authLoading) return;
        loadData();
    }, [authLoading, uid, userRole, userProvince, userCity]);

    // Recarregar os dados de forma silenciosa sempre que a página ganhar foco
    useFocusEffect(
        useCallback(() => {
            if (authLoading) return;
            loadData(true, false);
        }, [authLoading, uid, userRole, userProvince, userCity])
    );

    useEffect(() => {
        // Handle back button on home to prevent app closing if user is on other tabs or nested
        const backAction = () => {
            if (feedTab !== 'POSTS') {
                setFeedTab('POSTS');
                return true;
            }
            return false; // Let default behavior happen (close app) if already on Home/POSTS
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [feedTab]);

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(0);
        setHasMore(true);
        await loadData(true, false);
        setRefreshing(false);
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        await loadData(true, true);
    };

    // === WEB: 3-Column Layout ===
    // Prepare mixed feed (Only include jobs if they are NOT user profiles. i.e., they have a title property)
    const mixedFeed = useMemo(() => {
        return [...posts, ...jobs.filter(j => j.title)].sort((a, b) => {
            const dateA = new Date(a.created_at?.seconds ? a.created_at.seconds * 1000 : a.created_at);
            const dateB = new Date(b.created_at?.seconds ? b.created_at.seconds * 1000 : b.created_at);
            return dateB - dateA;
        });
    }, [posts, jobs]);

    if (isWeb) {
        return (
            <View style={[webStyles.webContainer, { height: '100vh', overflow: 'hidden' }]}>
                <View style={[webStyles.threeCol, isSmallScreen ? { flexDirection: 'column', maxWidth: 600, alignItems: 'center' } : {}, { flex: 1 }]}>
                    {!isSmallScreen && (
                        <View style={{ width: 225 }}>
                            <WebLeftSidebar user={user} completeness={completeness} router={router} />
                        </View>
                    )}

                    {/* Center Feed */}
                    <View style={webStyles.centerFeed}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                            {loading ? (
                                <View style={{ paddingVertical: 100, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <Text style={{ marginTop: 16, color: Colors.textSecondary, fontWeight: '500' }}>Carregando atualizações...</Text>
                                </View>
                            ) : (
                                <>
                                    {completeness < 100 && (
                                        <View style={[webStyles.feedGreetingCard, { paddingVertical: 16 }]}>
                                            <View style={webStyles.feedProgressSection}>
                                                <View style={webStyles.feedProgressInfo}>
                                                    <Text style={webStyles.feedProgressLabel}>
                                                        <Ionicons name="sparkles" size={14} color={Colors.primary} /> Perfil {Math.round(completeness)}% completo
                                                    </Text>
                                                    <TouchableOpacity onPress={() => router.push('/settings/edit-profile')}>
                                                        <Text style={webStyles.feedProgressAction}>Finalizar perfil ›</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={webStyles.feedProgressBar}>
                                                    {completeness > 0 && <View style={[webStyles.feedProgressFill, { width: `${completeness}%` }]} />}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Create Post / Job Button */}
                                    {(user?.role === 'EMPLOYER' || feedTab === 'POSTS') && (
                                        <TouchableOpacity
                                            style={webStyles.createJobBox}
                                            onPress={() => {
                                                if (requireAuth()) {
                                                    router.push(feedTab === 'POSTS' ? (user.role === 'EMPLOYER' ? '/job/create' : '/post/create') : '/job/create');
                                                }
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={webStyles.webAvatarIcon}>
                                                {user?.profile_photo ? (
                                                    <Image source={{ uri: user.profile_photo }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                                                ) : (
                                                    <Text style={webStyles.webAvatarIconText}>{user?.name?.[0] || '?'}</Text>
                                                )}
                                            </View>
                                            <View style={webStyles.createJobInput}>
                                                <Text style={webStyles.createJobPlaceholder}>
                                                    {feedTab === 'POSTS' ? 'Começar uma publicação...' : 'Publicar uma nova vaga...'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {/* Sort bar & Tabs */}
                                    <View style={webStyles.tabContainerWeb}>
                                        <TouchableOpacity style={[webStyles.tabBtnWeb, feedTab === 'POSTS' && webStyles.tabBtnWebActive]} onPress={() => setFeedTab('POSTS')}>
                                            <Text style={[webStyles.tabBtnTextWeb, feedTab === 'POSTS' && webStyles.tabBtnWebActive]}>Atualizações</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[webStyles.tabBtnWeb, feedTab === 'OPORTUNIDADES' && webStyles.tabBtnWebActive]} onPress={() => setFeedTab('OPORTUNIDADES')}>
                                            <Text style={[webStyles.tabBtnTextWeb, feedTab === 'OPORTUNIDADES' && webStyles.tabBtnWebActive]}>
                                                {user?.role === 'WORKER' ? 'Vagas Recentes' : 'Recomendações'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {(feedTab === 'POSTS' ? mixedFeed : jobs).length === 0 ? (
                                        <View style={styles.empty}>
                                            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} style={{ marginBottom: 16 }} />
                                            <Text style={styles.emptyText}>Nenhuma informação disponível</Text>
                                            <Text style={styles.emptySubtext}>Não há atualizações para mostrar agora.</Text>
                                        </View>
                                    ) : (
                                        (feedTab === 'POSTS' ? mixedFeed : jobs).map(item => {
                                            if ('user_id' in item) {
                                                return <PostCard key={`post-${item.id}`} post={item} connectionStatusProp={actionedIds.get(item.user_id)} />;
                                            } else {
                                                return (!user || user.role === 'WORKER')
                                                    ? <JobCard key={`job-${item.id}`} job={item} onPress={handleContact} userLocation={user} isApplied={actionedIds.get(item.id)} />
                                                    : <WorkerCard key={`worker-${item.id}`} worker={item} onPress={handleContact} userLocation={user} isContacted={actionedIds.get(item.id)} />;
                                            }
                                        })
                                    )}

                                    {hasMore && (
                                        <TouchableOpacity
                                            style={webStyles.loadMoreBtn}
                                            onPress={handleLoadMore}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={webStyles.loadMoreText}>Carregar mais</Text>}
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>

                    {!isSmallScreen && (
                        <View style={webStyles.rightSidebar}>
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                                <WebRightSidebar router={router} suggestedUsers={suggestedUsers} handleContact={handleContact} actionedIds={actionedIds} />
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // Mobile Mixed Feed preparation (Only include jobs if they are NOT user profiles)
    const mobileMixedFeed = useMemo(() => {
        return [...posts, ...jobs.filter(j => j.title)].sort((a, b) => {
            const dateA = new Date(a.created_at?.seconds ? a.created_at.seconds * 1000 : a.created_at);
            const dateB = new Date(b.created_at?.seconds ? b.created_at.seconds * 1000 : b.created_at);
            return dateB - dateA;
        });
    }, [posts, jobs]);

    // === MOBILE: Single column (unchanged) ===
    return (
        <View style={styles.container}>
            {/* Custom Animated Header (Mobile) */}
            {!isWeb && (
                <Animated.View style={[
                    styles.mobileHeader,
                    {
                        height: HEADER_HEIGHT,
                        paddingTop: insets.top,
                        transform: [{ translateY: headerTranslateY }],
                    }
                ]}>
                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.headerTitle}>Konekta</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/search')} style={styles.headerIconBtn}>
                                <Ionicons name="search-outline" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/messages')} style={styles.headerIconBtn}>
                                <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
                                {unreadMessages > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={styles.headerIconBtn}>
                                <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
                                {unreadNotifications > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Integrated Mobile Switch Tabs */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchBackground}>
                            <TouchableOpacity
                                style={[styles.switchBtn, feedTab === 'POSTS' && styles.switchBtnActive]}
                                onPress={() => setFeedTab('POSTS')}
                            >
                                <Text style={[styles.switchBtnText, feedTab === 'POSTS' && styles.switchBtnTextActive]}>Atualizações</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.switchBtn, feedTab === 'OPORTUNIDADES' && styles.switchBtnActive]}
                                onPress={() => setFeedTab('OPORTUNIDADES')}
                            >
                                <Text style={[styles.switchBtnText, feedTab === 'OPORTUNIDADES' && styles.switchBtnTextActive]}>
                                    {user?.role === 'WORKER' ? 'Vagas' : 'Profissionais'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={feedTab === 'POSTS' ? mobileMixedFeed : jobs}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: Platform.OS !== 'web' }
                    )}
                    ListHeaderComponent={() => (
                        <View>
                            <ProfileBanner completeness={completeness} />
                        </View>
                    )}
                    renderItem={({ item }) => {
                        if (feedTab === 'POSTS') {
                            if ('user_id' in item) {
                                return <PostCard key={`post-${item.id}`} post={item} connectionStatusProp={actionedIds.get(item.user_id)} />;
                            } else {
                                return (!user || user.role === 'WORKER')
                                    ? <JobCard job={item} onPress={handleContact} userLocation={user} isApplied={actionedIds.get(item.id)} />
                                    : <WorkerCard worker={item} onPress={handleContact} userLocation={user} isContacted={actionedIds.get(item.id)} />;
                            }
                        }
                        return (!user || user.role === 'WORKER')
                            ? <JobCard job={item} onPress={handleContact} userLocation={user} isApplied={actionedIds.has(item.id)} />
                            : <WorkerCard worker={item} onPress={handleContact} userLocation={user} isContacted={actionedIds.has(item.id)} />
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>Nenhuma informação</Text>
                            <Text style={styles.emptySubtext}>Volte mais tarde para ver atualizações</Text>
                        </View>
                    )}
                    contentContainerStyle={[styles.list, !isWeb && { paddingTop: HEADER_HEIGHT + 16, paddingBottom: insets.bottom + 100 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (
                        loadingMore ? (
                            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={Colors.primary} />
                            </View>
                        ) : null
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

// === Mobile Styles ===
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    greeting: { marginBottom: Spacing.md },
    greetingText: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    greetingSubtext: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    banner: {
        backgroundColor: Colors.primary + '10',
        borderRadius: 16, padding: Spacing.md,
        marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '20',
    },
    bannerContent: {},
    bannerText: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '500', marginBottom: 8 },
    progressBar: { height: 6, backgroundColor: Colors.primary + '20', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
    bannerPercent: { fontSize: Fonts.sizes.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
    createButton: {
        backgroundColor: Colors.primary, borderRadius: 14,
        paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.md,
    },
    createButtonText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' },
    workerMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },

    // Switch Styles
    switchWrapper: {
        paddingHorizontal: Spacing.md,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: Colors.white,
    },
    switchBackground: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    switchBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 22,
    },
    switchBtnActive: {
        backgroundColor: Colors.white,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        }),
    },
    switchBtnText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    switchBtnTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },

    // Header Mobile
    mobileHeader: {
        backgroundColor: Colors.white,
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        justifyContent: 'flex-end',
    },
    headerContent: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    headerLogo: { width: 32, height: 32, borderRadius: 8, marginRight: 8 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary },
    headerActions: { flexDirection: 'row', gap: 12 },
    headerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    headerBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        zIndex: 10,
    },
    headerBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

// === Web-Only Styles ===
const webStyles = StyleSheet.create({
    webContainer: { flex: 1, backgroundColor: Colors.background },
    webContentContainer: { alignItems: 'center', paddingTop: 8, paddingBottom: 40 },
    threeCol: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 1300,
        marginHorizontal: 'auto',
        gap: 32,
        paddingHorizontal: 24,
    },

    // Left Sidebar
    leftSidebar: { width: 225 },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        overflow: 'hidden',
        marginBottom: 8,
    },
    profileBanner: {
        height: 56,
        backgroundColor: Colors.primary,
        backgroundImage: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%)`,
    },
    profileCardContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginTop: -24,
    },
    profileAvatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.white,
        marginBottom: 8,
    },
    profileAvatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
    profileName: { fontSize: 15, fontWeight: '700', color: Colors.text, textAlign: 'center' },
    profileRole: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
    profileLocation: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
    completenessSection: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    completenessRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    completenessLabel: { fontSize: 12, color: Colors.textSecondary },
    completenessValue: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    completenessBar: { height: 4, backgroundColor: Colors.primary + '20', borderRadius: 2, overflow: 'hidden' },
    completenessFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
    profileDivider: { height: 1, backgroundColor: Colors.borderLight },
    statRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    statArrow: { fontSize: 16, color: Colors.textLight },

    quickLinks: {
        backgroundColor: Colors.white, borderRadius: 8,
        borderWidth: 1, borderColor: '#E0DFDC',
        paddingVertical: 4,
    },
    quickLink: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    quickLinkIcon: { fontSize: 16, marginRight: 10 },
    quickLinkText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

    // Center Feed
    centerFeed: { flex: 1, maxWidth: 800 },
    feedGreetingCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0DFDC',
    },
    feedGreetingTop: {},
    feedGreetingTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
    loadMoreBtn: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    loadMoreText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    feedGreetingSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

    feedProgressSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    feedProgressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    feedProgressLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    feedProgressAction: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    feedProgressBar: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
    feedProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },

    createJobBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.white, borderRadius: 8,
        borderWidth: 1, borderColor: '#E0DFDC',
        padding: 12, marginBottom: 16,
    },
    webAvatarIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    webAvatarIconText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
    createJobInput: {
        flex: 1, backgroundColor: 'transparent',
        borderWidth: 1, borderColor: '#C7C5C1',
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    },
    createJobPlaceholder: { fontSize: 14, color: Colors.textLight },

    sortBar: {
        flexDirection: 'row', alignItems: 'center',
        marginVertical: 12,
    },
    sortLine: { flex: 1, height: 1, backgroundColor: '#E0DFDC' },
    sortText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8 },

    // Right Sidebar
    rightSidebar: { width: 300, flexShrink: 0 },
    widget: {
        backgroundColor: Colors.white, borderRadius: 12,
        borderWidth: 1, borderColor: '#E0DFDC',
        paddingVertical: 12, marginBottom: 8,
    },
    premiumWidget: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            },
            default: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            }
        }),
    },
    premiumWidgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bulbIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    premiumWidgetTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
    premiumWidgetText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 16 },
    premiumWidgetBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    premiumWidgetBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
    widgetTitle: {
        fontSize: 15, fontWeight: '700', color: Colors.text,
        paddingHorizontal: 16, marginBottom: 8,
    },
    trendItem: {
        paddingHorizontal: 16, paddingVertical: 8,
    },
    trendText: { fontSize: 13, fontWeight: '600', color: Colors.text },
    trendSub: { fontSize: 11, color: Colors.textLight, marginTop: 1 },

    footer: {
        paddingVertical: 16, paddingHorizontal: 16,
    },
    footerText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    footerSub: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
    footerLink: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    tabContainerWeb: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0DFDC' },
    tabBtnWeb: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabBtnWebActive: { borderBottomColor: Colors.primary },
    tabBtnTextWeb: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
    tabBtnTextWebActive: { color: Colors.primary },
    headerBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        zIndex: 10,
    },
    headerBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});