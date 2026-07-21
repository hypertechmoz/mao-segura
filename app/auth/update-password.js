import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function UpdatePassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Verificar se temos uma sessão ativa. Se não, o utilizador não deveria estar aqui.
        // Em Web, quando se clica no link, o supabase.auth onAuthStateChange deteta a sessão e mete o utilizador na store.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setErrorMsg('Link de recuperação inválido ou expirado.');
            }
        };
        checkSession();
    }, []);

    const handleUpdate = async () => {
        if (!password || !confirmPassword) {
            setErrorMsg('Preencha ambos os campos.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        
        try {
            const { error } = await supabase.auth.updateUser({ password });
            
            if (error) throw error;

            if (Platform.OS === 'web') {
                alert('A sua senha foi atualizada com sucesso!');
                router.replace('/(tabs)/home');
            } else {
                Alert.alert(
                    'Sucesso',
                    'A sua senha foi atualizada com sucesso!',
                    [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
                );
            }

        } catch (err) {
            setErrorMsg(err.message || 'Erro ao atualizar a senha.');
        } finally {
            setLoading(false);
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
                    <Ionicons name="lock-closed-outline" size={36} color={Colors.primary} />
                </View>

                <Text style={styles.title}>Definir Nova Senha</Text>
                <Text style={styles.subtitle}>
                    Introduza a sua nova senha abaixo para recuperar o acesso à sua conta.
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nova Senha</Text>
                    <View style={styles.passwordRow}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Mínimo de 6 caracteres"
                            placeholderTextColor={Colors.textLight}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(v) => { setPassword(v); setErrorMsg(''); }}
                        />
                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmar Nova Senha</Text>
                    <View style={styles.passwordRow}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Repita a nova senha"
                            placeholderTextColor={Colors.textLight}
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={(v) => { setConfirmPassword(v); setErrorMsg(''); }}
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Atualizar Senha</Text>
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
        fontSize: Fonts.sizes.md,
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
    passwordInput: { flex: 1 },
    eyeBtn: { position: 'absolute', right: 15, padding: 5 },
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
});
