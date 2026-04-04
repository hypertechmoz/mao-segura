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
                if (data.unread_count && data.unread_count[user.uid]) {
                    total += data.unread_count[user.uid];
                }
            });
            setUnreadMessages(total);
        }));

        // 2. Apps & Jobs (Simulated count for red badge)
        let appsCount = 0;
        let jobsCount = 0;
        const updateNotifBadge = () => setUnreadNotifications(appsCount + jobsCount);

        if (user.role === 'WORKER') {
            const qApps = query(collection(db, 'applications'), where('worker_id', '==', user.uid));
            unsubscribers.push(onSnapshot(qApps, (snap) => {
                let count = 0;
                snap.forEach(d => {
                    const data = d.data();
                    if ((data.status === 'ACCEPTED' || data.status === 'REJECTED') && (Date.now() - (data.updated_at?.seconds * 1000 || 0)) < 86400000) count++;
                });
                appsCount = count;
                updateNotifBadge();
            }));

            const qJobs = query(collection(db, 'jobs'), orderBy('created_at', 'desc'), limit(15));
            unsubscribers.push(onSnapshot(qJobs, (snap) => {
                let count = 0;
                snap.forEach(d => {
                    const data = d.data();
                    if (data.status === 'ACTIVE' && (Date.now() - (data.created_at?.seconds * 1000 || 0)) < 86400000) count++;
                });
                jobsCount = count;
                updateNotifBadge();
            }));

        } else if (user.role === 'EMPLOYER') {
            const jobsQuery = query(collection(db, 'jobs'), where('employer_id', '==', user.uid));
            unsubscribers.push(onSnapshot(jobsQuery, async (jobsSnap) => {
                const employerJobIds = jobsSnap.docs.map(d => d.id);
                if (employerJobIds.length > 0) {
                    const chunkedIds = employerJobIds.slice(0, 10);
                    const qEmpApps = query(collection(db, 'applications'), where('job_id', 'in', chunkedIds));
                    unsubscribers.push(onSnapshot(qEmpApps, (snap) => {
                        let count = 0;
                        snap.forEach(d => {
                            const data = d.data();
                            if (data.status === 'PENDING' && (Date.now() - (data.created_at?.seconds * 1000 || 0)) < 86400000) count++;
                        });
                        appsCount = count;
                        updateNotifBadge();
                    }));
                }
            }));
        }

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user?.uid, user?.role]);

    return { unreadMessages, unreadNotifications };
};
