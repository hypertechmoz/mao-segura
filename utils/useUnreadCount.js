import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

let activeRealtimeChannel = null;
let currentUserId = null;

export const useUnreadStore = create((set, get) => ({
    unreadMessages: 0,
    unreadNotifications: 0,
    unreadConnectionRequests: 0,
    activeChatId: null,

    setActiveChatId: (chatId) => set({ activeChatId: chatId }),
    setUnreadMessages: (count) => set({ unreadMessages: Math.max(0, count) }),
    setUnreadNotifications: (count) => set({ unreadNotifications: Math.max(0, count) }),
    setUnreadConnectionRequests: (count) => set({ unreadConnectionRequests: Math.max(0, count) }),

    clearAllNotifications: () => set((state) => ({ 
        unreadNotifications: state.unreadConnectionRequests 
    })),

    decrementUnreadNotifications: (amount = 1) => set((state) => ({
        unreadNotifications: Math.max(0, state.unreadNotifications - amount)
    })),

    clearUnreadForConversation: (convUnreadForUser = 0) => set((state) => ({
        unreadMessages: Math.max(0, state.unreadMessages - convUnreadForUser)
    })),

    reset: () => {
        if (activeRealtimeChannel) {
            supabase.removeChannel(activeRealtimeChannel);
            activeRealtimeChannel = null;
        }
        currentUserId = null;
        set({ unreadMessages: 0, unreadNotifications: 0, unreadConnectionRequests: 0 });
    },

    fetchAndSubscribe: async (user) => {
        const uid = user?.uid || user?.id;
        if (!uid) {
            get().reset();
            return;
        }

        const fetchCounts = async () => {
            try {
                const fieldMatch = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
                
                // 1. Messages
                const { data: convs } = await supabase
                    .from('chat_conversations')
                    .select('unread_count')
                    .eq(fieldMatch, uid);
                
                let msgTotal = 0;
                convs?.forEach(c => {
                    // Ignore unread count for the currently active chat because the user is already reading it
                    if (get().activeChatId === c.id) {
                        return;
                    }
                    if (c.unread_count && c.unread_count[uid]) {
                        msgTotal += c.unread_count[uid];
                    }
                });

                // 2. Notifications (Direct)
                const { count: notifCount } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', uid)
                    .eq('is_read', false);

                // 3. Connection Requests
                const { count: reqCount } = await supabase
                    .from('connection_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('receiver_id', uid)
                    .eq('status', 'PENDING');

                const connectionRequests = reqCount || 0;
                const totalNotifs = (notifCount || 0) + connectionRequests;

                set({
                    unreadMessages: msgTotal,
                    unreadNotifications: totalNotifs,
                    unreadConnectionRequests: connectionRequests
                });
            } catch (err) {
                console.warn('Error fetching unread counts:', err);
            }
        };

        await fetchCounts();

        // Setup single global channel if user changed or channel doesn't exist
        if (currentUserId !== uid || !activeRealtimeChannel) {
            if (activeRealtimeChannel) {
                supabase.removeChannel(activeRealtimeChannel);
            }

            currentUserId = uid;
            const channelName = `unread-counts-global-${uid}`;
            activeRealtimeChannel = supabase.channel(channelName)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => fetchCounts())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => fetchCounts())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests', filter: `receiver_id=eq.${uid}` }, () => fetchCounts())
                .subscribe();
        }
    }
}));

export const useUnreadCount = () => {
    const { user } = useAuthStore();
    const unreadMessages = useUnreadStore(s => s.unreadMessages);
    const unreadNotifications = useUnreadStore(s => s.unreadNotifications);
    const unreadConnectionRequests = useUnreadStore(s => s.unreadConnectionRequests);
    const fetchAndSubscribe = useUnreadStore(s => s.fetchAndSubscribe);
    const reset = useUnreadStore(s => s.reset);
    const setActiveChatId = useUnreadStore(s => s.setActiveChatId);

    useEffect(() => {
        const uid = user?.uid || user?.id;
        if (uid) {
            fetchAndSubscribe(user);
        } else {
            reset();
        }
    }, [user?.uid, user?.id, user?.role]);

    return { unreadMessages, unreadNotifications, unreadConnectionRequests, setActiveChatId };
};
