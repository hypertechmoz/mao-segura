import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert, Platform, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Jobs() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { unreadMessages, unreadNotifications } = useUnreadCount();
    const [tab, setTab] = useState('active');
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
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
        if (!user) return;
        try {
            if (isEmployer) {
                // Fetch Employer's Jobs
                const q = query(
                    collection(db, 'jobs'),
                    where('employer_id', '==', user.uid),
                    where('status', '==', tab === 'active' ? 'ACTIVE' : 'CLOSED'),
                    orderBy('created_at', 'desc')
                );
                const snap = await getDocs(q);
                const mappedData = snap.docs.map(d => {
                    const job = d.data();
                    return {
                        id: d.id,
                        ...job,
                        _count: { applications: job.applications_count || 0 }
                    };
                });
                setItems(mappedData);
            } else {
                // Fetch Worker's Applications
                let qArgs = [where('worker_id', '==', user.uid), orderBy('created_at', 'desc')];
                if (tab !== 'active') {
                    qArgs.push(where('status', '==', tab.toUpperCase()));
                }
                const q = query(collection(db, 'applications'), ...qArgs);
                const snap = await getDocs(q);
                
                const mappedData = [];
                const appDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Batch-fetch all jobs in parallel
                const jobIds = [...new Set(appDocs.map(a => a.job_id).filter(Boolean))];
                const jobMap = {};
                if (jobIds.length > 0) {
                    const jobSnaps = await Promise.all(jobIds.map(jid => getDoc(doc(db, 'jobs', jid))));
                    jobSnaps.forEach(s => {
                        if (s.exists()) jobMap[s.id] = { id: s.id, ...s.data() };
                    });
                }

                // Batch-fetch all employers in parallel
                const empIds = [...new Set(Object.values(jobMap).map(j => j.employer_id).filter(Boolean))];
                const empMap = {};
                if (empIds.length > 0) {
                    const empSnaps = await Promise.all(empIds.map(eid => getDoc(doc(db, 'users', eid))));
                    empSnaps.forEach(s => {
                        if (s.exists()) empMap[s.id] = s.data();
                    });
                }

                for (const app of appDocs) {
                    if (app.job_id && jobMap[app.job_id]) {
                        const jobData = jobMap[app.job_id];
                        const employerName = jobData.employer_id && empMap[jobData.employer_id]
                            ? empMap[jobData.employer_id].name
                            : 'Empregador';
                        app.job = { id: jobData.id, title: jobData.title, employer: { name: employerName } };
                    }
                    mappedData.push(app);
                }
                setItems(mappedData);
            }
        } catch (err) {
            console.warn('Load jobs error:', err);
        }
    }, [tab, isEmployer, user]);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleCancel = async (appId) => {
        try {
            await updateDoc(doc(db, 'applications', appId), { status: 'CANCELLED' });
            loadData();
        } catch (err) {
            console.error('Cancel error:', err);
            Alert.alert('Erro', err.message);
        }
    };

    const handleClose = async (jobId) => {
        try {
            await updateDoc(doc(db, 'jobs', jobId), { status: 'CLOSED' });
            loadData();
        } catch (err) {
            console.error('Close error:', err);
            Alert.alert('Erro', err.message);
        }
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
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name="briefcase-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                            <Text style={styles.headerTitle}>{t('tabs.jobs')}</Text>
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

                    {/* Integrated Mobile Tabs */}
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
                </Animated.View>
            )}

            <Animated.FlatList
                data={items}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {isEmployer ? (
                            <>
                                <TouchableOpacity onPress={() => router.push(`/job/${item.id}`)}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardMeta}>
                                        {item._count?.applications || 0} candidatos · <Ionicons name={item.status === 'ACTIVE' ? 'ellipse' : 'close-circle'} size={10} color={item.status === 'ACTIVE' ? '#4CAF50' : Colors.error} /> {item.status === 'ACTIVE' ? 'Ativa' : 'Encerrada'}
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
                                        {item.job?.employer?.name} · <Ionicons name={item.status === 'PENDING' ? 'time' : item.status === 'ACCEPTED' ? 'checkmark-circle' : item.status === 'REJECTED' ? 'close-circle' : 'remove-circle'} size={12} color={item.status === 'ACCEPTED' ? '#4CAF50' : item.status === 'PENDING' ? Colors.warning : Colors.error} /> {item.status === 'PENDING' ? 'Pendente' : item.status === 'ACCEPTED' ? 'Aceite' : item.status === 'REJECTED' ? 'Rejeitada' : 'Cancelada'}
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
                    <View style={styles.empty}>
                        <Ionicons name={isEmployer ? 'clipboard-outline' : 'document-text-outline'} size={48} color={Colors.textLight} style={{ marginBottom: Spacing.md }} />
                        <Text style={styles.emptyText}>{isEmployer ? 'Nenhuma vaga publicada' : 'Nenhuma candidatura'}</Text>
                    </View>
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
        top: -4,
        right: -4,
        backgroundColor: Colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    headerBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    
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
