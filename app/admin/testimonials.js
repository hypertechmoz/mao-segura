import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function ManageTestimonials() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED
    const [refreshing, setRefreshing] = useState(false);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('testimonials')
                .select('*, author:users!user_id(profile_photo)')
                .eq('status', filter)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const formattedData = data.map(item => ({
                ...item,
                user_photo: item.author?.profile_photo
            }));
            
            setTestimonials(formattedData);
        } catch (err) {
            console.error('Error loading testimonials:', err);
            Alert.alert('Erro', 'Não foi possível carregar os depoimentos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            router.replace('/(tabs)/home');
            return;
        }
        loadTestimonials();
    }, [user, filter]);

    const handleAction = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    approved_by: user?.uid || user?.id
                })
                .eq('id', id);
            
            if (error) throw error;
            
            Alert.alert('Sucesso', `Depoimento ${newStatus === 'APPROVED' ? 'aprovado' : 'rejeitado'} com sucesso.`);
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error updating testimonial:', err);
            Alert.alert('Erro', 'Não foi possível atualizar o depoimento.');
        }
    };

    const renderItem = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        {item.user_photo ? (
                            <Image source={{ uri: item.user_photo }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <View style={styles.roleRow}>
                            <Ionicons name={item.role === 'WORKER' ? 'hammer' : 'business'} size={10} color={Colors.textLight} />
                            <Text style={styles.userRole}>{item.role === 'WORKER' ? 'Profissional' : 'Cliente'}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={14} color={s <= item.rating ? Colors.star : Colors.border} />
                    ))}
                </View>
            </View>

            <View style={styles.contentBox}>
                <Ionicons name="quote" size={20} color={Colors.primary + '20'} style={styles.quoteIcon} />
                <Text style={styles.text}>{item.text}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</Text>
            </View>

            {filter === 'PENDING' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]} 
                        onPress={() => handleAction(item.id, 'APPROVED')}
                    >
                        <Ionicons name="checkmark" size={18} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]} 
                        onPress={() => handleAction(item.id, 'REJECTED')}
                    >
                        <Ionicons name="close" size={18} color={Colors.error} />
                        <Text style={[styles.actionButtonText, { color: Colors.error }]}>Rejeitar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabsHeader}>
                <View style={styles.tabs}>
                    {['PENDING', 'APPROVED', 'REJECTED'].map((t) => (
                        <TouchableOpacity 
                            key={t} 
                            style={[styles.tab, filter === t && styles.activeTab]}
                            onPress={() => setFilter(t)}
                        >
                            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>
                                {t === 'PENDING' ? 'Pendentes' : t === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && testimonials.length === 0 ? (
                <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadTestimonials(); }}
                        />
                    }
                >
                    {testimonials.length === 0 ? (
                        <View style={styles.empty}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="chatbox-ellipses-outline" size={48} color={Colors.border} />
                            </View>
                            <Text style={styles.emptyText}>Nenhum depoimento encontrado.</Text>
                        </View>
                    ) : (
                        testimonials.map(renderItem)
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    tabsHeader: { backgroundColor: Colors.white, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    tabs: { flexDirection: 'row', backgroundColor: Colors.background, padding: 4, borderRadius: 12, gap: 4 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    tabText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
    activeTabText: { color: Colors.white },
    
    scrollContent: { padding: Spacing.md, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    card: { 
        backgroundColor: Colors.white, 
        borderRadius: 18, 
        padding: Spacing.md, 
        marginBottom: Spacing.md, 
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: 44, height: 44 },
    avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
    userName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    roleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    userRole: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    ratingRow: { flexDirection: 'row', gap: 2, backgroundColor: '#FFD70015', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
    
    contentBox: { position: 'relative', paddingVertical: 10 },
    quoteIcon: { position: 'absolute', top: -5, left: -5 },
    text: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontWeight: '500' },
    
    cardFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
    date: { fontSize: 11, color: Colors.textLight, textAlign: 'right' },
    
    actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    actionButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    approveButton: { backgroundColor: Colors.primary },
    rejectButton: { backgroundColor: Colors.error + '10' },
    actionButtonText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
    
    empty: { alignItems: 'center', marginTop: 100 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { color: Colors.textLight, fontSize: Fonts.sizes.md, fontWeight: '600' }
});
