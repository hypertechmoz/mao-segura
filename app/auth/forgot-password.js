import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
    const router = useRouter();
    const { requestPasswordReset, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [sent, setSent] = useState(false);

    const handleSendReset = async () => {
        if (!email || !email.includes('@')) {
            setErrorMsg('Introduza um endereço de email válido.');
            return;
        }

        try {
            setErrorMsg('');
            await requestPasswordReset(email.trim());
            setSent(true);
        } catch (err) {
            setErrorMsg(err.message || 'Erro ao enviar email de recuperação.');
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.successContent}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="mail-open-outline" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Email Enviado!</Text>
                    <Text style={styles.successText}>
                        Enviámos um link de recuperação para{'\n'}
                        <Text style={{ fontWeight: '700', color: Colors.primary }}>{email}</Text>
                    </Text>
                    <Text style={styles.instructionText}>
                        Abra o email e clique no link para redefinir a sua senha. Verifique também a pasta de spam.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth/login')}>
                        <Text style={styles.buttonText}>Voltar ao Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resendBtn}
                        onPress={() => { setSent(false); setEmail(''); }}
                    >
                        <Text style={styles.resendText}>
                            Não recebeu? <Text style={{ fontWeight: '700', color: Colors.primary }}>Tentar outro email</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.iconCircle}>
                    <Ionicons name="key-outline" size={36} color={Colors.primary} />
                </View>

                <Text style={styles.title}>Recuperar Senha</Text>
                <Text style={styles.subtitle}>
                    Introduza o email associado à sua conta. Irá receber um link para redefinir a sua senha.
                </Text>

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
                            onChangeText={(v) => { setEmail(v); setErrorMsg(''); }}
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSendReset}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Enviar Link de Recuperação</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        ...Platform.select({ web: { alignSelf: 'center', width: '100%', maxWidth: 450, paddingTop: Spacing.lg } }),
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    content: {
        padding: Spacing.lg,
        flexGrow: 1,
        paddingTop: Spacing.md,
        alignItems: 'center',
        ...(Platform.OS === 'web' ? { maxWidth: 450, alignSelf: 'center', width: '100%' } : {}),
    },
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        ...(Platform.OS === 'web' ? { maxWidth: 450, alignSelf: 'center', width: '100%' } : {}),
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        lineHeight: 22,
        textAlign: 'center',
    },
    successText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    instructionText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    inputGroup: { marginBottom: Spacing.lg, width: '100%' },
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
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: Spacing.sm,
        width: '100%',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '800' },
    errorText: { color: Colors.error, fontSize: Fonts.sizes.sm, textAlign: 'center', marginBottom: Spacing.md },
    resendBtn: { marginTop: Spacing.lg },
    resendText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center' },
});
