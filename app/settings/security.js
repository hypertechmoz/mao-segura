import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { supabase } from '../../services/supabase';
import { maskEmail } from '../../utils/profileUtils';

export default function SecuritySettings() {
    const router = useRouter();
    const { updatePassword, isAuthActionLoading, user, toggle2FA, verify2FACode } = useAuthStore();
    const showAlert = useAlertStore(state => state.showAlert);

    // Password states
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // 2FA Verification states
    const email2FA = !!user?.user_metadata?.email_2fa_enabled;
    const [show2FAVerifyModal, setShow2FAVerifyModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);
    const [error2FA, setError2FA] = useState('');

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setErrorMsg('Preencha os campos da nova senha.');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('As senhas não coincidem.');
            return;
        }

        setErrorMsg('');
        try {
            await updatePassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
            showAlert('Sucesso', 'A sua senha foi atualizada com sucesso!', 'success');
        } catch (err) {
            setErrorMsg(err.message || 'Erro ao atualizar a senha.');
            showAlert('Erro', 'Erro ao atualizar a senha.', 'error');
        }
    };

    const handleToggleEmail2FA = async (newValue) => {
        if (!newValue) {
            // Turning OFF
            try {
                await toggle2FA(false);
                showAlert('2FA Desativado', 'A autenticação de dois fatores foi desativada.', 'info');
            } catch (err) {
                showAlert('Erro', 'Não foi possível desativar o 2FA.', 'error');
            }
            return;
        }

        // Turning ON - we must verify first
        try {
            setIsVerifying2FA(true);
            const { error } = await supabase.auth.signInWithOtp({ email: user.email });
            if (error) throw error;
            
            setShow2FAVerifyModal(true);
            showAlert('Código Enviado', `Foi enviado um código para ${maskEmail(user.email)}.`, 'success');
        } catch (err) {
            showAlert('Erro', 'Não foi possível enviar o código de verificação.', 'error');
        } finally {
            setIsVerifying2FA(false);
        }
    };

    const handleVerify2FACode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError2FA('Introduza o código de 6 dígitos.');
            return;
        }

        setIsVerifying2FA(true);
        setError2FA('');
        
        try {
            // 1. Verify the OTP
            await verify2FACode(user.email, verificationCode);
            
            // 2. Set metadata flag
            // Run this without awaiting so the modal closes immediately
            toggle2FA(true).catch(e => console.error('Error toggling 2FA:', e));
            
            setShow2FAVerifyModal(false);
            setVerificationCode('');
            setIsVerifying2FA(false);
            showAlert('Sucesso', 'Autenticação de Dois Fatores (2FA) ativada!', 'success');
        } catch (err) {
            const msg = err && err.message ? err.message : 'Código inválido.';
            setError2FA(msg);
            showAlert('Erro', 'Código de verificação incorreto.', 'error');
            setIsVerifying2FA(false);
        }
    };

    const cancel2FAVerification = () => {
        setShow2FAVerifyModal(false);
        setVerificationCode('');
        setError2FA('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)/profile');
                    }
                }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Segurança e Privacidade</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Alterar Senha */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="key-outline" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.sectionTitle}>Senha</Text>
                    </View>
                    
                    {!showPasswordForm ? (
                        <TouchableOpacity style={styles.optionButton} onPress={() => setShowPasswordForm(true)}>
                            <Text style={styles.optionButtonText}>Alterar Senha</Text>
                            <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.expandedForm}>
                            <TouchableOpacity style={styles.closeFormBtn} onPress={() => { setShowPasswordForm(false); setErrorMsg(''); }}>
                                <Ionicons name="close" size={20} color={Colors.textLight} />
                            </TouchableOpacity>
                            <Text style={styles.label}>Nova Senha</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo de 6 caracteres"
                                    placeholderTextColor={Colors.textLight}
                                    secureTextEntry={!showPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Confirmar Nova Senha</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repita a nova senha"
                                    placeholderTextColor={Colors.textLight}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                            <TouchableOpacity 
                                style={[styles.button, isAuthActionLoading && styles.buttonDisabled]} 
                                onPress={handleUpdatePassword}
                                disabled={isAuthActionLoading}
                            >
                                {isAuthActionLoading ? (
                                    <ActivityIndicator color={Colors.white} />
                                ) : (
                                    <Text style={styles.buttonText}>Atualizar Senha</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Autenticação 2FA */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.sectionTitle}>Autenticação de Dois Fatores (2FA)</Text>
                    </View>
                    
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1, paddingRight: 15 }}>
                            <Text style={styles.settingTitle}>Código de Verificação por Email</Text>
                            <Text style={styles.settingDesc}>
                                Ao entrar, será exigido um código de 6 dígitos que enviaremos para o seu email ({maskEmail(user?.email)}).
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', justifyContent: 'center', minWidth: 90 }}>
                            {isVerifying2FA && !show2FAVerifyModal ? (
                                <ActivityIndicator size="small" color={Colors.primary} />
                            ) : email2FA ? (
                                <TouchableOpacity style={styles.btnDeactivate} onPress={() => handleToggleEmail2FA(false)}>
                                    <Text style={styles.btnDeactivateText}>Desativar</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.btnActivate} onPress={() => handleToggleEmail2FA(true)}>
                                    <Text style={styles.btnActivateText}>Ativar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Histórico de Sessões */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="desktop-outline" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.sectionTitle}>Sessões Ativas</Text>
                    </View>
                    <Text style={styles.settingDesc}>
                        A sua conta está atualmente iniciada neste dispositivo. Se notar atividade suspeita, altere a sua senha imediatamente, o que irá terminar a sessão em todos os outros dispositivos.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal para verificar 2FA antes de ativar */}
            <Modal
                visible={show2FAVerifyModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancel2FAVerification}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verificar Email</Text>
                        <Text style={styles.modalDesc}>
                            Enviámos um código para {maskEmail(user?.email)}. Insira-o abaixo para ativar a Autenticação em 2 Passos.
                        </Text>
                        
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            placeholder="000000"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                        />
                        {error2FA ? <Text style={styles.errorText}>{error2FA}</Text> : null}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={cancel2FAVerification} disabled={isVerifying2FA}>
                                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleVerify2FACode} disabled={isVerifying2FA}>
                                {isVerifying2FA ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalBtnConfirmText}>Confirmar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : Spacing.xl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginLeft: 10 },
    content: {
        padding: Spacing.md,
        ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {})
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingBottom: 10,
    },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    optionButtonText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
    expandedForm: {
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        position: 'relative'
    },
    closeFormBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 5 },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 5 },
    input: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, position: 'relative' },
    eyeBtn: { position: 'absolute', right: 15, padding: 5 },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' },
    errorText: { color: Colors.error, fontSize: Fonts.sizes.sm, marginBottom: Spacing.sm },
    
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    settingTitle: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    settingDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text, marginBottom: 10 },
    modalDesc: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    codeInput: { fontSize: Fonts.sizes.xl, letterSpacing: 8, textAlign: 'center', width: '100%', marginBottom: 15 },
    modalActions: { flexDirection: 'row', width: '100%', gap: 10, marginTop: 10 },
    modalBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center' },
    modalBtnCancelText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textSecondary },
    modalBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
    modalBtnConfirmText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.white },
    
    // Novas classes para os botões 2FA
    btnActivate: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnActivateText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: Fonts.sizes.sm,
    },
    btnDeactivate: {
        backgroundColor: Colors.error + '15',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnDeactivateText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: Fonts.sizes.sm,
    },
});
