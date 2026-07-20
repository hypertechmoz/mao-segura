import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, Animated, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, formatRelativeTime, toDate } from '../../utils/profileUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { acceptConnectionRequest, rejectConnectionRequest } from '../../utils/chatSecureHelper';
import { BackHandler } from 'react-native';

function NotificationItem({ id, icon, iconColor, title, description, time, isNew, route, requiresAction, reqId, senderId, user, onRead }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePress = async () => {
        try {
            if (id) {
                const docId = String(id).startsWith('notif-') ? id.replace('notif-', '') : id;
                if (String(id).startsWith('notif-')) {
                    await supabase.from('notifications').update({ is_read: true }).eq('id', docId);
                    if (onRead) onRead(id);
                } 
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
                        <TouchableOpacity disabled={isProcessing} onPress={async (e) => {
                            e.stopPropagation();
                            if (isProcessing) return;
                            setIsProcessing(true);
                            try {
                                const chatId = await acceptConnectionRequest(reqId, user, senderId);
                                if (chatId) router.push(`/chat/${chatId}`);
                            } catch(err) { console.error(err); } finally { setIsProcessing(false); }
                        }} style={[{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 }, isProcessing && { opacity: 0.7 }]}>
                            {isProcessing ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>Aceitar</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity disabled={isProcessing} onPress={async (e) => {
                            e.stopPropagation();
                            if (isProcessing) return;
                            setIsProcessing(true);
                            try {
                                await rejectConnectionRequest(reqId);
                            } catch(err) { console.error(err); } finally { setIsProcessing(false); }
                        }} style={[{ backgroundColor: Colors.borderLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 }, isProcessing && { opacity: 0.7 }]}>
                            {isProcessing ? <ActivityIndicator size="small" color={Colors.textSecondary} /> : <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700' }}>Recusar</Text>}
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
    
    // State
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const handleRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
    };
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 20;

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

    const loadData = async (isLoadMore = false) => {
        if (!user) return;
        const uid = user.uid || user.id;

        const currentPage = isLoadMore ? page + 1 : 0;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        if (isLoadMore) setLoadingMore(true);
        else {
            setPage(0);
            setHasMore(true);
            if (!refreshing) setInitialLoading(true);
        }

        try {
            // 1. Explicit Notifications
            const { data: explicit } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', uid)
                .order('created_at', { ascending: false })
                .range(from, to);

            const explicitFormatted = explicit?.map(d => ({
                id: `notif-${d.id}`,
                route: d.route,
                icon: d.type === 'APPLICATION_ACCEPTED' ? 'checkmark-circle' : (d.type === 'USER_HIRED' ? 'trophy' : (d.type === 'APPLICATION_REJECTED' ? 'close-circle' : 'mail-unread')),
                iconColor: d.type === 'APPLICATION_ACCEPTED' || d.type === 'USER_HIRED' ? '#4CAF50' : (d.type === 'APPLICATION_REJECTED' ? Colors.error : Colors.info),
                title: d.title || 'Notificação',
                description: d.description || d.content,
                time: d.created_at,
                isNew: !d.is_read,
            })) || [];

            // Mark all fetched explicit notifications as read to clear the badge
            const unreadExplicitIds = explicit?.filter(n => !n.is_read).map(n => n.id) || [];
            if (unreadExplicitIds.length > 0) {
                supabase.from('notifications')
                    .update({ is_read: true })
                    .in('id', unreadExplicitIds)
                    .then(({ error }) => {
                        if (error) console.log('Error marking notifications as read:', error);
                    });
            }

            let connectionReqsFormatted = [];
            // Fetch connection requests only on the first page
            if (currentPage === 0) {
                const { data: reqs } = await supabase
                    .from('connection_requests')
                    .select('*')
                    .eq('receiver_id', uid)
                    .eq('status', 'PENDING')
                    .order('created_at', { ascending: false });

                connectionReqsFormatted = reqs?.map(d => ({
                    id: d.id,
                    reqId: d.id,
                    type: 'CONNECTION_REQUEST',
                    senderId: d.sender_id,
                    icon: 'person-add',
                    iconColor: Colors.primary,
                    title: d.type === 'APPLY' ? 'Nova Candidatura / Contacto' : 'Pedido de Contacto',
                    description: `${d.sender_name || 'Alguém'} enviou um pedido de contacto.`,
                    time: d.created_at,
                    isNew: true,
                    requiresAction: true,
                    user: user,
                    route: d.job_id ? `/job/${d.job_id}` : `/user/${d.sender_id}`
                })) || [];
            }

            if (!explicit || explicit.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setNotifications(prev => {
                let newNotifs = isLoadMore ? [...prev] : [];
                if (!isLoadMore) {
                    newNotifs = [...connectionReqsFormatted, ...explicitFormatted];
                } else {
                    const existingIds = new Set(prev.map(n => n.id));
                    const uniqueExplicit = explicitFormatted.filter(n => !existingIds.has(n.id));
                    newNotifs = [...prev, ...uniqueExplicit];
                }
                return newNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
            });

            if (isLoadMore) setPage(currentPage);

        } catch (err) {
            console.error('Error loading notifications', err);
        } finally {
            setInitialLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const uid = user.uid || user.id;

        loadData();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`notifications-changes-${Date.now()}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload => {
                const d = payload.new;
                const newNotif = {
                    id: `notif-${d.id}`,
                    route: d.route,
                    icon: d.type === 'APPLICATION_ACCEPTED' ? 'checkmark-circle' : (d.type === 'USER_HIRED' ? 'trophy' : (d.type === 'APPLICATION_REJECTED' ? 'close-circle' : 'mail-unread')),
                    iconColor: d.type === 'APPLICATION_ACCEPTED' || d.type === 'USER_HIRED' ? '#4CAF50' : (d.type === 'APPLICATION_REJECTED' ? Colors.error : Colors.info),
                    title: d.title || 'Notificação',
                    description: d.description || d.content,
                    time: d.created_at,
                    isNew: true,
                };
                setNotifications(prev => [newNotif, ...prev].sort((a, b) => new Date(b.time) - new Date(a.time)));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connection_requests', filter: `receiver_id=eq.${uid}` }, payload => {
                const d = payload.new;
                const newReq = {
                    id: d.id,
                    reqId: d.id,
                    type: 'CONNECTION_REQUEST',
                    senderId: d.sender_id,
                    icon: 'person-add',
                    iconColor: Colors.primary,
                    title: d.type === 'APPLY' ? 'Nova Candidatura / Contacto' : 'Pedido de Contacto',
                    description: `${d.sender_name || 'Alguém'} enviou um pedido de contacto.`,
                    time: d.created_at,
                    isNew: true,
                    requiresAction: true,
                    user: user,
                    route: d.job_id ? `/job/${d.job_id}` : `/user/${d.sender_id}`
                };
                setNotifications(prev => [newReq, ...prev].sort((a, b) => new Date(b.time) - new Date(a.time)));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.uid, user?.id]);

    const markAllAsRead = async () => {
        if (!user) return;
        const uid = user.uid || user.id;
        try {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', uid).eq('is_read', false);
            setNotifications(prev => prev.map(n => n.id.toString().startsWith('notif-') ? { ...n, isNew: false } : n));
        } catch (e) {
            console.error('Error marking all as read', e);
        }
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
                            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={nStyles.headerIconBtn}>
                                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={nStyles.headerTitle}>Notificações</Text>
                        </View>
                        <View style={nStyles.headerActions}>
                            <TouchableOpacity onPress={markAllAsRead} style={nStyles.headerIconBtn}>
                                <Ionicons name="checkmark-done-circle-outline" size={24} color={Colors.primary} />
                            </TouchableOpacity>
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

            <Animated.FlatList
                style={nStyles.container}
                contentContainerStyle={[nStyles.content, !isWeb && { paddingTop: HEADER_HEIGHT + 16 }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: Platform.OS !== 'web' }
                )}
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(false); }} colors={[Colors.primary]} />}
                ListHeaderComponent={isWeb ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingHorizontal: 4 }}>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.text }}>Notificações</Text>
                        <TouchableOpacity onPress={markAllAsRead} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                            <Ionicons name="checkmark-done" size={16} color={Colors.primary} style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>Marcar lido</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                ListEmptyComponent={() => (
                    initialLoading ? (
                        <View style={[nStyles.empty, { marginTop: 40 }]}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={nStyles.empty}>
                            <Ionicons name="notifications-off-outline" size={56} color={Colors.textLight} style={{ marginBottom: Spacing.md, opacity: 0.4 }} />
                            <Text style={nStyles.emptyTitle}>Sem notificações</Text>
                            <Text style={nStyles.emptyDesc}>Quando houver atualizações sobre as suas candidaturas, mensagens ou novas vagas, elas aparecerão aqui.</Text>
                        </View>
                    )
                )}
                renderItem={({ item }) => <NotificationItem {...item} onRead={handleRead} />}
                onEndReached={() => { if (hasMore && !loadingMore && !initialLoading) loadData(true); }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => loadingMore ? <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} /> : null}
            />
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
