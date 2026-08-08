import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Modal, View, Text, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants';

export default function FloatingSupportButton({
    whatsappMessage = 'Olá! Estou com dificuldades ao criar conta no Konekta e preciso de suporte.',
    bottomOffset = 24,
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenWhatsApp = () => {
        setModalVisible(false);
        const message = whatsappMessage;
        const url = `https://wa.me/258843623989?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch((err) => {
            console.error('Erro ao abrir WhatsApp:', err);
        });
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.floatingBtn, { bottom: bottomOffset }]}
                activeOpacity={0.85}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
                        </View>
                        <Text style={styles.modalTitle}>Precisa de Ajuda?</Text>
                        <Text style={styles.modalText}>
                            Está a enfrentar dificuldades? Gostaria de falar com o suporte?
                        </Text>
                        
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleOpenWhatsApp}
                            >
                                <Text style={styles.confirmText}>Sim, Falar no WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingBtn: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        backgroundColor: '#25D366',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 9999,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    modalText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    confirmBtn: {
        flex: 1.6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#25D366',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.white,
    },
});
