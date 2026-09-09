import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Colors, Fonts, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UpgradeModal({ visible, onClose, title, message }) {
    const router = useRouter();

    const handleUpgrade = () => {
        onClose();
        router.push('/settings/premium');
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    
                    <View style={styles.iconContainer}>
                        <Ionicons name="diamond" size={48} color={Colors.white} />
                    </View>
                    
                    <Text style={styles.title}>{title || 'Limite Atingido'}</Text>
                    <Text style={styles.message}>
                        {message || 'Você atingiu o limite do seu plano atual. Atualize para o Kwick Mais para ter mais vantagens e remover limites!'}
                    </Text>
                    
                    <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
                        <Text style={styles.upgradeBtnText}>Conhecer o Kwick Mais</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: Spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        ...(Platform.OS === 'web' ? { alignSelf: 'center' } : {})
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 10
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center'
    },
    message: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl
    },
    upgradeBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        width: '100%',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    upgradeBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700'
    }
});
