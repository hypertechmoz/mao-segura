import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { uploadImage } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { sendPushNotification } from '../../services/notificationService';
import { Colors, Spacing, Fonts, CONTRACT_TYPES, AVAILABILITY_TYPES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import UpgradeModal from '../../components/UpgradeModal';

export default function CreateJob() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const { categories, specialties } = useTaxonomy();
    
    const [titleQuery, setTitleQuery] = useState('');
    const [titleSuggestions, setTitleSuggestions] = useState([]);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const [typeQuery, setTypeQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [form, setForm] = useState({
        title: '',
        type: '',
        contractType: null,
        availability: null,
        description: '',
    });
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0].uri) {
            const asset = result.assets[0];
            let size = asset.fileSize;
            
            if (Platform.OS === 'web' && asset.file) {
                size = asset.file.size;
            } else if (!size && Platform.OS === 'web') {
                try {
                    const response = await fetch(asset.uri);
                    const blob = await response.blob();
                    size = blob.size;
                } catch(e) {}
            }

            if (size && size > 2 * 1024 * 1024) {
                const msg = 'O tamanho da imagem excede o limite máximo de 2MB.';
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Imagem Muito Grande', msg);
                return;
            }

            setImageUri(asset.uri);
        }
    };

    const update = (field, value) => setForm({ ...form, [field]: value });

    // Handle suggestions
    useEffect(() => {
        if (titleQuery.length > 0) {
            const filtered = categories.filter(c => 
                c.name.toLowerCase().includes(titleQuery.toLowerCase())
            ).map(c => c.name);
            setTitleSuggestions(filtered);
            setShowTitleSuggestions(filtered.length > 0);
        } else {
            setTitleSuggestions([]);
            setShowTitleSuggestions(false);
        }
    }, [titleQuery, categories]);

    useEffect(() => {
        if (typeQuery.length > 0) {
            // Find category to restrict specialties (optional), for now search all specialties
            const filtered = specialties.filter(s => 
                s.name.toLowerCase().includes(typeQuery.toLowerCase())
            ).map(s => s.name);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [typeQuery, specialties]);

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
        if (authLoading) {
            Alert.alert('Aguarde', 'Ainda estamos a carregar a sua sessão.');
            return;
        }

        if (!user) {
            Alert.alert('Sessão inválida', 'Entre novamente para publicar a vaga.');
            router.replace('/auth/login');
            return;
        }

        if (user.role !== 'EMPLOYER') {
            Alert.alert('Acesso bloqueado', 'Apenas clientes/empregadores podem publicar vagas.');
            return;
        }

        const { title, type, contractType, description } = form;
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
            console.log('Creating job...');
            
            // Verificação de limites de plano (Empregador)
            const plan = user?.subscription_plan || 'FREE';
            if (plan !== 'MAX') {
                const limit = plan === 'PLUS' ? 5 : 1;
                
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const { count, error: countErr } = await supabase
                    .from('jobs')
                    .select('*', { count: 'exact', head: true })
                    .eq('employer_id', user.uid || user.id)
                    .gte('created_at', thirtyDaysAgo.toISOString());
                
                if (!countErr && count >= limit) {
                    setLoading(false);
                    setUpgradeMessage(`Atingiu o limite de publicações de vagas (${limit} por mês) do seu plano atual. Atualize para o Konekt Mais para publicar mais vagas e não perder talento!`);
                    setShowUpgradeModal(true);
                    return;
                }
            }

            
            let imageUrl = null;
            if (imageUri) {
                const fileName = `${Date.now()}.jpg`;
                const uploadPromise = uploadImage(imageUri, `jobs/${user.uid || user.id}/${fileName}`);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao carregar imagem.')), 20000));
                imageUrl = await Promise.race([uploadPromise, timeoutPromise]);
            }

            const jobPayload = {
                employer_id: user.uid || user.id,
                title: title.trim(),
                type: type.trim(),
                description: description.trim(),
                contract_type: contractType,
                availability: form.availability,
                province: province,
                city: city,
                bairro: bairro || '',
                status: 'ACTIVE',
                image_url: imageUrl || null,
            };

            console.log('Sending payload:', jobPayload);

            const dbPromise = supabase.from('jobs').insert(jobPayload).select();
            const dbTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo de espera esgotado na comunicação com o servidor (Timeout).')), 15000));
            
            const { data, error: jobError } = await Promise.race([dbPromise, dbTimeout]);

            if (jobError) throw jobError;
            console.log('Job created successfully');

            // Background notification logic
            const notifyWorkers = async () => {
                try {
                    const { data: workers } = await supabase
                        .from('users')
                        .select('city') // Removed pushToken until implemented
                        .eq('role', 'WORKER')
                        .eq('city', city);
                    
                    // workers?.forEach(worker => {
                    //     if (worker.pushToken) {
                    //         sendPushNotification(
                    //             worker.pushToken, 
                    //             'Nova Vaga na sua Cidade!', 
                    //             `${title.trim()}`, 
                    //             { type: 'job' }
                    //         );
                    //     }
                    // });
                } catch (e) {
                    console.warn('Background workers query error:', e);
                }
            };
            notifyWorkers();

            setShowSuccessCard(true);
        } catch (err) {
            console.error('Job creation error:', err);
            if (Platform.OS === 'web') {
                window.alert('Erro: ' + err.message);
            } else {
                Alert.alert('Erro', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <UpgradeModal 
                visible={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                title="Limite de Vagas Atingido"
                message={upgradeMessage}
            />

            <Modal visible={loading} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingTitle}>A publicar vaga...</Text>
                        <Text style={styles.loadingDesc}>Estamos a guardar os dados e preparar a publicação.</Text>
                    </View>
                </View>
            </Modal>

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
                    <TouchableOpacity onPress={() => {
                        if (router.canGoBack()) router.back();
                        else router.replace('/(tabs)/home');
                    }} style={styles.backButton}>
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
                    <Text style={styles.label}>Disponibilidade *</Text>
                    <View style={styles.optionRow}>
                        {AVAILABILITY_TYPES.map((av) => (
                            <TouchableOpacity
                                key={av.value}
                                style={[styles.option, form.availability === av.value && styles.optionActive]}
                                onPress={() => update('availability', av.value)}
                            >
                                <Text style={[styles.optionText, form.availability === av.value && styles.optionTextActive]}>{av.label}</Text>
                            </TouchableOpacity>
                        ))}
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

                {imageUri && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                            <Ionicons name="close-circle" size={24} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}
                
                {!imageUri && (
                    <TouchableOpacity style={styles.inlineImageBtn} onPress={pickImage}>
                        <Ionicons name="image-outline" size={24} color={Colors.primary} />
                        <Text style={styles.inlineImageBtnText}>Adicionar Imagem</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Publicar Vaga</Text>}
                </TouchableOpacity>
            </ScrollView>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { padding: Spacing.md, paddingBottom: Spacing.xxl, width: '100%', maxWidth: 700, alignSelf: 'center' },
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
    suggestionsList: { 
        position: 'absolute', 
        top: '100%', 
        left: 0, 
        right: 0, 
        backgroundColor: Colors.white, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: Colors.borderLight, 
        marginTop: 4, 
        zIndex: 1000,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        } : {
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 4, 
            elevation: 5 
        })
    },
    suggestionItem: { paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    suggestionText: { fontSize: Fonts.sizes.md, color: Colors.text },

    // Chips
    optionRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
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

    imagePreviewContainer: { marginTop: Spacing.md, position: 'relative', marginBottom: Spacing.md },
    imagePreview: { width: '100%', height: 250, borderRadius: 12, backgroundColor: Colors.background },
    removeImageBtn: { 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        } : {
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 3, 
            elevation: 5 
        })
    },
    
    inlineImageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: Colors.primaryBg, borderRadius: 12, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30', borderStyle: 'dashed' },
    inlineImageBtnText: { marginLeft: 8, color: Colors.primary, fontWeight: '700', fontSize: Fonts.sizes.md },

    button: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.sm },
    buttonDisabled: { backgroundColor: Colors.borderLight },
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
    successCard: { 
        backgroundColor: Colors.white, 
        borderRadius: 24, 
        padding: Spacing.xl, 
        width: '100%', 
        maxWidth: 400, 
        alignItems: 'center', 
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        } : {
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 10 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 20,
            elevation: 10, 
        })
    },
    loadingCard: { 
        backgroundColor: Colors.white, 
        borderRadius: 24, 
        padding: Spacing.xl, 
        width: '100%', 
        maxWidth: 360, 
        alignItems: 'center', 
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        } : {
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 10 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 20,
            elevation: 10, 
        })
    },
    loadingTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.xs, textAlign: 'center' },
    loadingDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    successIconBox: { backgroundColor: '#E8F5E9', borderRadius: 100, padding: 16, marginBottom: Spacing.lg },
    successTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
    successDesc: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.sm, marginBottom: Spacing.xl },
    successBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
    successBtnText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '800' },
});
