import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Premium() {
    const { user } = useAuthStore();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const insets = useSafeAreaInsets();

    const fetchSubscription = async () => {
        const uid = user?.uid || user?.id;
        if (!uid) return;
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', uid)
                .maybeSingle();
            
            if (error) throw error;
            setSubscription(data);
        } catch (err) {
            console.error('Fetch sub error:', err);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const handleSubscribe = async (method) => {
        const uid = user?.uid || user?.id;
        if (!uid) return;
        setLoading(true);
        try {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            await supabase.from('subscriptions').upsert({
                user_id: uid,
                plan: 'PREMIUM',
                payment_method: method,
                expires_at: expiresAt
            });

            // Sync user premium status
            await supabase.from('users').update({ is_premium: true }).eq('id', uid);

            const { refreshUser } = useAuthStore.getState();
            await refreshUser();
            await fetchSubscription();
            setShowPayment(false);
            Alert.alert('Sucesso', 'Subscrição Konekt Mais ativada!');
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const uid = user?.uid || user?.id;
        if (!uid) return;
        Alert.alert('Cancelar Plano', 'Tem certeza que deseja cancelar o Konekt Mais?', [
            { text: 'Não', style: 'cancel' },
            {
                text: 'Sim, cancelar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await supabase.from('subscriptions').update({ plan: 'FREE' }).eq('user_id', uid);
                        await supabase.from('users').update({ is_premium: false }).eq('id', uid);
                        
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

    const isPremium = subscription?.plan === 'PREMIUM' || user?.is_premium;

    const renderFeature = (text, included, premiumOnly = false) => (
        <View style={styles.featureRow}>
            <Ionicons 
                name={included ? "checkmark-circle" : "close-circle"} 
                size={22} 
                color={included ? (premiumOnly ? Colors.premium : Colors.success) : Colors.border} 
            />
            <Text style={[styles.featureText, !included && styles.featureTextDisabled, premiumOnly && styles.featureTextPremium]}>
                {text}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl, paddingTop: Math.max(insets.top, 10) + Spacing.xl }]}>
            
            <View style={styles.header}>
                <View style={styles.crownContainer}>
                    <Ionicons name="diamond" size={36} color={Colors.white} />
                </View>
                <Text style={styles.mainTitle}>Escolha o seu plano</Text>
                <Text style={styles.mainSubtitle}>Melhore a sua experiência e alcance mais clientes com o Konekt Mais.</Text>
            </View>

            {/* PLANO FREE */}
            <View style={styles.cardsContainer}>
                <View style={[styles.planCard, isPremium ? styles.planCardInactive : styles.planCardActive]}>
                <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>Konekta Free</Text>
                    {!isPremium && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Plano Atual</Text></View>}
                </View>
                <Text style={styles.planPrice}>0 MT<Text style={styles.planPricePeriod}>/mês</Text></Text>
                <Text style={styles.planDesc}>O essencial para começar a encontrar oportunidades na sua cidade.</Text>
                
                <View style={styles.featuresList}>
                    {renderFeature("Perfil profissional básico", true)}
                    {renderFeature("Acesso a vagas da sua cidade", true)}
                    {renderFeature("Limite de 3 vagas/mês", true)}
                    {renderFeature("Destaque nas pesquisas", false)}
                    {renderFeature("Acesso a vagas de todo o país", false)}
                    {renderFeature("Selo azul de Conta Oficial", false)}
                </View>
            </View>

            {/* PLANO PLUS */}
            <View style={[styles.planCard, styles.premiumCard, isPremium && styles.planCardActive]}>
                <View style={styles.planHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.planTitle, { color: Colors.white }]}>Konekt Mais</Text>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    </View>
                    {isPremium && <View style={[styles.currentBadge, { backgroundColor: Colors.white }]}><Text style={[styles.currentBadgeText, { color: Colors.premium }]}>Plano Atual</Text></View>}
                </View>
                <Text style={[styles.planPrice, { color: Colors.white }]}>500 MT<Text style={[styles.planPricePeriod, { color: 'rgba(255,255,255,0.7)' }]}>/mês</Text></Text>
                <Text style={[styles.planDesc, { color: 'rgba(255,255,255,0.9)' }]}>Desbloqueie todo o potencial da plataforma sem limites geográficos.</Text>
                
                <View style={styles.featuresList}>
                    {renderFeature("Tudo do plano Free", true, true)}
                    {renderFeature("Acesso a vagas de TODO O PAÍS", true, true)}
                    {renderFeature("Publicações e Vagas ILIMITADAS", true, true)}
                    {renderFeature("Destaque absoluto nas pesquisas", true, true)}
                    {renderFeature("Selo azul de Conta Oficial", true, true)}
                    {renderFeature("Mensagens diretas ilimitadas", true, true)}
                </View>

                {isPremium ? (
                    <View style={styles.activePlanContainer}>
                        <Text style={styles.expiryText}>
                            Renova em: {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('pt-MZ') : 'N/A'}
                        </Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelText}>Cancelar Plano Plus</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.subscribeContainer}>
                        {!showPayment ? (
                            <TouchableOpacity style={styles.btnStart} onPress={() => setShowPayment(true)}>
                                <Text style={styles.btnStartText}>Começar Konekt Mais</Text>
                                <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.paymentMethods}>
                                <Text style={styles.paymentTitle}>Escolha como pagar:</Text>
                                <TouchableOpacity
                                    style={[styles.payButton, styles.mpesaButton]}
                                    onPress={() => handleSubscribe('MPESA')}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.payButtonText}>M-Pesa</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.payButton, styles.emolaButton]}
                                    onPress={() => handleSubscribe('EMOLA')}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.payButtonText}>e-Mola</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnBack} onPress={() => setShowPayment(false)}>
                                    <Text style={styles.btnBackText}>Voltar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
                </View>

            {/* PLANO MAX (Futuro / Lembrete) */}
            <View style={[styles.planCard, styles.maxCard]}>
                <View style={styles.planHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.planTitle, { color: Colors.white }]}>Konekta Max</Text>
                        <Ionicons name="infinite" size={20} color={Colors.white} />
                    </View>
                    <View style={[styles.currentBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Text style={[styles.currentBadgeText, { color: Colors.white }]}>Em Breve</Text></View>
                </View>
                <Text style={[styles.planPrice, { color: Colors.white }]}>---<Text style={[styles.planPricePeriod, { color: 'rgba(255,255,255,0.7)' }]}>/mês</Text></Text>
                <Text style={[styles.planDesc, { color: 'rgba(255,255,255,0.9)' }]}>Acesso total e absoluto. Seja cliente, profissional e empresa em simultâneo.</Text>
                
                <View style={styles.featuresList}>
                    {renderFeature("Tudo do Konekt Mais", true, true)}
                    {renderFeature("Seja Cliente e Profissional ao mesmo tempo", true, true)}
                    {renderFeature("Criar e gerir Conta Empresarial", true, true)}
                    {renderFeature("Interagir com qualquer utilizador (sem restrições)", true, true)}
                    {renderFeature("Acesso Exclusivo a futuras funcionalidades", true, true)}
                </View>

                <View style={styles.subscribeContainer}>
                    <TouchableOpacity style={[styles.btnStart, { backgroundColor: 'rgba(255,255,255,0.2)', elevation: 0, shadowOpacity: 0 }]} disabled={true}>
                        <Text style={[styles.btnStartText, { color: Colors.white }]}>Indisponível no momento</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>

            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, ...(Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center', width: '100%' } : {}) },
    header: { alignItems: 'center', paddingVertical: Spacing.xl },
    crownContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.premium, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, shadowColor: Colors.premium, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
    mainTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
    mainSubtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
    
    cardsContainer: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap', gap: Spacing.lg, width: '100%', alignItems: 'stretch', justifyContent: 'center', paddingBottom: Spacing.xl },
    planCard: { flex: Platform.OS === 'web' ? 1 : undefined, minWidth: Platform.OS === 'web' ? 300 : '100%', backgroundColor: Colors.white, borderRadius: 24, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
    planCardActive: { borderColor: Colors.primary, borderWidth: 2 },
    planCardInactive: { opacity: 0.8 },
    premiumCard: { backgroundColor: Colors.primary, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.2 },
    maxCard: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', shadowColor: '#000', shadowOpacity: 0.3 },
    
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    planTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
    currentBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    currentBadgeText: { color: Colors.primary, fontSize: Fonts.sizes.xs, fontWeight: '700' },
    
    planPrice: { fontSize: 36, fontWeight: '900', color: Colors.text, marginBottom: Spacing.xs },
    planPricePeriod: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.textSecondary },
    planDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 20 },
    
    featuresList: { gap: 14 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { fontSize: Fonts.sizes.md, color: Colors.text, flex: 1, fontWeight: '500' },
    featureTextDisabled: { color: Colors.textLight, textDecorationLine: 'line-through' },
    featureTextPremium: { color: Colors.white, fontWeight: '700' },

    activePlanContainer: { marginTop: Spacing.xl, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: Spacing.lg },
    expiryText: { color: 'rgba(255,255,255,0.9)', fontSize: Fonts.sizes.sm, textAlign: 'center', marginBottom: Spacing.md },
    cancelButton: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 14, borderRadius: 12, alignItems: 'center' },
    cancelText: { color: Colors.white, fontWeight: '600', fontSize: Fonts.sizes.sm },

    subscribeContainer: { marginTop: Spacing.xl },
    btnStart: { backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    btnStartText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },

    paymentMethods: { backgroundColor: 'rgba(255,255,255,0.1)', padding: Spacing.md, borderRadius: 16 },
    paymentTitle: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: '600', marginBottom: Spacing.md, textAlign: 'center' },
    payButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.sm },
    mpesaButton: { backgroundColor: '#E60000' },
    emolaButton: { backgroundColor: '#FF6600' },
    payButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
    btnBack: { padding: Spacing.sm, alignItems: 'center', marginTop: 4 },
    btnBackText: { color: 'rgba(255,255,255,0.8)', fontSize: Fonts.sizes.sm, fontWeight: '600' }
});
