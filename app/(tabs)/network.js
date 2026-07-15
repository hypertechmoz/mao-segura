import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest } from '../../utils/chatSecureHelper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackHandler } from 'react-native';

export default function Network() {
    const { user } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [suggestions, setSuggestions] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequestIds, setSentRequestIds] = useState(new Set());
    const [connections, setConnections] = useState([]);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState(new Set());

    useEffect(() => {
        const uid = user?.uid || user?.id;
        if (!uid) return;

        let channel;

        const loadNetwork = async () => {
            setLoading(true);
            try {
                // 1. Fetch Received pending requests
                const { data: recData } = await supabase
                    .from('connection_requests')
                    .select('*')
                    .eq('receiver_id', uid)
                    .eq('status', 'PENDING');
                setPendingRequests(recData || []);

                // 2. Fetch Sent pending requests
                const { data: sentData } = await supabase
                    .from('connection_requests')
                    .select('receiver_id')
                    .eq('sender_id', uid)
                    .eq('status', 'PENDING');
                const sentIds = new Set(sentData?.map(r => r.receiver_id) || []);
                setSentRequestIds(sentIds);

                // 3. Fetch Connections
                const { data: connDataRaw } = await supabase
                    .from('connections')
                    .select('user1_id, user2_id')
                    .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);

                const connIds = new Set();
                connDataRaw?.forEach(c => {
                    if (c.user1_id === uid) connIds.add(c.user2_id);
                    else connIds.add(c.user1_id);
                });

                if (connIds.size > 0) {
                    const { data: connUsers } = await supabase
                        .from('users')
                        .select('*')
                        .in('id', Array.from(connIds).slice(0, 10));
                    setConnections(connUsers || []);
                }
                setConnectionsCount(connIds.size);

                // 4. Fetch suggestions
                let suggestionsQuery = supabase.from('users').select('*').neq('id', uid).limit(50);
                if (!user?.is_premium && user?.province) {
                    suggestionsQuery = suggestionsQuery.eq('province', user.province);
                }
                const { data: suggestionsRaw } = await suggestionsQuery;

                const receivedIds = new Set(recData?.map(r => r.sender_id) || []);
                const filtered = (suggestionsRaw || []).filter(s =>
                    !connIds.has(s.id) && !sentIds.has(s.id) && !receivedIds.has(s.id)
                );
                
                // Em Premium, não há limite de província. E se houver premium eles ficam primeiro na lista.
                filtered.sort((a, b) => {
                    if (a.is_premium === b.is_premium) return 0;
                    return a.is_premium ? -1 : 1;
                });
                
                setSuggestions(filtered.slice(0, 10));

            } catch (err) {
                console.error("Error loading network:", err);
            } finally {
                setLoading(false);
            }
        };

        loadNetwork();

        // Real-time for requests
        channel = supabase.channel('network-requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests', filter: `receiver_id=eq.${uid}` }, () => loadNetwork())
            .subscribe();

        const backAction = () => {
            router.replace('/(tabs)/home');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => {
            supabase.removeChannel(channel);
            backHandler.remove();
        };
    }, [user?.id]);

    const handleConnect = async (targetId) => {
        if (processingIds.has(targetId)) return;

        setProcessingIds(prev => new Set(prev).add(targetId));
        try {
            await sendConnectionRequest(user, targetId, { type: 'CONNECTION' });
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Minha Rede</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>

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
                                    <View style={{ flex: 1 }}>
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
                                            <Image source={{ uri: conn.profile_photo }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                        ) : (
                                            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.primary }}>{conn.name?.[0] || '?'}</Text>
                                        )}
                                    </View>
                                    <View style={styles.listInfo}>
                                        <Text style={styles.listName} numberOfLines={1}>{conn.name}</Text>
                                        <Text style={styles.listRole} numberOfLines={1}>
                                            {conn.role === 'WORKER' ? conn.profession_category || 'Profissional' : 'Cliente'}
                                        </Text>
                                    </View>
                                    <View style={[styles.suggBtn, { borderColor: Colors.textSecondary }]}>
                                        <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
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
                                        <Image source={{ uri: sugg.profile_photo }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                    ) : (
                                        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.primary }}>{sugg.name?.[0] || '?'}</Text>
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
                                        <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
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
                                                <Ionicons name="person-add" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
    content: { padding: Spacing.md, paddingBottom: 100, maxWidth: 800, alignSelf: 'center', width: '100%' },
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
