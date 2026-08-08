import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { logoutAndRedirect } from '../../utils/logout';
import ScreenSafeArea from '../../components/ScreenSafeArea';
import FloatingSupportButton from '../../components/FloatingSupportButton';

export default function VerifyEmail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { user, checkEmailVerification, resendVerificationEmail } = useAuthStore();
    const { showAlert } = useAlertStore();
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [emailAddress, setEmailAddress] = useState(params?.email || user?.email || '');

    useEffect(() => {
        const resolveEmail = async () => {
            if (!emailAddress) {
                const stored = await AsyncStorage.getItem('konekta_pending_verify_email');
                if (stored) setEmailAddress(stored);
                else if (user?.email) setEmailAddress(user.email);
            }
        };
        resolveEmail();
    }, [user, params?.email]);

    useEffect(() => {
        if (user?.emailVerified) {
            router.replace('/auth/verify-success');
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        const autoCheck = setInterval(async () => {
            const verified = await checkEmailVerification();
            if (verified) {
                router.replace('/auth/verify-success');
            }
        }, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(autoCheck);
        };
    }, [user, router]);

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const verified = await checkEmailVerification();
            if (verified) {
                router.replace('/auth/verify-success');
            } else {
                showAlert('Aviso', 'O seu email ainda não foi verificado. Por favor, clique no link enviado para ' + (emailAddress || 'o seu endereço de email') + '. Verifique também a sua pasta de Lixo/Spam.', 'warning');
            }
        } catch (err) {
            if (err.message?.includes('rede') || err.message?.includes('ligação')) {
                showAlert('Erro de Ligação', 'Não conseguimos contactar o servidor. Verifique a sua internet.', 'error');
            } else {
                showAlert('Erro', 'Ocorreu um erro ao verificar o email. Tente novamente.', 'error');
            }
        } finally {
            setChecking(false);
        }
    };

    const handleResend = async () => {
        if (secondsLeft > 0) return;
        setResending(true);
        try {
            await resendVerificationEmail(emailAddress);
            setSecondsLeft(60);
            showAlert('Sucesso', 'Email de verificação reenviado com sucesso para ' + (emailAddress || 'o seu email') + '!', 'success');
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('ligação') || msg.includes('rede')) {
                showAlert('Erro de Ligação', 'Não conseguimos contactar o servidor. Verifique a sua internet e tente novamente.', 'error');
            } else if (msg.includes('security') || msg.includes('segurança') || msg.includes('rate')) {
                showAlert('Aguarde', 'Por segurança, aguarde alguns segundos antes de pedir outro email.', 'warning');
            } else {
                showAlert('Erro', msg || 'Não foi possível reenviar o email no momento. Por favor, tente novamente mais tarde.', 'error');
            }
        } finally {
            setResending(false);
        }
    };

    const handleLogout = async () => {
        await logoutAndRedirect(router);
    };

    const openEmailSupport = () => {
        const message = `Olá! Não recebi o email de verificação da minha conta Konekta (${emailAddress || 'sem email'}). Podem ajudar?`;
        Linking.openURL(`https://wa.me/258843623989?text=${encodeURIComponent(message)}`).catch(() => {});
    };

    return (
        <ScreenSafeArea style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBox}>
                    <Ionicons name="mail-open-outline" size={80} color={Colors.primary} />
                </View>
                
                <Text style={styles.title}>Verifique o seu Email</Text>
                <Text style={styles.description}>
                    Enviamos um link de verificação para:{"\n"}
                    <Text style={{ fontWeight: '700', color: Colors.text }}>{emailAddress || user?.email || 'o seu endereço de email'}</Text>
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

                    <TouchableOpacity style={styles.supportLink} onPress={openEmailSupport}>
                        <Text style={styles.supportLinkText}>Não recebi o email?</Text>
                        <Text style={styles.supportHint}>Fale connosco pelo WhatsApp — estamos aqui para ajudar.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FloatingSupportButton
                bottomOffset={Math.max(insets.bottom, 16) + 16}
                whatsappMessage={`Olá! Não recebi o email de verificação da minha conta Konekta (${user?.email || 'sem email'}). Podem ajudar?`}
            />
        </ScreenSafeArea>
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

    supportLink: { alignItems: 'center', paddingVertical: 8 },
    supportLinkText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
    supportHint: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 4, lineHeight: 18 },
    
    logoutBtn: { marginTop: 8, height: 50, alignItems: 'center', justifyContent: 'center' },
    logoutText: { color: Colors.error, fontSize: 14, fontWeight: '600' }
});
