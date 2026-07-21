import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { maskEmail } from '../../utils/profileUtils';

export default function Verify2FA() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const { verify2FACode, isAuthActionLoading } = useAuthStore();

    const [code, setCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async () => {
        if (!code || code.trim().length !== 6) {
            setErrorMsg('Introduza o código de 6 dígitos.');
            return;
        }

        try {
            setErrorMsg('');
            await verify2FACode(email, code.trim());
            router.replace('/(tabs)/home');
        } catch (err) {
            setErrorMsg(err.message || 'Código inválido.');
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setResendLoading(true);
        setErrorMsg('');
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            if (Platform.OS === 'web') {
                alert('Um novo código foi enviado para o seu email.');
            } else {
                Alert.alert('Código Enviado', 'Um novo código foi enviado para o seu email.');
            }
        } catch (err) {
            setErrorMsg('Erro ao reenviar código: ' + err.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/auth/login')}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={36} color={Colors.primary} />
                </View>

                <Text style={styles.title}>Verificação em 2 Passos</Text>
                <Text style={styles.subtitle}>
                    Enviámos um código de 6 dígitos para o email <Text style={{fontWeight: '700'}}>{maskEmail(email)}</Text>. Introduza-o abaixo para continuar.
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Código de Verificação</Text>
                    <View style={styles.passwordRow}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="keypad-outline" size={18} color={Colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            placeholder="000000"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={code}
                            onChangeText={(v) => { setCode(v.replace(/[^0-9]/g, '')); setErrorMsg(''); }}
                            onSubmitEditing={handleVerify}
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, isAuthActionLoading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={isAuthActionLoading}
                >
                    {isAuthActionLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Verificar Código</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResend}
                    disabled={resendLoading || isAuthActionLoading}
                >
                    {resendLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Text style={styles.resendText}>Não recebeu o código? Reenviar</Text>
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
    inputGroup: { marginBottom: Spacing.lg, width: '100%' },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 14,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        fontSize: Fonts.sizes.xl,
        letterSpacing: 8,
        textAlign: 'center',
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    passwordRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    inputIcon: {
        backgroundColor: Colors.primaryBg,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    codeInput: { flex: 1 },
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
    resendBtn: { marginTop: Spacing.xl, padding: 10 },
    resendText: { color: Colors.primary, fontSize: Fonts.sizes.md, fontWeight: '600' },
});
