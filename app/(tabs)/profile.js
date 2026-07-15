import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl, Platform, Image, ActivityIndicator, Animated, Linking } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { calculateCompleteness } from '../../utils/profileUtils';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { sendPushNotification } from '../../services/notificationService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import JobCard from '../../components/JobCard';

export default function Profile() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { unreadMessages, unreadNotifications } = useUnreadCount();
    const { user, logout } = useAuthStore();
    const { expoPushToken } = usePushNotifications();
    const [profile, setProfile] = useState(null);
    const [completeness, setCompleteness] = useState(0);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Tab and Activity State
    const [activeTab, setActiveTab] = useState('SOBRE');
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [userHistory, setUserHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const insets = useSafeAreaInsets();
    const isWeb = Platform.OS === 'web';

    // --- Header Animation (Mobile) ---
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_HEIGHT = 64 + insets.top;

    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
    const headerTranslateY = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
    });

    const isOwnProfile = useMemo(() => {
        if (!user) return false;
        if (!id) return true;
        return id === user.uid;
    }, [id, user?.uid]);

    const getRelationRecord = (value) => {
        if (!value) return null;
        return Array.isArray(value) ? value[0] || null : value;
    };

    const load = useCallback(async () => {
        const targetId = id || user?.uid || user?.id;
        if (!targetId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch core user doc with profiles
            const { data: userData, error } = await supabase
                .from('users')
                .select('*, worker_profiles(*), employer_profiles(*)')
                .eq('id', targetId)
                .single();

            if (error || !userData) throw new Error('User not found');

            const workerProfile = getRelationRecord(userData.worker_profiles);
            const employerProfile = getRelationRecord(userData.employer_profiles);
            const profileData = userData.role === 'EMPLOYER'
                ? employerProfile
                : workerProfile;

            // Set aggregate profile info
            const p = {
                ...userData,
                workerProfile,
                employerProfile,
                profile_photo: profileData?.profile_photo || userData.profile_photo || null
            };

            // Calculate Completeness (only for self)
            if (isOwnProfile) {
                const mergedData = { ...userData, ...profileData };
                setCompleteness(calculateCompleteness(userData, profileData || {}, userData.role));
            }

            // Get Connections Count
            const { count } = await supabase
                .from('connections')
                .select('*', { count: 'exact', head: true })
                .or(`user1_id.eq.${targetId},user2_id.eq.${targetId}`);
            setConnectionsCount(count || 0);

            setProfile(p);
        } catch (err) {
            console.error('Profile error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, user?.id, id]);


    const checkConnection = useCallback(async () => {
        const uid = user?.uid || user?.id;
        if (!uid || !id) return;
        try {
            const { data: reqData } = await supabase
                .from('connection_requests')
                .select('id')
                .or(`and(sender_id.eq.${uid},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${uid})`)
                .eq('status', 'PENDING')
                .maybeSingle();
            if (reqData) setHasPendingRequest(true);

            const { data: connData } = await supabase
                .from('connections')
                .select('id')
                .or(`and(user1_id.eq.${uid},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${uid})`)
                .maybeSingle();
            if (connData) setIsConnected(true);
        } catch (e) {
            console.log(e);
        }
    }, [user?.id, id]);

    const loadPosts = useCallback(async () => {
        const targetId = id || user?.uid || user?.id;
        if (!targetId) return;
        setLoadingPosts(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`*, author:users!posts_user_id_fkey(name, role, profile_photo, is_verified, is_premium)`)
                .eq('user_id', targetId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setUserPosts(data || []);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    }, [id, user?.uid, user?.id]);

    const loadHistory = useCallback(async () => {
        const targetId = id || user?.uid || user?.id;
        if (!targetId || !user) return;
        setLoadingHistory(true);
        try {
            if (user.role === 'WORKER') {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id, status, created_at,
                        job:jobs(*, employer:users!jobs_employer_id_fkey(name, profile_photo, is_verified, is_premium))
                    `)
                    .eq('worker_id', targetId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setUserHistory(data || []);
            } else {
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`*, employer:users!jobs_employer_id_fkey(name, profile_photo, is_verified, is_premium)`)
                    .eq('employer_id', targetId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setUserHistory(data || []);
            }
        } catch (err) {
            console.error('Error fetching user history:', err);
        } finally {
            setLoadingHistory(false);
        }
    }, [id, user?.uid, user?.id, user?.role]);

    useEffect(() => {
        if (activeTab === 'POSTS') loadPosts();
        if (activeTab === 'HISTORICO') loadHistory();
    }, [activeTab, loadPosts, loadHistory]);

    useFocusEffect(
        useCallback(() => {
            load();
            checkConnection();
        }, [load, checkConnection])
    );

    const onRefresh = async () => { 
        setRefreshing(true); 
        await load(); 
        if (activeTab === 'POSTS') await loadPosts();
        if (activeTab === 'HISTORICO') await loadHistory();
        setRefreshing(false); 
    };

    const handleLogout = () => {
        const performLogout = async () => {
            try {
                router.replace('/auth/login');
                logout();
            } catch (err) {
                console.error('Logout error:', err);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Tem certeza que deseja sair?')) {
                performLogout();
            }
        } else {
            Alert.alert('Sair', 'Tem certeza que deseja sair?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: performLogout },
            ]);
        }
    };

    const { t, i18n } = useTranslation();

    if (loading && !refreshing) {
        return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    const p = profile || user;

    const toggleLanguage = () => {
        const nextLng = i18n.language === 'pt' ? 'en' : 'pt';
        i18n.changeLanguage(nextLng);
    };

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
                            <Ionicons name="person-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                            <Text style={styles.headerTitle}>{t('tabs.profile')}</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                                <Ionicons name="search-outline" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={{ position: 'relative' }}>
                                <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
                                {unreadNotifications > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}

            <Animated.ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, !isWeb && { marginTop: HEADER_HEIGHT }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: Platform.OS !== 'web' }
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >
                <View style={styles.header}>
                    <View style={styles.avatarLarge}>
                        {p?.profile_photo ? (
                            <Image source={{ uri: p.profile_photo }} style={styles.avatarLargeImage} />
                        ) : (
                            <Text style={styles.avatarText}>{p?.name?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Text style={[styles.name, { marginBottom: 0 }]}>{p?.name}</Text>
                        {p?.is_verified && (
                            <MaterialIcons name="verified" size={24} color={Colors.primary} />
                        )}
                    </View>
                    <View style={styles.badges}>
                        {p?.is_premium && (
                            <View style={[styles.badge, styles.premiumBadge]}>
                                <Text style={[styles.badgeText, styles.premiumText]}>⭐ {t('common.premium')}</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.location}>{p?.city || 'Moçambique'}, {p?.bairro || ''}</Text>
                    </View>

                    {/* Stats Section */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 24, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 20 }}>
                        <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text }}>{connectionsCount || 0}</Text>
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>Conexões</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: Colors.borderLight, height: 40 }} />
                        <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text }}>{p?.rating_count || 0}</Text>
                                {p?.rating_avg > 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFB800' }}>⭐ {p.rating_avg.toFixed(1)}</Text>}
                            </View>
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>Recomendações</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs UI */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'SOBRE' && styles.tabButtonActive]} 
                        onPress={() => setActiveTab('SOBRE')}
                    >
                        <Text style={[styles.tabText, activeTab === 'SOBRE' && styles.tabTextActive]}>Sobre</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'POSTS' && styles.tabButtonActive]} 
                        onPress={() => setActiveTab('POSTS')}
                    >
                        <Text style={[styles.tabText, activeTab === 'POSTS' && styles.tabTextActive]}>Posts</Text>
                    </TouchableOpacity>
                    {isOwnProfile && (
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'HISTORICO' && styles.tabButtonActive]} 
                            onPress={() => setActiveTab('HISTORICO')}
                        >
                            <Text style={[styles.tabText, activeTab === 'HISTORICO' && styles.tabTextActive]}>Histórico</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Content: SOBRE */}
                {activeTab === 'SOBRE' && (
                    <View style={{ marginTop: Spacing.md }}>
                        {completeness < 100 && isOwnProfile && (
                    <TouchableOpacity
                        style={styles.completeBanner}
                        onPress={() => router.push('/settings/edit-profile')}
                        activeOpacity={0.8}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={[styles.completeText, { marginBottom: 0 }]}>
                                {t('profile.completeness', { percent: Math.round(completeness) })}
                            </Text>
                            <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '700' }}>Finalizar ›</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${completeness}%` }]} />
                        </View>
                    </TouchableOpacity>
                )}

                {isOwnProfile && p?.role === 'EMPLOYER' && (
                    <View style={[styles.section, styles.tipsCard]}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb" size={20} color={Colors.warning} />
                            <Text style={styles.tipsTitle}>{t('profile.tips_employer')}</Text>
                        </View>
                        <Text style={styles.tipsText}>• Respostas rápidas: Os profissionais valorizam empregadores que os respondem rapidamente no chat.</Text>
                        <Text style={styles.tipsText}>• Confiança: Empregadores com perfil completamente preenchido e com nome real inspiram 3x mais confiança.</Text>
                        <Text style={styles.tipsText}>• Clareza: Quanto mais pormenores partilhar na hora de publicar uma vaga, maior será a adesão.</Text>
                    </View>
                )}

                {isOwnProfile && p?.role === 'WORKER' && (
                    <View style={[styles.section, styles.tipsCard]}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="rocket" size={20} color={Colors.warning} />
                            <Text style={styles.tipsTitle}>{t('profile.tips_worker')}</Text>
                        </View>
                        <Text style={styles.tipsText}>• Profissionais com um perfil a 100% (com nome real e especializações detalhadas) aumentam as suas hipóteses de serem contactados.</Text>
                        <Text style={styles.tipsText}>• Preencha o "Sobre Mim" com as suas melhores qualidades. Empregadores preferem quem partilha experiências.</Text>
                        <Text style={styles.tipsText}>• Seja sempre pontual e ofereça excelência de forma a ser novamente contratado.</Text>
                    </View>
                )}

                {p?.role === 'WORKER' && p?.workerProfile && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('common.professional_info')}</Text>
                        {p.workerProfile.work_types && p.workerProfile.work_types.length > 0 ? (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tipos de trabalho</Text>
                                <View style={styles.tags}>
                                    {p.workerProfile.work_types.map((t, i) => (
                                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                                    ))}
                                </View>
                            </View>
                        ) : null}
                        {p.workerProfile.skills && p.workerProfile.skills.length > 0 ? (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Habilidades Adicionais</Text>
                                <View style={styles.tags}>
                                    {p.workerProfile.skills.map((s, i) => (
                                        <View key={i} style={[styles.tag, { backgroundColor: Colors.info + '15' }]}><Text style={[styles.tagText, { color: Colors.info }]}>{s}</Text></View>
                                    ))}
                                </View>
                            </View>
                        ) : null}
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Disponibilidade</Text>
                            <Text style={styles.infoValue}>
                                {p.workerProfile.availability === 'IMMEDIATE' ? 'Imediata' :
                                    p.workerProfile.availability === 'TEMPORARY' ? 'Temporário' :
                                        p.workerProfile.availability === 'DAILY' ? 'Diarista' :
                                            p.workerProfile.availability === 'PERMANENT' ? 'Permanente' : 'Não definida'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pode dormir no local</Text>
                            <Text style={styles.infoValue}>{p.workerProfile.can_sleep_on_site ? 'Sim' : 'Não'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Experiência</Text>
                            <Text style={styles.infoValue}>{p.workerProfile.has_experience ? 'Sim' : 'Não'}</Text>
                        </View>
                        {!!p.workerProfile.description && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Sobre mim</Text>
                                <Text style={styles.infoValue}>{p.workerProfile.description}</Text>
                            </View>
                        )}
                    </View>
                )}

                {isOwnProfile ? (
                    <View style={styles.menu}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/edit-profile')}>
                            <Ionicons name="create-outline" size={20} color={Colors.text} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.menuText}>{t('common.edit_profile')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/premium')}>
                            <Ionicons name="star-outline" size={20} color={Colors.premium} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.menuText}>{t('common.premium')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/testimonial')}>
                            <Ionicons name="chatbox-ellipses-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.menuText}>{t('profile.submit_testimonial')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>

                        {/* Language Switcher */}
                        <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
                            <Ionicons name="globe-outline" size={20} color={Colors.info} style={{ marginRight: Spacing.sm }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuText}>
                                    {i18n.language === 'pt' ? t('common.pt_label') : t('common.en_label')}
                                </Text>
                                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                                    {i18n.language === 'pt' ? 'Clique para mudar para Inglês' : 'Click to change to Portuguese'}
                                </Text>
                            </View>
                            <View style={styles.langBadge}>
                                <Text style={styles.langBadgeText}>{i18n.language.toUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/info/help')}>
                            <Ionicons name="help-circle-outline" size={20} color={Colors.text} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.menuText}>{t('common.help')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/info/terms')}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.text} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.menuText}>{t('common.terms')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                        {/* Admin Dashboard */}
                        {(user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'fernandopinto@gmail.com' || user?.email?.toLowerCase() === 'frennadopinto@gmil.com') && isOwnProfile && (
                            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/users')}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                                <Text style={styles.menuText}>Dashboard do Administrador</Text>
                                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.error} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.menuText, styles.logoutText]}>{t('common.logout')}</Text>
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xs }}>
                            <Text style={{ fontSize: 12, color: Colors.textLight }}>Konekta v1.0.1</Text>
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>Desenvolvido por <Text onPress={() => Linking.openURL('https://studio-do-scott-ps2k.vercel.app/')} style={{ fontWeight: '700', color: Colors.primary }}>Studio do Scott</Text></Text>
                        </View>
                    </View>
                ) : (!user || p?.id !== user?.uid) && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[
                                styles.chatButton,
                                { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primary, marginBottom: 12 },
                                (isConnected || hasPendingRequest) && { borderColor: Colors.border, backgroundColor: Colors.borderLight }
                            ]}
                            onPress={async () => {
                                if (!user || !p?.id) { router.push('/auth/login'); return; }
                                if (isConnected || hasPendingRequest || processing) return;
                                if (p?.id === user?.uid || p?.id === user?.id) return; // Segurança extra

                                setProcessing(true);
                                try {
                                    const { sendConnectionRequest } = await import('../../utils/chatSecureHelper');
                                    await sendConnectionRequest(user, p.id, { type: 'CONTACT' });
                                    setHasPendingRequest(true);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setProcessing(false);
                                }
                            }}
                            disabled={isConnected || hasPendingRequest || processing || !p?.id || p?.id === (user?.uid || user?.id)}
                            activeOpacity={0.8}
                        >
                            {processing ? (
                                <ActivityIndicator size="small" color={Colors.primary} />
                            ) : (
                                <>
                                    <Ionicons
                                        name={isConnected ? "checkmark-circle" : (hasPendingRequest ? "time" : "person-add")}
                                        size={22}
                                        color={isConnected || hasPendingRequest ? Colors.textSecondary : Colors.primary}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={[styles.chatButtonText, { color: isConnected || hasPendingRequest ? Colors.textSecondary : Colors.primary }]}>
                                        {isConnected ? 'Conectados' : (hasPendingRequest ? 'Pedido Enviado' : 'Conectar')}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={async () => {
                                if (!user) {
                                    router.push('/auth/login');
                                    return;
                                }
                                try {
                                    if (!user || !p?.id) return;
                                    const { sendConnectionRequest } = await import('../../utils/chatSecureHelper');
                                    await sendConnectionRequest(user, p.id, {
                                        type: p.role === 'WORKER' ? 'CONTACT' : 'APPLY'
                                    });
                                    setHasPendingRequest(true);
                                } catch (err) {
                                    console.error('Error starting chat:', err);
                                }
                            }}
                        >
                            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.chatButtonText}>Contactar {p?.role === 'WORKER' ? 'Profissional' : 'Cliente'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                </View>
                )}

                {/* Tab Content: POSTS */}
                {activeTab === 'POSTS' && (
                    <View style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.md }}>
                        {loadingPosts ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
                        ) : userPosts.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.border} />
                                <Text style={styles.emptyText}>Sem publicações ainda.</Text>
                            </View>
                        ) : (
                            userPosts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    connectionStatusProp={isConnected ? 'CONNECTED' : (hasPendingRequest ? 'PENDING' : null)}
                                    onDelete={(id) => setUserPosts(prev => prev.filter(p => p.id !== id))}
                                    onUpdate={(id, content) => setUserPosts(prev => prev.map(p => p.id === id ? { ...p, content } : p))}
                                />
                            ))
                        )}
                    </View>
                )}

                {/* Tab Content: HISTORICO */}
                {activeTab === 'HISTORICO' && isOwnProfile && (
                    <View style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.md }}>
                        {loadingHistory ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
                        ) : userHistory.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="time-outline" size={48} color={Colors.border} />
                                <Text style={styles.emptyText}>Nenhum histórico disponível.</Text>
                            </View>
                        ) : (
                            p?.role === 'WORKER' ? (
                                userHistory.map(app => (
                                    <View key={app.id} style={styles.historyCard}>
                                        <View style={[styles.historyStatusBadge, 
                                            app.status === 'HIRED' ? { backgroundColor: Colors.success + '20' } : 
                                            app.status === 'REJECTED' ? { backgroundColor: Colors.error + '20' } : 
                                            { backgroundColor: Colors.warning + '20' }
                                        ]}>
                                            <Text style={[styles.historyStatusText,
                                                app.status === 'HIRED' ? { color: Colors.success } : 
                                                app.status === 'REJECTED' ? { color: Colors.error } : 
                                                { color: Colors.warning }
                                            ]}>
                                                {app.status === 'HIRED' ? 'Contratado / Concluído' : app.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                                            </Text>
                                        </View>
                                        {app.job && <JobCard job={app.job} hideActions={true} />}
                                    </View>
                                ))
                            ) : (
                                userHistory.map(job => (
                                    <View key={job.id} style={styles.historyCard}>
                                        <View style={[styles.historyStatusBadge, 
                                            job.status === 'ACTIVE' ? { backgroundColor: Colors.success + '20' } : 
                                            { backgroundColor: Colors.borderLight }
                                        ]}>
                                            <Text style={[styles.historyStatusText,
                                                job.status === 'ACTIVE' ? { color: Colors.success } : 
                                                { color: Colors.textSecondary }
                                            ]}>
                                                {job.status === 'ACTIVE' ? 'Vaga Ativa' : 'Encerrada'}
                                            </Text>
                                        </View>
                                        <JobCard job={job} hideActions={true} />
                                    </View>
                                ))
                            )
                        )}
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}) },
    header: {
        backgroundColor: Colors.white, paddingVertical: Spacing.xl, alignItems: 'center',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        marginBottom: Spacing.md,
    },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    avatarLargeImage: { width: 80, height: 80, borderRadius: 40 },
    avatarText: { fontSize: 32, fontWeight: '700', color: Colors.primary },
    name: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    legalLinksRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    legalLink: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    badges: { flexDirection: 'row', gap: 8, marginTop: 6 },
    badge: { backgroundColor: Colors.primaryBg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600' },
    premiumBadge: { backgroundColor: Colors.premium + '20' },
    premiumText: { color: Colors.premium },
    role: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
    location: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    completeBanner: {
        backgroundColor: Colors.primary + '10', borderRadius: 14, padding: Spacing.md, marginHorizontal: Spacing.md,
        marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '20',
    },
    completeText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.primary, marginBottom: 8 },
    progressBar: { height: 6, backgroundColor: Colors.primary + '20', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
    section: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.md },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
    tabsContainer: { flexDirection: 'row', backgroundColor: Colors.white, marginTop: 15, borderRadius: 16, padding: 4, marginHorizontal: 15 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    tabButtonActive: { backgroundColor: Colors.primaryBg },
    tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    tabTextActive: { color: Colors.primary, fontWeight: '700' },
    infoRow: { marginBottom: Spacing.sm },
    infoLabel: { fontSize: Fonts.sizes.xs, color: Colors.textLight, fontWeight: '500', marginBottom: 2 },
    infoValue: { fontSize: Fonts.sizes.sm, color: Colors.text },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    tag: { backgroundColor: Colors.primaryBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '500' },
    menu: { marginHorizontal: Spacing.md },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        paddingHorizontal: Spacing.md, paddingVertical: 16, borderRadius: 14, marginBottom: Spacing.xs,
    },
    menuEmoji: { fontSize: 20, marginRight: Spacing.sm },
    menuText: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '500' },
    menuArrow: { fontSize: 20, color: Colors.textLight },
    logoutItem: { marginTop: Spacing.sm },
    logoutText: { color: Colors.error },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actions: { padding: Spacing.md },
    chatButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    chatButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    tipsCard: { backgroundColor: Colors.warning + '15', borderColor: Colors.warning + '40', borderWidth: 1, elevation: 0 },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    tipsTitle: { fontSize: Fonts.sizes.md, fontWeight: '800', color: '#B26A00' },
    tipsText: { fontSize: 13, color: Colors.text, lineHeight: 22, marginBottom: 8 },
    langBadge: { backgroundColor: Colors.info + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.info + '30' },
    langBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.info },

    // Header Mobile (Sync with home.js)
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
    headerActions: { flexDirection: 'row', gap: 16 },
});
