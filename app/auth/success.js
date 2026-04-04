import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../../constants';
import { useAuthStore } from '../../store/authStore';

export default function SuccessScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    
    // Fallback if name is missing for some reason
    const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color={Colors.success || '#4CAF50'} />
                </View>
                
                <Text style={styles.title}>Parabéns!</Text>
                
                <Text style={styles.subtitle}>
                    Olá <Text style={{fontWeight: '700'}}>{firstName}</Text>, a tua conta foi criada com sucesso. Seja bem-vindo à Mão Segura!
                </Text>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => router.replace('/(tabs)/home')}
                >
                    <Text style={styles.buttonText}>Acessar Plataforma</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        ...(Platform.OS === 'web' ? { maxWidth: 500, alignSelf: 'center', width: '100%' } : {}),
    },
    iconContainer: {
        marginBottom: Spacing.xl,
        shadowColor: Colors.success || '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontFamily: Fonts.bold,
        fontSize: 32,
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: Spacing.xxl,
        paddingHorizontal: Spacing.md,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: Spacing.xxl,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: Colors.white,
        fontFamily: Fonts.bold,
        fontSize: 18,
    }
});
