import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useUnreadCount = () => {
    const { user } = useAuthStore();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        if (!user?.uid) {
            setUnreadMessages(0);
            setUnreadNotifications(0);
            return;
        }

        const unsubscribers = [];

        // 1. Messages
        const fieldMatch = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
        const qMsg = query(collection(db, 'chat_conversations'), where(fieldMatch, '==', user.uid));
        
        unsubscribers.push(onSnapshot(qMsg, (snap) => {
            let total = 0;
            snap.forEach(d => {
                const data = d.data();
                if (data.unread_count && data.unread_count[user.uid || user.id]) {
                    total += data.unread_count[user.uid || user.id];
                }
            });
            setUnreadMessages(total);
        }));

        // 2. Apps & Jobs (Simulated count for red badge)
        let appsCount = 0;
        let jobsCount = 0;
        let connReqsCount = 0;
        let directNotifsCount = 0;
        const updateNotifBadge = () => setUnreadNotifications(appsCount + jobsCount + connReqsCount + directNotifsCount);

        if (user.role === 'WORKER') {
            const qApps = query(collection(db, 'applications'), where('worker_id', '==', user.uid || user.id));
            unsubscribers.push(onSnapshot(qApps, (snap) => {
                let count = 0;
                snap.forEach(d => {
                    const data = d.data();
                    if ((data.status === 'ACCEPTED' || data.status === 'REJECTED') && (Date.now() - (data.updated_at?.seconds * 1000 || 0)) < 604800000) count++;
                });
                appsCount = count;
                updateNotifBadge();
            }));

            const qJobs = query(collection(db, 'jobs'), orderBy('created_at', 'desc'), limit(15));
            unsubscribers.push(onSnapshot(qJobs, (snap) => {
                let count = 0;
                snap.forEach(d => {
                    const data = d.data();
                    if (data.status === 'ACTIVE' && (Date.now() - (data.created_at?.seconds * 1000 || 0)) < 604800000) count++;
                });
                jobsCount = count;
                updateNotifBadge();
            }));

        } else if (user.role === 'EMPLOYER') {
            const qEmpApps = query(
                collection(db, 'applications'), 
                where('employer_id', '==', user.uid || user.id),
                where('status', '==', 'PENDING')
            );
            unsubscribers.push(onSnapshot(qEmpApps, (snap) => {
                let count = 0;
                snap.forEach(d => {
                    const data = d.data();
                    if ((Date.now() - (data.created_at?.seconds * 1000 || 0)) < 604800000) count++;
                });
                appsCount = count;
                updateNotifBadge();
            }));
        }

        // 3. Connection Requests
        const qReqs = query(
            collection(db, 'connection_requests'),
            where('receiver_id', '==', user.uid || user.id),
            where('status', '==', 'PENDING')
        );
        unsubscribers.push(onSnapshot(qReqs, (snap) => {
            connReqsCount = snap.size;
            updateNotifBadge();
        }));

        // 4. Fallback for a potential 'notifications' collection
        const qNotif = query(
            collection(db, 'notifications'),
            where('user_id', '==', user.uid || user.id),
            where('read', '==', false)
        );
        unsubscribers.push(onSnapshot(qNotif, (snap) => {
            directNotifsCount = snap.size;
            updateNotifBadge();
        }, () => {})); // Ignore errors if collection doesn't exist yet

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user?.uid, user?.role]);

    return { unreadMessages, unreadNotifications };
};
