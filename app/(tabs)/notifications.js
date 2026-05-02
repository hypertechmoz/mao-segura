import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, Animated, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, formatRelativeTime, toDate } from '../../utils/profileUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { acceptConnectionRequest, rejectConnectionRequest } from '../../utils/chatSecureHelper';

function NotificationItem({ id, icon, iconColor, title, description, time, isNew, route, requiresAction, reqId, senderId, user }) {
    const router = useRouter();

    const handlePress = async () => {
        try {
            // Mark as read in Firestore if it's an explicit notification
            if (id && id.startsWith('notif-')) {
                const docId = id.replace('notif-', '');
                await updateDoc(doc(db, 'notifications', docId), { read: true });
            }
            if (route) router.push(route);
        } catch (e) {
            console.warn('Error marking notification as read:', e);
            if (route) router.push(route);
        }
    };

    return (
        <TouchableOpacity 
            style={[nStyles.item, isNew && nStyles.itemNew]}
            activeOpacity={0.7}
            onPress={handlePress}
        >
            <View style={[nStyles.iconBox, isNew && nStyles.iconBoxNew]}>
                <Ionicons name={icon} size={22} color={iconColor || Colors.primary} />
            </View>
            <View style={nStyles.itemContent}>
                <Text style={nStyles.itemTitle}>{title}</Text>
                <Text style={nStyles.itemDesc} numberOfLines={2}>{description}</Text>
                <Text style={nStyles.itemTime}>{formatRelativeTime(time)}</Text>

                {requiresAction && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <TouchableOpacity onPress={async (e) => {
                            e.stopPropagation();
                            try {
                                const chatId = await acceptConnectionRequest(reqId, user, senderId);
                                if (chatId) router.push(`/chat/${chatId}`);
                            } catch(err) { console.error(err); }
                        }} style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 }}>
                            <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>Aceitar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            rejectConnectionRequest(reqId);
                        }} style={{ backgroundColor: Colors.borderLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 }}>
                            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>Recusar</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    const [initialLoading, setInitialLoading] = useState(true);
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

        // Update last viewed timestamp to clear badge
        updateDoc(doc(db, 'users', user.uid), { 
            last_notifications_viewed_at: serverTimestamp() 
        }).catch(err => console.warn('Error updating badge timestamp:', err));

        const unsubscribers = [];
        let aggregatedNotifications = { apps: [], employerApps: [], msgs: [], jobs: [], connectionReqs: [], explicit: [] };

        const updateState = () => {
            const all = [
                ...aggregatedNotifications.explicit,
                ...aggregatedNotifications.apps,
                ...aggregatedNotifications.employerApps,
                ...aggregatedNotifications.msgs,
                ...aggregatedNotifications.jobs,
                ...aggregatedNotifications.connectionReqs
            ];
            // Sort by time
            setNotifications(all.sort((a, b) => {
                const timeA = toDate(a.time).getTime();
                const timeB = toDate(b.time).getTime();
                return timeB - timeA;
            }));
        };

        const lastViewed = user.last_notifications_viewed_at?.seconds || 0;

        // 1. WORKER: Application status changes (handled by explicit system)
        if (user.role === 'WORKER') {
            // 2. WORKER: New Jobs (Filtered by Connections)
            const getConnectedJobs = async () => {
                // First get connected user IDs
                const connQ1 = query(collection(db, 'connections'), where('user1_id', '==', user.uid));
                const connQ2 = query(collection(db, 'connections'), where('user2_id', '==', user.uid));
                const [snap1, snap2] = await Promise.all([getDocs(connQ1), getDocs(connQ2)]);
                
                const connectedIds = new Set();
                snap1.forEach(d => connectedIds.add(d.data().user2_id));
                snap2.forEach(d => connectedIds.add(d.data().user1_id));

                if (connectedIds.size === 0) {
                    aggregatedNotifications.jobs = [];
                    updateState();
                    return;
                }

                // Now listen for jobs from these connections
                const qJobs = query(collection(db, 'jobs'), orderBy('created_at', 'desc'), limit(20));
                unsubscribers.push(onSnapshot(qJobs, (snap) => {
                    const activeJobs = [];
                    snap.forEach(d => {
                        const data = d.data();
                        if (data.status === 'ACTIVE' && connectedIds.has(data.employer_id)) {
                            activeJobs.push({ id: d.id, ...data });
                        }
                    });
                    
                    const list = activeJobs.slice(0, 5).map(data => {
                        return {
                            id: `job-${data.id}`,
                            route: `/job/${data.id}`,
                            icon: 'briefcase',
                            iconColor: '#1976D2',
                            title: 'Vaga de uma conexão',
                            description: `"${data.title}" — Postada por um contacto seu.`,
                            time: data.created_at,
                            isNew: (Date.now() - toDate(data.created_at).getTime()) < 604800000,
                        };
                    });
                    aggregatedNotifications.jobs = list;
                    updateState();
                }));
            };
            getConnectedJobs();
        }

        // 3. EMPLOYER: New Applications
            // Derived notifications for employers are now handled by the explicit system in job/[id].js

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
                        route: `/(tabs)/messages`,
                        icon: 'chatbubble-ellipses',
                        iconColor: Colors.primary,
                        title: 'Novas Mensagens',
                        description: `Você tem ${data.unread_count[user.uid || user.id]} mensagem(ns) não lida(s) de ${senderName}.`,
                        time: data.updated_at || data.created_at,
                        isNew: true,
                    });
                }
            }
            aggregatedNotifications.msgs = list;
            updateState();
        }));

        // Set a timeout to clear the loading state, allowing the async snapshots above to fully resolve
        const loadingTimer = setTimeout(() => {
            setInitialLoading(false);
        }, 1200);

        const qReqs = query(
            collection(db, 'connection_requests'),
            where('receiver_id', '==', user.uid || user.id),
            where('status', '==', 'PENDING')
        );
        unsubscribers.push(onSnapshot(qReqs, (snap) => {
            const list = snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    reqId: d.id, // For actions
                    type: 'CONNECTION_REQUEST',
                    senderId: data.sender_id,
                    icon: 'person-add',
                    iconColor: Colors.primary,
                    title: data.type === 'APPLY' ? 'Nova Candidatura / Contacto' : 'Pedido de Contacto',
                    description: `${data.sender_name} enviou um pedido de contacto${data.job_id ? ' para uma vaga' : ''}.`,
                    time: data.created_at,
                    isNew: true,
                    requiresAction: true,
                    user: user
                };
            }).sort((a, b) => {
                const timeA = toDate(a.time).getTime();
                const timeB = toDate(b.time).getTime();
                return timeB - timeA;
            });
            aggregatedNotifications.connectionReqs = list;
            updateState();
        }));

        // 5. Explicit Notifications (The new system)
        const qExplicit = query(
            collection(db, 'notifications'),
            where('user_id', '==', user.uid || user.id),
            where('read', '==', false),
            orderBy('created_at', 'desc'),
            limit(20)
        );
        unsubscribers.push(onSnapshot(qExplicit, (snap) => {
            const list = snap.docs.map(d => {
                const data = d.data();
                return {
                    id: `notif-${d.id}`,
                    route: data.route,
                    icon: data.type === 'APPLICATION_ACCEPTED' ? 'checkmark-circle' : (data.type === 'USER_HIRED' ? 'trophy' : (data.type === 'APPLICATION_REJECTED' ? 'close-circle' : 'mail-unread')),
                    iconColor: data.type === 'APPLICATION_ACCEPTED' || data.type === 'USER_HIRED' ? '#4CAF50' : (data.type === 'APPLICATION_REJECTED' ? Colors.error : Colors.info),
                    title: data.title,
                    description: data.description,
                    time: data.created_at,
                    isNew: true,
                };
            });
            aggregatedNotifications.explicit = list;
            updateState();
        }));

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(loadingTimer);
        };
    }, [user, user?.role]);

    const onRefresh = async () => {
        setRefreshing(true);
        // Notifications are real-time, just a delay for UX
        setTimeout(() => setRefreshing(false), 1000);
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
                            <View style={nStyles.headerIconBtn}>
                                <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
                                {unreadNotifications > 0 && (
                                    <View style={nStyles.headerBadge}>
                                        <Text style={nStyles.headerBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={nStyles.headerTitle}>Notificações</Text>
                        </View>
                        <View style={nStyles.headerActions}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/messages')} style={nStyles.headerIconBtn}>
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
                    { useNativeDriver: Platform.OS !== 'web' }
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >
                {initialLoading ? (
                    <View style={[nStyles.empty, { marginTop: 40 }]}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : notifications.length === 0 ? (
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
    headerActions: { flexDirection: 'row', gap: 12 },
    headerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginRight: 8,
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
