import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../../constants';
import { useAuthStore } from '../../store/authStore';

export default function VerifyEmail() {
    const router = useRouter();
    const { user, checkEmailVerification, resendVerificationEmail, logout } = useAuthStore();
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);

    useEffect(() => {
        // Redirect if verified
        if (user?.emailVerified) {
            router.replace('/(tabs)/home');
            return;
        }

        // Timer for resending
        const timer = setInterval(() => {
            setSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        // Auto-check every 5 seconds
        const autoCheck = setInterval(async () => {
            const verified = await checkEmailVerification();
            if (verified) {
                router.replace('/(tabs)/home');
            }
        }, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(autoCheck);
        }
    }, [user, router]);

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const verified = await checkEmailVerification();
            if (verified) {
                Alert.alert('Sucesso', 'Email verificado com sucesso!');
                router.replace('/(tabs)/home');
            } else {
                Alert.alert('Aviso', 'O seu email ainda não foi verificado. Por favor, clique no link enviado para ' + user?.email + '. Verifique também a sua pasta de Lixo/Spam.');
            }
        } catch (err) {
            if (err.message?.includes('rede') || err.message?.includes('ligação')) {
                Alert.alert('Erro de Ligação', 'Não conseguimos contactar o servidor. Verifique a sua internet.');
            } else {
                Alert.alert('Erro', 'Ocorreu um erro ao verificar o email. Tente novamente.');
            }
        } finally {
            setChecking(false);
        }
    };

    const handleResend = async () => {
        if (secondsLeft > 0) return;
        setResending(true);
        try {
            await resendVerificationEmail();
            setSecondsLeft(60);
            Alert.alert('Sucesso', 'Email de verificação reenviado!');
        } catch (err) {
            if (err.message?.includes('ligação') || err.message?.includes('rede')) {
                Alert.alert('Erro de Ligação', 'Não conseguimos contactar o servidor. Verifique a sua internet e tente novamente.');
            } else {
                Alert.alert('Erro', 'Não foi possível reenviar o email no momento. Por favor, tente novamente mais tarde.');
            }
        } finally {
            setResending(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBox}>
                    <Ionicons name="mail-open-outline" size={80} color={Colors.primary} />
                </View>
                
                <Text style={styles.title}>Verifique o seu Email</Text>
                <Text style={styles.description}>
                    Enviamos um link de verificação para:{"\n"}
                    <Text style={{ fontWeight: '700', color: Colors.text }}>{user?.email}</Text>
                </Text>
                <Text style={styles.subDescription}>
                    Por favor, abra o seu email e clique no link para ativar a sua conta.{"\n"}
                    <Text style={{ fontWeight: '700', color: Colors.error }}>Importante: Verifique a pasta de Lixo/Spam.</Text>
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.mainBtn} 
                        onPress={handleCheckStatus}
                        disabled={checking}
                    >
                        {checking ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.mainBtnText}>Já verifiquei</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.secondaryBtn, secondsLeft > 0 && styles.disabledBtn]} 
                        onPress={handleResend}
                        disabled={resending || secondsLeft > 0}
                    >
                        {resending ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <Text style={[styles.secondaryBtnText, secondsLeft > 0 && { color: Colors.textLight }]}>
                                {secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : 'Reenviar Email'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
    iconBox: { marginBottom: 30 },
    title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 16, textAlign: 'center' },
    description: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 12 },
    subDescription: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 40 },
    
    actions: { width: '100%', gap: 16 },
    mainBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    mainBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    
    secondaryBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
    secondaryBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
    disabledBtn: { opacity: 0.5 },
    
    logoutBtn: { marginTop: 20, height: 50, alignItems: 'center', justifyContent: 'center' },
    logoutText: { color: Colors.error, fontSize: 14, fontWeight: '600' }
});
