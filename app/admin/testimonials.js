import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function ManageTestimonials() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'testimonials'), 
                where('status', '==', filter),
                orderBy('created_at', 'desc')
            );
            const snap = await getDocs(q);
            const data = [];
            for (const d of snap.docs) {
                const item = { id: d.id, ...d.data() };
                // Fetch user photo if missing
                if (item.user_id) {
                   const uSnap = await getDoc(doc(db, 'users', item.user_id));
                   if (uSnap.exists()) {
                       item.user_photo = uSnap.data().profile_photo;
                   }
                }
                data.push(item);
            }
            setTestimonials(data);
        } catch (err) {
            console.error('Error loading testimonials:', err);
            Alert.alert('Erro', 'Não foi possível carregar os depoimentos.');
        } finally {
            setLoading(false);
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
            await updateDoc(doc(db, 'testimonials', id), {
                status: newStatus,
                updated_at: serverTimestamp(),
                approved_by: user.uid
            });
            Alert.alert('Sucesso', `Depoimento ${newStatus === 'APPROVED' ? 'aprovado' : 'rejeitado'} com sucesso.`);
            loadTestimonials();
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
                            <Text style={styles.avatarText}>{item.name?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userRole}>{item.role === 'WORKER' ? 'Trabalhador' : 'Empregador'}</Text>
                    </View>
                </View>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={14} color={s <= item.rating ? Colors.star : Colors.border} />
                    ))}
                </View>
            </View>
            <Text style={styles.text}>"{item.text}"</Text>
            <Text style={styles.date}>{item.created_at?.toDate().toLocaleDateString('pt-MZ')}</Text>

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
                        <Ionicons name="close" size={18} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Rejeitar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
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

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {testimonials.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="chatbox-outline" size={48} color={Colors.textLight} />
                            <Text style={styles.emptyText}>Nenhum depoimento nesta categoria.</Text>
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
    tabs: { flexDirection: 'row', backgroundColor: Colors.white, padding: 8, gap: 8 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: Colors.primaryBg },
    tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    activeTabText: { color: Colors.primary },
    scrollContent: { padding: Spacing.md },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOpacity: 0.5, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: 36, height: 36 },
    avatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    userName: { fontSize: 15, fontWeight: '700', color: Colors.text },
    userRole: { fontSize: 11, color: Colors.textSecondary },
    ratingRow: { flexDirection: 'row', gap: 2 },
    text: { fontSize: 14, color: Colors.text, lineHeight: 20, fontStyle: 'italic', marginBottom: 10 },
    date: { fontSize: 11, color: Colors.textLight, textAlign: 'right' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 15, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 15 },
    actionButton: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
    approveButton: { backgroundColor: Colors.success },
    rejectButton: { backgroundColor: Colors.error },
    actionButtonText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: Colors.textLight, fontSize: 14 },
});
