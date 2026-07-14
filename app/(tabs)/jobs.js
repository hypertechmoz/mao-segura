import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert, Platform, Animated, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Jobs() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { unreadMessages, unreadNotifications } = useUnreadCount();
    const [tab, setTab] = useState('active');
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const isWeb = Platform.OS === 'web';

    // --- Header Animation (Mobile) ---
    const scrollY = useRef(new Animated.Value(0)).current;
    const TAB_BAR_HEIGHT = 48;
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

    const isEmployer = user?.role === 'EMPLOYER';

    const loadData = useCallback(async () => {
        const uid = user?.uid || user?.id;
        if (!uid) return;
        try {
            if (isEmployer) {
                // Fetch Employer's Jobs
                const { data: jobsData, error } = await supabase
                    .from('jobs')
                    .select('*, applications(count)')
                    .eq('employer_id', uid)
                    .eq('status', tab === 'active' ? 'ACTIVE' : 'CLOSED')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(jobsData || []);
            } else {
                // Fetch Worker's Applications
                let query = supabase
                    .from('applications')
                    .select('*, jobs(*, employer:employer_id(*))')
                    .eq('worker_id', uid);

                if (tab === 'pending') {
                    query = query.eq('status', 'PENDING');
                } else if (tab === 'accepted') {
                    query = query.in('status', ['ACCEPTED', 'HIRED']);
                }

                const { data, error } = await query.order('created_at', { ascending: false });
                if (error) throw error;

                // Map to match old UI structure
                const mappedData = (data || []).map(app => ({
                    ...app,
                    job: {
                        id: app.jobs?.id,
                        title: app.jobs?.title,
                        employer: { name: app.jobs?.employer?.name || 'Cliente' }
                    }
                }));
                setItems(mappedData);
            }
        } catch (err) {
            console.warn('Load jobs error:', err);
        } finally {
            setInitialLoading(false);
        }
    }, [tab, isEmployer, user?.id]);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleCancel = async (appId) => {
        try {
            await supabase.from('applications').update({ status: 'CANCELLED' }).eq('id', appId);
            loadData();
        } catch (err) {
            console.error('Cancel error:', err);
            Alert.alert('Erro', err.message);
        }
    };

    const handleClose = async (jobId) => {
        try {
            await supabase.from('jobs').update({ status: 'CLOSED' }).eq('id', jobId);
            loadData();
        } catch (err) {
            console.error('Close error:', err);
            Alert.alert('Erro', err.message);
        }
    };

    const renderTabs = () => (
        <View style={styles.tabs}>
            {isEmployer ? (
                <>
                    <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
                        <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Ativas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, tab === 'closed' && styles.tabActive]} onPress={() => setTab('closed')}>
                        <Text style={[styles.tabText, tab === 'closed' && styles.tabTextActive]}>Encerradas</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
                        <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, tab === 'pending' && styles.tabActive]} onPress={() => setTab('pending')}>
                        <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>Pendentes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, tab === 'accepted' && styles.tabActive]} onPress={() => setTab('accepted')}>
                        <Text style={[styles.tabText, tab === 'accepted' && styles.tabTextActive]}>Aceites</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Content - Always visible on Web, Animated on Mobile */}
            <View style={isWeb ? styles.webHeader : styles.mobileHeaderContainer}>
                {!isWeb ? (
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
                                <Ionicons name="briefcase-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                                <Text style={styles.headerTitle}>{isEmployer ? 'Minhas Vagas' : 'Minhas Candidaturas'}</Text>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                                    <Ionicons name="search-outline" size={24} color={Colors.primary} />
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
                        {renderTabs()}
                    </Animated.View>
                ) : (
                    <View style={styles.webHeaderInner}>
                        <View style={styles.webHeaderTop}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="briefcase-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                                <Text style={styles.headerTitle}>{isEmployer ? 'Minhas Vagas' : 'Minhas Candidaturas'}</Text>
                            </View>
                            {isEmployer && (
                                <TouchableOpacity style={styles.webCreateBtn} onPress={() => router.push('/job/create')}>
                                    <Ionicons name="add" size={24} color={Colors.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {renderTabs()}
                    </View>
                )}
            </View>

            <Animated.FlatList
                data={items}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: Platform.OS !== 'web' }
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {isEmployer ? (
                            <>
                                <TouchableOpacity onPress={() => router.push(`/job/${item.id}`)}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardMeta}>
                                        <Text>{`${item.applications?.[0]?.count || 0} candidatos · `}</Text>
                                        <Ionicons name={item.status === 'ACTIVE' ? 'ellipse' : 'close-circle'} size={10} color={item.status === 'ACTIVE' ? '#4CAF50' : Colors.error} />
                                        <Text>{` ${item.status === 'ACTIVE' ? 'Ativa' : 'Encerrada'}`}</Text>
                                    </Text>
                                </TouchableOpacity>
                                {item.status === 'ACTIVE' && (
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => handleClose(item.id)}>
                                        <Text style={styles.closeBtnText}>Encerrar</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => router.push(`/job/${item.job_id || item.job?.id}`)}>
                                    <Text style={styles.cardTitle}>{item.job?.title}</Text>
                                    <Text style={styles.cardMeta}>
                                        <Text>{`${item.job?.employer?.name} · `}</Text>
                                        <Ionicons name={item.status === 'PENDING' ? 'time' : item.status === 'ACCEPTED' ? 'checkmark-circle' : item.status === 'REJECTED' ? 'close-circle' : 'remove-circle'} size={12} color={item.status === 'ACCEPTED' ? '#4CAF50' : item.status === 'PENDING' ? Colors.warning : Colors.error} />
                                        <Text>{` ${item.status === 'PENDING' ? 'Pendente' : item.status === 'ACCEPTED' ? 'Aceite' : item.status === 'REJECTED' ? 'Rejeitada' : 'Cancelada'}`}</Text>
                                    </Text>
                                </TouchableOpacity>
                                {item.status === 'PENDING' && (
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                )}
                ListEmptyComponent={() => (
                    initialLoading ? (
                        <View style={[styles.empty, { marginTop: 40 }]}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Ionicons name={isEmployer ? 'clipboard-outline' : 'document-text-outline'} size={48} color={Colors.textLight} style={{ marginBottom: Spacing.md }} />
                            <Text style={styles.emptyText}>{isEmployer ? 'Nenhuma vaga publicada' : 'Nenhuma candidatura'}</Text>
                        </View>
                    )
                )}
                contentContainerStyle={[styles.list, !isWeb && { paddingTop: HEADER_HEIGHT }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            />

            {isEmployer && (
                <TouchableOpacity style={styles.fab} onPress={() => router.push('/job/create')} activeOpacity={0.8}>
                    <Ionicons name="add" size={28} color={Colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    tabs: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    tab: { paddingVertical: 14, paddingHorizontal: 16, marginRight: 4 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
    tabText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    tabTextActive: { color: Colors.primary, fontWeight: '700' },
    list: { padding: Spacing.md, paddingBottom: 80, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    card: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm },
    cardTitle: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    cardMeta: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    closeBtn: { backgroundColor: Colors.error + '12', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
    closeBtnText: { fontSize: Fonts.sizes.sm, color: Colors.error, fontWeight: '600' },
    cancelBtn: { backgroundColor: Colors.warning + '12', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
    cancelBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
    emptyText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28,
        backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
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

    // Header Mobile (Sync with home.js)
    mobileHeaderContainer: { zIndex: 1000 },
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
    webHeader: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingTop: Spacing.md,
    },
    webHeaderInner: {
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: Spacing.md,
    },
    webHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    webCreateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    webCreateBtnText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 14,
    },
});
