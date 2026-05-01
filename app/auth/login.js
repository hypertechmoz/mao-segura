import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const router = useRouter();
    const { loginWithPassword, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Preencha todos os campos');
            return;
        }

        try {
            setErrorMsg('');
            await loginWithPassword(email.trim(), password);
            router.replace('/(tabs)/home');
        } catch (err) {
            setErrorMsg(err.message || 'Erro ao entrar');
            Alert.alert('Erro', err.message || 'Dados incorretos');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Ionicons name="lock-closed" size={32} color={Colors.white} />
                    </View>
                    <Text style={styles.title}>Bem-vindo de volta</Text>
                    <Text style={styles.subtitle}>Inicie sessão para continuar a usar o Trabalhe já.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
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
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Sua senha"
                                placeholderTextColor={Colors.textLight}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
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
                    </View>

                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/auth/forgot-password')}>
                        <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push('/auth/choose-type')}>
                        <Text style={styles.footerText}>
                            Não tem uma conta? <Text style={styles.footerLink}>Registar</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { padding: Spacing.lg, flexGrow: 1, justifyContent: 'center', ...(Platform.OS === 'web' ? { maxWidth: 450, alignSelf: 'center', width: '100%' } : {}) },
    header: { alignItems: 'center', marginBottom: Spacing.xl },
    logoBox: {
        width: 64,
        height: 64,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        ...(Platform.OS === 'ios' ? {
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
        } : Platform.OS === 'web' ? {
            boxShadow: `0 8px 12px ${Colors.primary}33`
        } : {}),
        elevation: 8,
    },
    title: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xs },
    subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center' },
    form: { width: '100%', marginBottom: Spacing.xl },
    inputGroup: { marginBottom: Spacing.lg },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 14,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    emailRow: { flexDirection: 'row', gap: 10 },
    emailIcon: {
        backgroundColor: Colors.primaryBg,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailInput: { flex: 1 },
    passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
    passwordToggle: {
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: Colors.borderLight,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: Spacing.sm,
        ...(Platform.OS === 'ios' ? {
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
        } : Platform.OS === 'web' ? {
            boxShadow: `0 4px 10px ${Colors.primary}4D`
        } : {}),
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '800' },
    errorText: { color: Colors.error, fontSize: Fonts.sizes.sm, textAlign: 'center', marginBottom: Spacing.md },
    forgotBtn: { alignSelf: 'center', marginTop: Spacing.md },
    forgotText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: '500' },
    footer: { alignItems: 'center', marginTop: 'auto', paddingBottom: Spacing.md },
    footerText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
    footerLink: { color: Colors.primary, fontWeight: '800' },
});