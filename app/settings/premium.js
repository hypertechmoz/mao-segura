import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Premium() {
    const { user } = useAuthStore();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSubscription = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'subscriptions'), where('user_id', '==', user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                setSubscription({ id: snap.docs[0].id, ...snap.docs[0].data() });
            } else {
                setSubscription(null);
            }
        } catch (err) {
            console.error('Fetch sub error:', err);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const handleSubscribe = async (method) => {
        if (!user) return;
        setLoading(true);
        try {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            // Check if exists
            const q = query(collection(db, 'subscriptions'), where('user_id', '==', user.uid));
            const snap = await getDocs(q);
            
            if (!snap.empty) {
                const subId = snap.docs[0].id;
                await updateDoc(doc(db, 'subscriptions', subId), { plan: 'PREMIUM', payment_method: method, expires_at: expiresAt });
            } else {
                await setDoc(doc(collection(db, 'subscriptions')), { user_id: user.uid, plan: 'PREMIUM', payment_method: method, expires_at: expiresAt });
            }

            // Sync user premium status
            await updateDoc(doc(db, 'users', user.uid), { is_premium: true });

            const { refreshUser } = useAuthStore.getState();
            await refreshUser();
            await fetchSubscription();
            Alert.alert('Sucesso', 'Subscrição Premium ativada!');
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!user) return;
        Alert.alert('Cancelar Premium', 'Tem certeza que deseja cancelar?', [
            { text: 'Não', style: 'cancel' },
            {
                text: 'Sim, cancelar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const q = query(collection(db, 'subscriptions'), where('user_id', '==', user.uid));
                        const snap = await getDocs(q);
                        if (!snap.empty) {
                            await updateDoc(doc(db, 'subscriptions', snap.docs[0].id), { plan: 'FREE' });
                        }
                        await updateDoc(doc(db, 'users', user.uid), { is_premium: false });
                        const { refreshUser } = useAuthStore.getState();
                        await refreshUser();
                        await fetchSubscription();
                    } catch (err) {
                        Alert.alert('Erro', err.message);
                    }
                },
            },
        ]);
    };

    const isPremium = subscription?.plan === 'PREMIUM';

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.crown}>
                    <Ionicons name="trophy" size={32} color={Colors.premium} />
                </View>
                <Text style={styles.title}>Mão Segura Premium</Text>
                <Text style={styles.subtitle}>
                    Destaque o seu perfil e tenha acesso a funcionalidades exclusivas
                </Text>

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Ionicons name="star" size={20} color={Colors.premium} style={styles.featureIcon} />
                        <Text style={styles.featureText}>Perfil destacado nas pesquisas</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="bar-chart" size={20} color={Colors.info} style={styles.featureIcon} />
                        <Text style={styles.featureText}>Estatísticas do perfil</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="notifications" size={20} color={Colors.warning} style={styles.featureIcon} />
                        <Text style={styles.featureText}>Alertas de vagas prioritários</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} style={styles.featureIcon} />
                        <Text style={styles.featureText}>Selo Premium no perfil</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="chatbubbles" size={20} color={Colors.primary} style={styles.featureIcon} />
                        <Text style={styles.featureText}>Mensagens ilimitadas</Text>
                    </View>
                </View>

                {isPremium ? (
                    <View style={styles.activePlan}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                            <Text style={styles.activePlanText}>Plano Premium Ativo</Text>
                        </View>
                        <Text style={styles.expiryText}>
                            Expira em: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('pt-MZ') : 'N/A'}
                        </Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelText}>Cancelar plano</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.paymentOptions}>
                        <Text style={styles.priceText}>500 MT/mês</Text>

                        <TouchableOpacity
                            style={[styles.payButton, styles.mpesaButton]}
                            onPress={() => handleSubscribe('MPESA')}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.payButtonText}>Pagar com M-Pesa</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.payButton, styles.emolaButton]}
                            onPress={() => handleSubscribe('EMOLA')}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.payButtonText}>Pagar com e-Mola</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md, ...(Platform.OS === 'web' ? { alignItems: 'center' } : {}) },
    card: { backgroundColor: Colors.white, borderRadius: 20, padding: Spacing.lg, alignItems: 'center', ...(Platform.OS === 'web' ? { maxWidth: 500, width: '100%' } : {}) },
    crown: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.premium + '20', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },

    title: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
    features: { width: '100%', gap: 12, marginBottom: Spacing.lg },
    feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureIcon: { width: 28, textAlign: 'center' },
    featureText: { fontSize: Fonts.sizes.md, color: Colors.text },
    activePlan: { width: '100%', alignItems: 'center' },
    activePlanText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
    expiryText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: Colors.error + '12' },
    cancelText: { color: Colors.error, fontWeight: '600', fontSize: Fonts.sizes.sm },
    paymentOptions: { width: '100%', alignItems: 'center', gap: 12 },
    priceText: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
    payButton: { width: '100%', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    mpesaButton: { backgroundColor: '#E60000' },
    emolaButton: { backgroundColor: '#FF6600' },
    payButtonText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' },
});
