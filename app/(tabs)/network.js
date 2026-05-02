import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest } from '../../utils/chatSecureHelper';

export default function Network() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [suggestions, setSuggestions] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequestIds, setSentRequestIds] = useState(new Set());
    const [connections, setConnections] = useState([]);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState(new Set());

    useEffect(() => {
        if (!user) return;

        let unsub = () => {};
        
        const loadNetwork = async () => {
            setLoading(true);
            try {
                // 1. Fetch Received pending requests
                const reqQ = query(
                    collection(db, 'connection_requests'),
                    where('receiver_id', '==', user.uid),
                    where('status', '==', 'PENDING')
                );
                
                unsub = onSnapshot(reqQ, (reqSnap) => {
                    const reqData = [];
                    reqSnap.forEach(d => reqData.push({ id: d.id, ...d.data() }));
                    setPendingRequests(reqData);
                });

                // 2. Fetch Sent pending requests
                const sentReqQ = query(
                    collection(db, 'connection_requests'),
                    where('sender_id', '==', user.uid),
                    where('status', '==', 'PENDING')
                );
                const sentSnap = await getDocs(sentReqQ);
                const sentIds = new Set();
                sentSnap.forEach(d => sentIds.add(d.data().receiver_id));
                setSentRequestIds(sentIds);

                // 3. Fetch Connections
                const connQ1 = query(collection(db, 'connections'), where('user1_id', '==', user.uid));
                const connQ2 = query(collection(db, 'connections'), where('user2_id', '==', user.uid));
                const [snap1, snap2] = await Promise.all([getDocs(connQ1), getDocs(connQ2)]);
                
                const connIds = new Set();
                snap1.forEach(d => connIds.add(d.data().user2_id));
                snap2.forEach(d => connIds.add(d.data().user1_id));

                const connData = [];
                for (let cid of Array.from(connIds).slice(0, 10)) {
                    const cSnap = await getDoc(doc(db, 'users', cid));
                    if (cSnap.exists()) {
                        connData.push({ id: cSnap.id, ...cSnap.data() });
                    }
                }
                setConnections(connData);
                setConnectionsCount(connIds.size);

                // 4. Fetch suggestions and FILTER them
                if (user.province) {
                    const suggQ = query(
                        collection(db, 'users'),
                        where('province', '==', user.province),
                        limit(30)
                    );
                    const snap = await getDocs(suggQ);
                    const suggData = [];
                    
                    const receivedIds = new Set(pendingRequests.map(r => r.sender_id));

                    snap.forEach(d => {
                        const uid = d.id;
                        // Filter out self, already connected, or pending (sent/received)
                        if (uid !== user.uid && !connIds.has(uid) && !sentIds.has(uid) && !receivedIds.has(uid)) {
                            suggData.push({ id: uid, ...d.data() });
                        }
                    });
                    setSuggestions(suggData.slice(0, 10));
                }

            } catch (err) {
                console.error("Error loading network:", err);
            } finally {
                setLoading(false);
            }
        };

        loadNetwork();

        return () => unsub();
    }, [user]);

    const handleConnect = async (targetId) => {
        if (processingIds.has(targetId)) return;
        
        setProcessingIds(prev => new Set(prev).add(targetId));
        try {
            await sendConnectionRequest(user, targetId, { type: 'CONTACT' });
            // Feedback imediato
            setSentRequestIds(prev => new Set(prev).add(targetId));
            // Opcionalmente remover da lista de sugestões após um pequeno delay ou imediatamente
            setTimeout(() => {
                setSuggestions(prev => prev.filter(s => s.id !== targetId));
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.pageTitle}>Minha Rede</Text>

            {/* Pedidos Pendentes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Convites Pendentes {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}</Text>
                {pendingRequests.length > 0 ? (
                    pendingRequests.map(req => (
                        <View key={req.id} style={styles.requestCard}>
                            <View style={styles.requestInfo}>
                                <View style={styles.avatar}>
                                    <Ionicons name="person" size={24} color={Colors.primary} />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.requestName}>{req.sender_name}</Text>
                                    <Text style={styles.requestSub}>Quer conectar-se consigo</Text>
                                </View>
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity 
                                    style={[styles.btn, styles.btnAccept, processingIds.has(req.id) && { opacity: 0.5 }]}
                                    onPress={async () => {
                                        if (processingIds.has(req.id)) return;
                                        setProcessingIds(prev => new Set(prev).add(req.id));
                                        try {
                                            await acceptConnectionRequest(req.id, user, req.sender_id);
                                            // Remover da lista local para feedback instantâneo
                                            setPendingRequests(prev => prev.filter(p => p.id !== req.id));
                                        } catch (e) {
                                            console.error(e);
                                        } finally {
                                            setProcessingIds(prev => {
                                                const next = new Set(prev);
                                                next.delete(req.id);
                                                return next;
                                            });
                                        }
                                    }}
                                    disabled={processingIds.has(req.id)}
                                >
                                    {processingIds.has(req.id) ? (
                                        <ActivityIndicator size="small" color={Colors.white} />
                                    ) : (
                                        <Text style={styles.btnAcceptText}>Aceitar</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btn, styles.btnReject]}
                                    onPress={() => rejectConnectionRequest(req.id)}
                                >
                                    <Text style={styles.btnRejectText}>Ignorar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Não tem convites pendentes no momento.</Text>
                )}
            </View>

            {/* Minhas Conexões */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Minhas Conexões ({connectionsCount})</Text>
                {connections.length > 0 ? (
                    <View style={styles.listGroup}>
                        {connections.map(conn => (
                            <TouchableOpacity 
                                key={`conn-${conn.id}`} 
                                style={styles.listCard}
                                onPress={() => router.push(`/user/${conn.id}`)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.listAvatar}>
                                    {conn.profile_photo ? (
                                        <Image source={{ uri: conn.profile_photo }} style={{width: 48, height: 48, borderRadius: 24}} />
                                    ) : (
                                        <Text style={{fontSize: 20, fontWeight: '700', color: Colors.primary}}>{conn.name?.[0] || '?'}</Text>
                                    )}
                                </View>
                                <View style={styles.listInfo}>
                                    <Text style={styles.listName} numberOfLines={1}>{conn.name}</Text>
                                    <Text style={styles.listRole} numberOfLines={1}>
                                        {conn.role === 'WORKER' ? conn.profession_category || 'Profissional' : 'Cliente'}
                                    </Text>
                                </View>
                                <View style={[styles.suggBtn, { borderColor: Colors.textSecondary }]}>
                                    <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} style={{marginRight: 4}} />
                                    <Text style={[styles.suggBtnText, { color: Colors.textSecondary }]}>Perfil</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>Ainda não tem conexões.</Text>
                )}
            </View>

            {/* Sugestões */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pessoas que talvez conheça </Text>
                <View style={styles.listGroup}>
                    {suggestions.map(sugg => (
                        <TouchableOpacity 
                            key={`sugg-${sugg.id}`} 
                            style={styles.listCard}
                            onPress={() => router.push(`/user/${sugg.id}`)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.listAvatar}>
                                {sugg.profile_photo ? (
                                    <Image source={{ uri: sugg.profile_photo }} style={{width: 48, height: 48, borderRadius: 24}} />
                                ) : (
                                    <Text style={{fontSize: 20, fontWeight: '700', color: Colors.primary}}>{sugg.name?.[0] || '?'}</Text>
                                )}
                            </View>
                            <View style={styles.listInfo}>
                                <Text style={styles.listName} numberOfLines={1}>{sugg.name}</Text>
                                <Text style={styles.listRole} numberOfLines={1}>
                                    {sugg.role === 'WORKER' ? sugg.profession_category || 'Profissional' : 'Cliente'}
                                </Text>
                            </View>
                            
                            {sentRequestIds.has(sugg.id) ? (
                                <View style={[styles.suggBtn, styles.sentBtn]}>
                                    <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} style={{marginRight: 4}} />
                                    <Text style={[styles.suggBtnText, { color: Colors.textSecondary }]}>Enviado</Text>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.suggBtn}
                                    onPress={() => handleConnect(sugg.id)}
                                    disabled={processingIds.has(sugg.id)}
                                >
                                    {processingIds.has(sugg.id) ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="person-add" size={14} color={Colors.primary} style={{marginRight: 4}} />
                                            <Text style={styles.suggBtnText}>Conectar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
                {suggestions.length === 0 && (
                    <Text style={styles.emptyText}>Sem sugestões para a sua localização de momento.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, paddingBottom: 100, maxWidth: 800, alignSelf: 'center', width: '100%' },
    pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 20 },
    section: { marginBottom: 30, backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0DFDC' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    
    requestCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    requestInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    requestName: { fontSize: 15, fontWeight: '700', color: Colors.text },
    requestSub: { fontSize: 13, color: Colors.textSecondary },
    requestActions: { flexDirection: 'row', gap: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    btnAccept: { backgroundColor: Colors.primary },
    btnAcceptText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
    btnReject: { backgroundColor: Colors.borderLight },
    btnRejectText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },

    listGroup: { flexDirection: 'column', gap: 12 },
    listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    listAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    listInfo: { flex: 1 },
    listName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
    listRole: { fontSize: 12, color: Colors.textSecondary },
    
    suggBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary, minWidth: 100, justifyContent: 'center' },
    suggBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
    sentBtn: { borderColor: Colors.border, backgroundColor: Colors.borderLight },
    
    emptyText: { color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});
