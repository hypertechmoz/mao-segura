import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts, PROVINCES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const router = useRouter();
    const { role } = useLocalSearchParams();
    const { register, isLoading } = useAuthStore();

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
        if (pass.length >= 6) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const levels = [
            { label: 'Muito curta', color: Colors.error },
            { label: 'Fraca', color: '#FF9800' },
            { label: 'Média', color: '#FFC107' },
            { label: 'Forte', color: '#4CAF50' },
            { label: 'Muito Forte', color: '#2E7D32' },
        ];
        setPasswordStrength({ score, ...levels[score] });
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleRegister = async () => {
        const { name, email, phone, province, city, bairro, password } = form;

        if (!name || !email || !province || !city || !bairro || !password) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Atenção', 'Introduza um endereço de email válido');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            setErrorMsg('');
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
            Alert.alert('Erro', message);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>
                {role === 'EMPLOYER' ? 'Criar conta de Cliente' : 'Criar conta de Profissional'}
            </Text>
            <Text style={styles.subheading}>Preencha os dados abaixo. Nome e localização ficam associados ao seu perfil e ajudam clientes e profissionais a encontrá-lo.</Text>

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
                    <Text style={styles.recText}>• Use pelo menos 6 caracteres</Text>
                    <Text style={styles.recText}>• Inclua letras maiúsculas e números</Text>
                    <Text style={styles.recText}>• Use símbolos (!@#$) para uma palavra-passe mais forte</Text>
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

            <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: 10 }}>
                Ao criar a sua conta, confirma novamente que leu e concorda em cumprir com as <Text style={{fontWeight: '700', color: Colors.primary}} onPress={() => router.push('/info/terms')}>Regras da Comunidade e Termos de Uso</Text>.
            </Text>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Criar Conta</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.link}>
                <Text style={styles.linkText}>
                    Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
                </Text>
            </TouchableOpacity>

            </ScrollView>
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
});
