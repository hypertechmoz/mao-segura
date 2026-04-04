import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { toDate } from '../../utils/profileUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NotificationItem({ icon, iconColor, title, description, time, isNew, route }) {
    const router = useRouter();
    return (
        <TouchableOpacity 
            style={[nStyles.item, isNew && nStyles.itemNew]}
            activeOpacity={0.7}
            onPress={() => route && router.push(route)}
        >
            <View style={[nStyles.iconBox, isNew && nStyles.iconBoxNew]}>
                <Ionicons name={icon} size={22} color={iconColor || Colors.primary} />
            </View>
            <View style={nStyles.itemContent}>
                <Text style={nStyles.itemTitle}>{title}</Text>
                <Text style={nStyles.itemDesc} numberOfLines={2}>{description}</Text>
                <Text style={nStyles.itemTime}>{time}</Text>
            </View>
            {isNew && <View style={nStyles.dot} />}
        </TouchableOpacity>
    );
}

export default function Notifications() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { unreadMessages, unreadNotifications } = useUnreadCount();
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

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const unsubscribers = [];
        let aggregatedNotifications = { apps: [], employerApps: [], msgs: [], jobs: [] };

        const updateState = () => {
            const all = [
                ...aggregatedNotifications.apps,
                ...aggregatedNotifications.employerApps,
                ...aggregatedNotifications.msgs,
                ...aggregatedNotifications.jobs
            ];
            // Sort by isNew priority, then by time (implied by Firestore order usually)
            // But we'll try to keep them reasonably sorted
            setNotifications(all.sort((a, b) => (b.isNew ? 1 : -0) - (a.isNew ? 1 : 0)));
        };

        // 1. WORKER: Application status changes
        if (user.role === 'WORKER') {
            const qApps = query(
                collection(db, 'applications'), 
                where('worker_id', '==', user.uid || user.id)
            );
            unsubscribers.push(onSnapshot(qApps, async (snap) => {
                let filteredApps = [];
                snap.forEach(d => {
                    const data = d.data();
                    if (data.status === 'ACCEPTED' || data.status === 'REJECTED') {
                        filteredApps.push({ id: d.id, ...data });
                    }
                });
                filteredApps.sort((a, b) => (b.updated_at?.seconds || 0) - (a.updated_at?.seconds || 0));
                filteredApps = filteredApps.slice(0, 10);

                const list = [];
                for (const data of filteredApps) {
                    let jobTitle = 'vaga';
                    if (data.job_id) {
                        const jSnap = await getDoc(doc(db, 'jobs', data.job_id));
                        if (jSnap.exists()) jobTitle = jSnap.data().title;
                    }
                    list.push({
                        id: `app-${data.id}`,
                        route: `/job/${data.job_id}`,
                        icon: data.status === 'ACCEPTED' ? 'checkmark-circle' : 'close-circle',
                        iconColor: data.status === 'ACCEPTED' ? '#4CAF50' : Colors.error,
                        title: data.status === 'ACCEPTED' ? 'Candidatura Aceite!' : 'Candidatura Rejeitada',
                        description: `A sua candidatura para "${jobTitle}" foi ${data.status === 'ACCEPTED' ? 'aceite' : 'rejeitada'}.`,
                        time: toDate(data.updated_at).toLocaleDateString('pt-MZ'),
                        isNew: (Date.now() - toDate(data.updated_at).getTime()) < 86400000,
                    });
                }
                aggregatedNotifications.apps = list;
                updateState();
            }));

            // 2. WORKER: New Jobs
            const qJobs = query(collection(db, 'jobs'), orderBy('created_at', 'desc'), limit(15));
            unsubscribers.push(onSnapshot(qJobs, (snap) => {
                const activeJobs = [];
                snap.forEach(d => {
                    if (d.data().status === 'ACTIVE') {
                        activeJobs.push({ id: d.id, ...d.data() });
                    }
                });
                
                const list = activeJobs.slice(0, 5).map(data => {
                    return {
                        id: `job-${data.id}`,
                        route: `/job/${data.id}`,
                        icon: 'briefcase',
                        iconColor: '#1976D2',
                        title: 'Nova Vaga Publicada',
                        description: `"${data.title}" — ${data.contract_type === 'DAILY' ? 'Diarista' : 'Trabalho'}`,
                        time: toDate(data.created_at).toLocaleDateString('pt-MZ'),
                        isNew: (Date.now() - toDate(data.created_at).getTime()) < 86400000,
                    };
                });
                aggregatedNotifications.jobs = list;
                updateState();
            }));
        }

        // 3. EMPLOYER: New Applications
        if (user.role === 'EMPLOYER') {
            const getEmployerApps = async () => {
                const jobsQuery = query(collection(db, 'jobs'), where('employer_id', '==', user.uid || user.id));
                const jobsSnap = await getDocs(jobsQuery);
                const employerJobIds = jobsSnap.docs.map(d => d.id);
                
                if (employerJobIds.length > 0) {
                    const chunkedIds = employerJobIds.slice(0, 10);
                    const qEmpApps = query(
                        collection(db, 'applications'), 
                        where('job_id', 'in', chunkedIds)
                    );
                    unsubscribers.push(onSnapshot(qEmpApps, async (snap) => {
                        let filteredEmpApps = [];
                        snap.forEach(d => {
                            if (d.data().status === 'PENDING') {
                                filteredEmpApps.push({ id: d.id, ...d.data() });
                            }
                        });
                        filteredEmpApps.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
                        filteredEmpApps = filteredEmpApps.slice(0, 10);

                        const list = [];
                        for (const data of filteredEmpApps) {
                            let workerName = 'Alguém';
                            if (data.worker_id) {
                                const wSnap = await getDoc(doc(db, 'users', data.worker_id));
                                if (wSnap.exists()) workerName = wSnap.data().name;
                            }
                            const jobDoc = jobsSnap.docs.find(j => j.id === data.job_id);
                            const jobTitle = jobDoc ? jobDoc.data().title : 'vaga';

                            list.push({
                                id: `app-emp-${data.id}`,
                                route: `/worker/${data.worker_id}`,
                                icon: 'mail-unread',
                                iconColor: Colors.info,
                                title: 'Nova Candidatura',
                                description: `${workerName} candidatou-se a "${jobTitle}".`,
                                time: toDate(data.created_at).toLocaleDateString('pt-MZ'),
                                isNew: (Date.now() - toDate(data.created_at).getTime()) < 86400000,
                            });
                        }
                        aggregatedNotifications.employerApps = list;
                        updateState();
                    }));
                }
            };
            getEmployerApps();
        }

        // 4. ALL: Unread Messages from Chat Conversations
        const fieldMatch = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
        const qMsgs = query(
            collection(db, 'chat_conversations'), 
            where(fieldMatch, '==', user.uid || user.id)
        );
        unsubscribers.push(onSnapshot(qMsgs, async (snap) => {
            const list = [];
            for (const d of snap.docs) {
                const data = d.data();
                if (data.unread_count && data.unread_count[user.uid || user.id] > 0) {
                    const otherUid = user.role === 'WORKER' ? data.employer_id : data.worker_id;
                    let senderName = 'Alguém';
                    if (otherUid) {
                        const sSnap = await getDoc(doc(db, 'users', otherUid));
                        if (sSnap.exists()) senderName = sSnap.data().name;
                    }

                    list.push({
                        id: `msg-${d.id}`,
                        route: `/chat/${d.id}`,
                        icon: 'chatbubble',
                        iconColor: Colors.primary,
                        title: 'Novas Mensagens',
                        description: `Você tem ${data.unread_count[user.uid || user.id]} mensagem(ns) não lida(s) de ${senderName}.`,
                        time: data.updated_at ? toDate(data.updated_at).toLocaleDateString('pt-MZ') : 'Agora',
                        isNew: true,
                    });
                }
            }
            aggregatedNotifications.msgs = list;
            updateState();
        }));

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, user?.role]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    return (
        <View style={nStyles.container}>
            {/* Custom Animated Header (Mobile) */}
            {!isWeb && (
                <Animated.View style={[
                    nStyles.mobileHeader, 
                    { 
                        height: HEADER_HEIGHT, 
                        paddingTop: insets.top,
                        transform: [{ translateY: headerTranslateY }],
                    }
                ]}>
                    <View style={nStyles.headerContent}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View>
                                <Ionicons name="notifications-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                                {unreadNotifications > 0 && (
                                    <View style={nStyles.headerBadge}>
                                        <Text style={nStyles.headerBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={nStyles.headerTitle}>Notificações</Text>
                        </View>
                        <View style={nStyles.headerActions}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
                                <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
                                {unreadMessages > 0 && (
                                    <View style={nStyles.headerBadge}>
                                        <Text style={nStyles.headerBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}

            <Animated.ScrollView
                style={nStyles.container}
                contentContainerStyle={[nStyles.content, !isWeb && { marginTop: HEADER_HEIGHT }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >

            {notifications.length === 0 ? (
                <View style={nStyles.empty}>
                    <Ionicons name="notifications-off-outline" size={56} color={Colors.textLight} style={{ marginBottom: Spacing.md, opacity: 0.4 }} />
                    <Text style={nStyles.emptyTitle}>Sem notificações</Text>
                    <Text style={nStyles.emptyDesc}>Quando houver atualizações sobre as suas candidaturas, mensagens ou novas vagas, elas aparecerão aqui.</Text>
                </View>
            ) : (
                notifications.map(n => (
                    <NotificationItem key={n.id} {...n} />
                ))
            )}
            </Animated.ScrollView>
        </View>
    );
}

const nStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { 
        padding: Spacing.md, 
        paddingBottom: Spacing.xxl,
        ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}),
    },
    headerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    empty: { 
        alignItems: 'center', paddingVertical: Spacing.xxl * 2,
        backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.xl,
    },
    emptyTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
    emptyDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
    emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
    item: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.md,
        marginBottom: Spacing.xs,
    },
    itemNew: { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primary + '30' },
    iconBox: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm,
    },
    iconBoxNew: { backgroundColor: Colors.primary + '20' },
    icon: { fontSize: 20 },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 2 },
    itemDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
    itemTime: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 6 },

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
});
