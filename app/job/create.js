import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { sendPushNotification } from '../../services/notificationService';
import { Colors, Spacing, Fonts, JOB_TYPES, CONTRACT_TYPES, PROFESSION_CATEGORIES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function CreateJob() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    
    // Suggestion state
    const [titleQuery, setTitleQuery] = useState('');
    const [titleSuggestions, setTitleSuggestions] = useState([]);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

    const [typeQuery, setTypeQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [form, setForm] = useState({
        title: '',
        type: '',
        contractType: 'TEMPORARY',
        forResidence: true,
        description: '',
    });

    const update = (field, value) => setForm({ ...form, [field]: value });

    // Handle suggestions
    useEffect(() => {
        if (titleQuery.length > 0) {
            const filtered = PROFESSION_CATEGORIES.filter(c => 
                c.toLowerCase().includes(titleQuery.toLowerCase())
            );
            setTitleSuggestions(filtered);
            setShowTitleSuggestions(filtered.length > 0);
        } else {
            setTitleSuggestions([]);
            setShowTitleSuggestions(false);
        }
    }, [titleQuery]);

    useEffect(() => {
        if (typeQuery.length > 0) {
            const filtered = JOB_TYPES.filter(t => 
                t.toLowerCase().includes(typeQuery.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [typeQuery]);

    const selectTitleSuggestion = (c) => {
        setTitleQuery(c);
        update('title', c);
        setShowTitleSuggestions(false);
    };

    const selectSuggestion = (t) => {
        setTypeQuery(t);
        update('type', t);
        if (!form.title.trim()) {
            update('title', t);
        }
        setShowSuggestions(false);
    };

    const handleCreate = async () => {
        if (!user) return;
        const { title, type, contractType, description, forResidence } = form;
        const { province, city, bairro } = user;
        console.log('Validating job creation form:', { title, type, contractType, description, province, city });

        // Specific field validation for better feedback
        if (!title.trim()) {
            Alert.alert('Atenção', 'O título da vaga é obrigatório.');
            return;
        }
        if (!type.trim()) {
            Alert.alert('Atenção', 'O tipo de trabalho é obrigatório.');
            return;
        }
        if (!contractType) {
            Alert.alert('Atenção', 'Selecione o tipo de contrato.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Atenção', 'A descrição da vaga é obrigatória.');
            return;
        }
        if (!province || !city) {
            Alert.alert('Atenção', 'Selecione a localização (Província e Cidade) no seu perfil primeiro.');
            return;
        }

        setLoading(true);
        try {
            // We don't await the addDoc so that UI does not hang on slow networks 
            // causing ERR_QUIC_PROTOCOL_ERROR. Firebase handles the sync in the background.
            const jobPromise = addDoc(collection(db, 'jobs'), {
                employer_id: user.uid,
                title: title.trim(),
                type: type.trim(),
                description: description.trim(),
                contract_type: contractType,
                for_residence: forResidence,
                province: province,
                city: city,
                bairro: bairro || '',
                status: 'ACTIVE',
                applications_count: 0,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });

            // Disparar Notificação Background no fututo (não atrasa a UI)
            jobPromise.then(() => {
                const qWorkers = query(collection(db, 'users'), where('role', '==', 'WORKER'));
                getDocs(qWorkers).then(snap => {
                    snap.forEach(docSnap => {
                        const data = docSnap.data();
                        if (data.pushToken && data.city === city) {
                            sendPushNotification(
                                data.pushToken, 
                                'Nova Vaga na sua Cidade!', 
                                `${title.trim()}`, 
                                { type: 'job' }
                            );
                        }
                    });
                }).catch(e => console.warn('Background workers query error:', e));
            }).catch(e => console.warn('Background job publish error:', e));

            setLoading(false);
            setShowSuccessCard(true);
        } catch (err) {
            setLoading(false);
            if (Platform.OS === 'web') {
                window.alert('Erro: ' + err.message);
            } else {
                Alert.alert('Erro', err.message);
            }
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <Modal visible={showSuccessCard} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIconBox}>
                            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                        </View>
                        <Text style={styles.successTitle}>Vaga Publicada!</Text>
                        <Text style={styles.successDesc}>A sua vaga está a ser enviada e estará disponível na comunidade em segundos.</Text>
                        <TouchableOpacity 
                            style={styles.successBtn} 
                            onPress={() => {
                                setShowSuccessCard(false);
                                router.replace('/(tabs)/home');
                            }}
                        >
                            <Text style={styles.successBtnText}>Feito</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.content} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Publicar Vaga</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Text style={styles.heading}>Publicar nova vaga</Text>

                <View style={[styles.tipsCard, { marginBottom: Spacing.xl }]}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb" size={20} color={Colors.warning} />
                        <Text style={styles.tipsTitle}>Dicas de Sucesso</Text>
                    </View>
                    <Text style={styles.tipsText}>• Descreva os detalhes e requisitos com clareza. Vagas claras recebem as candidaturas certas 3x mais rápido.</Text>
                    <Text style={styles.tipsText}>• Profissionais confiam em perfis autênticos: empregadores com a conta 100% preenchida têm a preferência dos melhores trabalhadores.</Text>
                </View>

                <View style={[styles.inputGroup, { zIndex: 1001 }]}>
                    <Text style={styles.label}>Categoria da vaga *</Text>
                    <View style={styles.suggestionContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ex: Construção e reparos" 
                            placeholderTextColor={Colors.textLight} 
                            value={titleQuery} 
                            onChangeText={(v) => {
                                setTitleQuery(v);
                                update('title', v);
                            }}
                            onFocus={() => {
                                if (titleQuery.length > 0) setShowTitleSuggestions(true);
                            }}
                        />
                        {showTitleSuggestions && (
                            <View style={styles.suggestionsList}>
                                {titleSuggestions.map((t, i) => (
                                    <TouchableOpacity 
                                        key={i} 
                                        style={styles.suggestionItem} 
                                        onPress={() => selectTitleSuggestion(t)}
                                    >
                                        <Text style={styles.suggestionText}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                    <Text style={styles.label}>Tipo de trabalho *</Text>
                    <View style={styles.suggestionContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Selecione o tipo" 
                            placeholderTextColor={Colors.textLight} 
                            value={typeQuery} 
                            onChangeText={(v) => {
                                setTypeQuery(v);
                                update('type', v);
                                if (!form.title.trim()) {
                                    update('title', v);
                                }
                            }}
                            onFocus={() => {
                                if (typeQuery.length > 0) setShowSuggestions(true);
                            }}
                        />
                        {showSuggestions && (
                            <View style={styles.suggestionsList}>
                                {suggestions.map((t, i) => (
                                    <TouchableOpacity 
                                        key={i} 
                                        style={styles.suggestionItem} 
                                        onPress={() => selectSuggestion(t)}
                                    >
                                        <Text style={styles.suggestionText}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de contrato *</Text>
                    <View style={styles.optionRow}>
                        {CONTRACT_TYPES.map((ct) => (
                            <TouchableOpacity
                                key={ct.value}
                                style={[styles.option, form.contractType === ct.value && styles.optionActive]}
                                onPress={() => update('contractType', ct.value)}
                            >
                                <Text style={[styles.optionText, form.contractType === ct.value && styles.optionTextActive]}>{ct.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Para</Text>
                    <View style={styles.optionRow}>
                        <TouchableOpacity
                            style={[styles.option, form.forResidence === true && styles.optionActive]}
                            onPress={() => update('forResidence', true)}
                        >
                            <View style={styles.chipContent}>
                                <Ionicons name="home-outline" size={16} color={form.forResidence === true ? Colors.primary : Colors.textSecondary} />
                                <Text style={[styles.optionText, form.forResidence === true && styles.optionTextActive]}>Residência</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.option, form.forResidence === false && styles.optionActive]}
                            onPress={() => update('forResidence', false)}
                        >
                            <View style={styles.chipContent}>
                                <Ionicons name="business-outline" size={16} color={form.forResidence === false ? Colors.primary : Colors.textSecondary} />
                                <Text style={[styles.optionText, form.forResidence === false && styles.optionTextActive]}>Mini-empresa</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descrição da vaga *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Procura-se dois agentes para uma construção..."
                        placeholderTextColor={Colors.textLight}
                        multiline
                        textAlignVertical="top"
                        value={form.description}
                        onChangeText={(v) => update('description', v)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.label}>Localização do Trabalho</Text>
                    </View>
                    <View style={styles.locationSummary}>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.locationSummaryText}>
                            {user?.city}, {user?.province} {user?.bairro ? `• ${user.bairro}` : ''}
                        </Text>
                        <View style={styles.lockBadge}>
                            <Ionicons name="lock-closed" size={10} color={Colors.textLight} />
                            <Text style={styles.lockText}>Perfil</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
                        A localização é baseada no seu perfil para maior transparência e confiança na comunidade.
                    </Text>
                </View>

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Publicar Vaga</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 0 : 10 },
    backButton: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    heading: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xl },
    inputGroup: { marginBottom: Spacing.lg },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
    input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 16, fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
    textArea: { height: 120, paddingTop: 16 },
    
    // Suggestions
    suggestionContainer: { position: 'relative' },
    suggestionsList: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight, marginTop: 4, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, zIndex: 1000 },
    suggestionItem: { paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    suggestionText: { fontSize: Fonts.sizes.md, color: Colors.text },

    // Chips
    optionRow: { flexDirection: 'row', gap: 10 },
    option: { flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
    optionActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
    optionText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },
    optionTextActive: { color: Colors.primary },
    chipContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    // Localização Selectors
    localContainer: { backgroundColor: Colors.background, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: Colors.borderLight },
    horizontalSelect: { flexDirection: 'row' },
    selectChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.white, marginRight: 8, borderWidth: 1, borderColor: Colors.borderLight },
    selectChipActive: { backgroundColor: Colors.white, borderColor: Colors.primary },
    selectChipText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '600' },
    selectChipTextActive: { color: Colors.primary },

    button: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '800' },
    tipsCard: { backgroundColor: Colors.warning + '15', borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '30' },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
    tipsTitle: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: '#B26A00' },
    tipsText: { fontSize: 13, color: Colors.text, lineHeight: 20, marginBottom: 6 },

    locationSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 14, borderRadius: 12, marginTop: 4, gap: 8, borderWidth: 1, borderColor: Colors.borderLight },
    locationSummaryText: { fontSize: Fonts.sizes.md, color: Colors.text, fontWeight: '600' },
    lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.borderLight },
    lockText: { fontSize: 10, color: Colors.textLight, fontWeight: '800', textTransform: 'uppercase' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    successCard: { backgroundColor: Colors.white, borderRadius: 24, padding: Spacing.xl, width: '100%', maxWidth: 400, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    successIconBox: { backgroundColor: '#E8F5E9', borderRadius: 100, padding: 16, marginBottom: Spacing.lg },
    successTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
    successDesc: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.sm, marginBottom: Spacing.xl },
    successBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
    successBtnText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '800' },
});
