import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, Image, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, formatRelativeTime } from '../../utils/profileUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Messages() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
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

    // Cache for profiles and jobs to avoid redundant fetches
    const profilesCache = useRef({});
    const jobsCache = useRef({});

    useEffect(() => {
        if (!user) return;

        const isWorker = user.role === 'WORKER';
        const field = isWorker ? 'worker_id' : 'employer_id';
        const q = query(
            collection(db, 'chat_conversations'), 
            where(field, '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snap) => {
            try {
                const convDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => {
                        const timeA = a.updated_at?.seconds || 0;
                        const timeB = b.updated_at?.seconds || 0;
                        return timeB - timeA;
                    });

                // Identify missing profiles and jobs
                const missingUids = convDocs
                    .map(c => isWorker ? c.employer_id : c.worker_id)
                    .filter(uid => uid && !profilesCache.current[uid]);
                
                const missingJobIds = convDocs
                    .map(c => c.job_id)
                    .filter(jid => jid && !jobsCache.current[jid]);

                // Fetch missing profiles in parallel
                if (missingUids.length > 0) {
                    const uniqueUids = [...new Set(missingUids)];
                    const snaps = await Promise.all(uniqueUids.map(uid => getDoc(doc(db, 'users', uid))));
                    snaps.forEach(s => {
                        if (s.exists()) profilesCache.current[s.id] = { id: s.id, ...s.data() };
                    });
                }

                // Fetch missing job titles in parallel
                if (missingJobIds.length > 0) {
                    const uniqueJobIds = [...new Set(missingJobIds)];
                    const snaps = await Promise.all(uniqueJobIds.map(jid => getDoc(doc(db, 'jobs', jid))));
                    snaps.forEach(s => {
                        if (s.exists()) jobsCache.current[s.id] = s.data().title;
                    });
                }

                // Format the final list using cache
                const formatted = convDocs.map(conv => {
                    const otherUid = isWorker ? conv.employer_id : conv.worker_id;
                    return {
                        id: conv.id,
                        otherUser: profilesCache.current[otherUid] || { name: 'Utilizador', is_verified: false },
                        lastMessage: conv.job_id ? (jobsCache.current[conv.job_id] || 'Conversa sobre vaga') : (conv.last_message || 'Conversa sobre vaga'),
                        lastMessageAt: conv.updated_at,
                        unread: conv.unread_count && conv.unread_count[user.uid] > 0 ? conv.unread_count[user.uid] : 0,
                    };
                });

                setConversations(formatted);
            } catch (err) {
                console.error('Snapshot conversations error:', err);
            } finally {
                setInitialLoading(false);
            }
        }, (err) => {
            console.error('Conversations listener error:', err);
            setInitialLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const onRefresh = async () => { 
        setRefreshing(true); 
        // Snapshot will update automatically, but we can wait a bit for visual feedback
        setTimeout(() => setRefreshing(false), 1000);
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
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                            <Text style={styles.headerTitle}>Mensagens</Text>
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

            <Animated.FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: Platform.OS !== 'web' }
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.conversationCard}
                        onPress={() => router.push({ pathname: `/chat/${item.id}`, params: { name: item.otherUser?.name } })}
                    >
                        <View style={styles.avatar}>
                            {item.otherUser?.profile_photo ? (
                                <Image source={{ uri: item.otherUser.profile_photo }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{item.otherUser?.name?.[0] || '?'}</Text>
                            )}
                        </View>
                        <View style={styles.info}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.name, item.unread > 0 && { fontWeight: '800' }]}>{item.otherUser?.name}</Text>
                                {item.otherUser?.is_verified && <Ionicons name="checkmark-circle" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />}
                            </View>
                            <Text style={[styles.lastMessage, item.unread > 0 && { color: Colors.text, fontWeight: '600' }]} numberOfLines={1}>
                                {item.lastMessage || 'Sem mensagens'}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.time, item.unread > 0 && { color: Colors.primary, fontWeight: '700' }]}>{formatRelativeTime(item.lastMessageAt)}</Text>
                            {item.unread > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    initialLoading ? (
                        <View style={[styles.empty, { marginTop: 40 }]}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textLight} style={{ marginBottom: Spacing.md }} />
                            <Text style={styles.emptyText}>Nenhuma conversa</Text>
                            <Text style={styles.emptySubtext}>Inicie uma conversa a partir do perfil de um utilizador</Text>
                        </View>
                    )
                )}
                contentContainerStyle={[styles.list, !isWeb && { marginTop: HEADER_HEIGHT }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    conversationCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
        paddingHorizontal: Spacing.md, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm,
        overflow: 'hidden',
    },
    avatarImage: { width: 48, height: 48, borderRadius: 24 },
    avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
    info: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    name: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
    verified: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
    lastMessage: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    time: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
    emptyText: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text },
    emptySubtext: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
    unreadBadge: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 4, paddingHorizontal: 6 },
    unreadBadgeText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },

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
