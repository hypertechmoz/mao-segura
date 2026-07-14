import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export const useUnreadCount = () => {
    const { user } = useAuthStore();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadConnectionRequests, setUnreadConnectionRequests] = useState(0);

    useEffect(() => {
        const uid = user?.uid || user?.id;
        if (!uid) {
            setUnreadMessages(0);
            setUnreadNotifications(0);
            setUnreadConnectionRequests(0);
            return;
        }

        const fetchAndSubscribe = async () => {
            const fieldMatch = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
            
            // 1. Messages
            const { data: convs } = await supabase
                .from('chat_conversations')
                .select('unread_count')
                .eq(fieldMatch, uid);
            
            let msgTotal = 0;
            convs?.forEach(c => {
                if (c.unread_count && c.unread_count[uid]) msgTotal += c.unread_count[uid];
            });
            setUnreadMessages(msgTotal);

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
            setUnreadConnectionRequests(reqCount || 0);
            setUnreadNotifications((notifCount || 0) + (reqCount || 0));
        };

        fetchAndSubscribe();

        // Subscribe to changes with an absolutely unique channel name
        const channelName = `unread-counts-${uid}-${Math.random().toString(36).substring(7)}`;
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => fetchAndSubscribe())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => fetchAndSubscribe())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests', filter: `receiver_id=eq.${uid}` }, () => fetchAndSubscribe())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.role]);

    return { unreadMessages, unreadNotifications, unreadConnectionRequests };
};
