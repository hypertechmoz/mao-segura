import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { Colors, Spacing, Fonts, PROVINCES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import FloatingSupportButton from '../../components/FloatingSupportButton';

export default function Register() {
    const router = useRouter();
    const { role } = useLocalSearchParams();
    const { register, signInWithGoogle, isAuthActionLoading } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        province: '',
        city: '',
        bairro: '',
        password: '',
    });

    const [showProvinces, setShowProvinces] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: Colors.textLight });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const updateField = (field, value) => {
        setForm({ ...form, [field]: value });
        if (field === 'password') checkPasswordStrength(value);
    };

    const checkPasswordStrength = (pass) => {
        let score = 0;
        if (pass.length === 0) {
            setPasswordStrength({ score: 0, label: '', color: Colors.textLight });
            return;
        }
        
        if (pass.length >= 8) score++; // Mínimo 8 caracteres
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++; // Letras maiúsculas e minúsculas
        if (/[0-9]/.test(pass)) score++; // Pelo menos um número
        if (/[^A-Za-z0-9]/.test(pass)) score++; // Caractere especial

        const levels = [
            { label: 'Muito curta', color: Colors.error },
            { label: 'Fraca', color: '#FF9800' },
            { label: 'Média', color: '#FFC107' },
            { label: 'Quase lá', color: '#8BC34A' },
            { label: 'Forte', color: '#2E7D32' },
        ];
        setPasswordStrength({ score, ...levels[score] });
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const triggerTermsWarning = (context = '') => {
        setTermsError(true);
        const msg = `Por favor, marque a caixa a confirmar que aceita as Regras e Termos de Uso${context}.`;
        setErrorMsg(msg);
        useAlertStore.getState().showAlert('Atenção', msg, 'warning');
    };

    const handleRegister = async () => {
        const { name, email, phone, province, city, bairro, password } = form;

        if (!name || !email || !province || !city || !bairro || !password) {
            useAlertStore.getState().showAlert('Atenção', 'Preencha todos os campos obrigatórios', 'warning');
            return;
        }

        if (name.trim().split(/\s+/).length < 2) {
            useAlertStore.getState().showAlert('Atenção', 'Por favor, insira o seu nome completo (nome e apelido).', 'warning');
            return;
        }

        if (!validateEmail(email)) {
            useAlertStore.getState().showAlert('Atenção', 'Introduza um endereço de email válido', 'warning');
            return;
        }

        if (passwordStrength.score < 4) {
            useAlertStore.getState().showAlert('Segurança Insuficiente', 'A sua palavra-passe deve ser Forte (mín. 8 caracteres, maiúsculas, minúsculas, números e símbolos).', 'warning');
            return;
        }

        if (!termsAccepted) {
            triggerTermsWarning(' para criar uma conta');
            return;
        }

        try {
            setErrorMsg('');
            setTermsError(false);
            await register(email, password, {
                name,
                role: role || 'WORKER',
                phone,
                province,
                city,
                bairro,
            });
            router.replace('/auth/verify-email');
        } catch (err) {
            const message = err.message || 'Ocorreu um erro ao criar a conta';
            setErrorMsg(message);
            useAlertStore.getState().showAlert('Erro', message, 'error');
        }
    };

    const handleGoogleRegister = async () => {
        if (!termsAccepted) {
            triggerTermsWarning(' para continuar com a conta Google');
            return;
        }
        try {
            setErrorMsg('');
            setTermsError(false);
            await signInWithGoogle();
        } catch (err) {
            console.error('Google Register Error:', err);
            const msg = err?.message || 'Não foi possível continuar com o Google. Por favor, tente novamente.';
            useAlertStore.getState().showAlert('Erro', msg, 'error');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Spacing.xxl + insets.bottom }]} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>
                {role === 'EMPLOYER' ? 'Criar conta de Cliente' : 'Criar conta de Profissional'}
            </Text>
            <Text style={styles.subheading}>
                Preencha os dados abaixo. Nome e localização ficam associados ao seu perfil e ajudam clientes e profissionais a encontrá-lo.
                {'\n\n'}
                <Text style={{fontWeight: '700', color: Colors.error}}>Nota Importante:</Text> Insira os seus dados reais. O seu Nome completo e Email <Text style={{fontWeight: '700'}}>não poderão ser modificados</Text> no futuro por questões de segurança.
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Maria Silva"
                    placeholderTextColor={Colors.textLight}
                    value={form.name}
                    onChangeText={(v) => updateField('name', v)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={styles.emailRow}>
                    <View style={styles.emailIcon}>
                        <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                    </View>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="exemplo@email.com"
                        placeholderTextColor={Colors.textLight}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={form.email}
                        onChangeText={(v) => updateField('email', v.trim())}
                    />
                </View>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    Será usado para entrar na sua conta e recuperar a senha.
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de telefone (opcional)</Text>
                <View style={styles.phoneRow}>
                    <View style={styles.phonePrefix}>
                        <Text style={styles.phonePrefixText}>+258</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.phoneInput]}
                        placeholder="84 000 0000"
                        placeholderTextColor={Colors.textLight}
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={(v) => updateField('phone', v.replace(/\D/g, ''))}
                        maxLength={9}
                    />
                </View>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    Visível para empregadores e trabalhadores para contacto directo.
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha *</Text>
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                        placeholder="Crie uma senha segura"
                        placeholderTextColor={Colors.textLight}
                        secureTextEntry={!showPassword}
                        value={form.password}
                        onChangeText={(v) => updateField('password', v)}
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                {form.password.length > 0 && (
                    <View style={styles.strengthBarContainer}>
                        <View style={[styles.strengthBar, { width: `${(passwordStrength.score + 1) * 20}%`, backgroundColor: passwordStrength.color }]} />
                        <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                    </View>
                )}

                <View style={styles.recommendations}>
                    <Text style={styles.recText}>• No mínimo 8 caracteres</Text>
                    <Text style={styles.recText}>• Pelo menos uma letra Maiúscula e uma minúscula</Text>
                    <Text style={styles.recText}>• Pelo menos um número</Text>
                    <Text style={styles.recText}>• Use símbolos (ex: ! @ # $ % &) para máxima segurança</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Província *</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowProvinces(!showProvinces)}
                >
                    <Text style={form.province ? styles.inputText : styles.placeholderText}>
                        {form.province || 'Selecione a província'}
                    </Text>
                </TouchableOpacity>
                {showProvinces && (
                    <View style={styles.dropdown}>
                        <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                            {PROVINCES.map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={styles.dropdownItem}
                                    onPress={() => { updateField('province', p); setShowProvinces(false); }}
                                >
                                    <Text style={styles.dropdownText}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Cidade *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Maputo"
                    placeholderTextColor={Colors.textLight}
                    value={form.city}
                    onChangeText={(v) => updateField('city', v)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bairro *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Polana"
                    placeholderTextColor={Colors.textLight}
                    value={form.bairro}
                    onChangeText={(v) => updateField('bairro', v)}
                />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity 
                style={[
                    styles.termsContainer,
                    termsError && !termsAccepted && { borderColor: Colors.error, borderWidth: 1.5, backgroundColor: Colors.error + '10' }
                ]} 
                onPress={() => { setTermsAccepted(!termsAccepted); setTermsError(false); }}
                activeOpacity={0.8}
            >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked, termsError && !termsAccepted && { borderColor: Colors.error }]}>
                    {termsAccepted && <Ionicons name="checkmark-sharp" size={16} color={Colors.white} />}
                </View>
                <Text style={styles.termsText}>
                    Confirmo que li e aceito as <Text style={styles.termsLink} onPress={(e) => { e.stopPropagation(); router.push('/info/terms'); }}>Regras da Comunidade e Termos de Uso.</Text>
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, isAuthActionLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isAuthActionLoading}
                activeOpacity={0.8}
            >
                {isAuthActionLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Criar Conta</Text>
                )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleRegister}
                disabled={isAuthActionLoading}
                activeOpacity={0.8}
            >
                <Ionicons name="logo-google" size={20} color={Colors.text} style={{ marginRight: 12 }} />
                <Text style={styles.googleButtonText}>Continuar com Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.link}>
                <Text style={styles.linkText}>
                    Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
                </Text>
            </TouchableOpacity>

            </ScrollView>
            <FloatingSupportButton bottomOffset={Math.max(insets.bottom, 16) + 16} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 500, alignSelf: 'center', width: '100%' } : {}) },
    heading: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
    subheading: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
    inputGroup: { marginBottom: Spacing.md },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    inputText: { fontSize: Fonts.sizes.md, color: Colors.text },
    placeholderText: { fontSize: Fonts.sizes.md, color: Colors.textLight },
    emailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    emailIcon: {
        backgroundColor: Colors.primaryBg,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailInput: { flex: 1 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    phonePrefix: {
        backgroundColor: Colors.primaryBg,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    phonePrefixText: { fontSize: Fonts.sizes.md, color: Colors.primary, fontWeight: '600' },
    phoneInput: { flex: 1 },
    dropdown: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: 4,
        maxHeight: 200,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    dropdownText: { fontSize: Fonts.sizes.md, color: Colors.text },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: Spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '700' },
    link: { alignItems: 'center', marginTop: Spacing.lg },
    linkText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
    linkBold: { color: Colors.primary, fontWeight: '700' },
    errorText: { color: Colors.error, fontSize: Fonts.sizes.sm, textAlign: 'center', marginTop: Spacing.sm, marginBottom: -Spacing.xs },
    passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
    passwordToggle: {
        backgroundColor: Colors.background,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderLeftWidth: 0,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: 'center',
    },
    strengthBarContainer: { marginTop: 8 },
    strengthBar: { height: 4, borderRadius: 2, marginBottom: 4 },
    strengthLabel: { fontSize: 12, fontWeight: '600' },
    recommendations: { marginTop: 12, padding: 12, backgroundColor: Colors.background, borderRadius: 8 },
    recText: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
    termsContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: Spacing.md, 
        marginBottom: Spacing.sm, 
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    checkbox: { 
        width: 24, 
        height: 24, 
        borderRadius: 6, 
        borderWidth: 2, 
        borderColor: Colors.primary, 
        backgroundColor: Colors.white,
        marginRight: 10, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    checkboxChecked: { 
        backgroundColor: Colors.primary, 
        borderColor: Colors.primary 
    },
    termsText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
    termsLink: { fontWeight: '700', color: Colors.primary, textDecorationLine: 'underline' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
    dividerText: { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '600' },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: Spacing.md,
    },
    googleButtonText: { color: Colors.text, fontSize: Fonts.sizes.md, fontWeight: '600' },
});
