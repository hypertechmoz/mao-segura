import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Fonts } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandWordmark from '../components/BrandWordmark';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import ScreenSafeArea from '../components/ScreenSafeArea';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();
    const setOnboarded = useAuthStore((s) => s.setOnboarded);
    const insets = useSafeAreaInsets();

    const handleStart = () => {
        setOnboarded();
        router.push('/auth/choose-type');
    };

    const handleExplore = () => {
        setOnboarded();
        router.replace('/(tabs)/home');
    };

    return (
        <ScreenSafeArea style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            
            <View style={styles.contentContainer}>
                <View style={[styles.textSection, { flex: 1, justifyContent: 'center' }]}>
                    <Image 
                        source={require('../assets/icon.png')} 
                        style={styles.appIcon} 
                        resizeMode="contain" 
                    />
                    <BrandWordmark style={{ marginBottom: Spacing.xl }} />
                    <Text style={styles.tagline}>
                        A oportunidade certa{'\n'}perto de si!
                    </Text>
                    <Text style={styles.subtitle}>
                        Clientes e profissionais mais perto,{'\n'}
                        para serviços domésticos e comerciais{'\n'}
                        em Moçambique.
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton]} 
                        onPress={handleStart} 
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Começar</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginContainer}>
                        <Text style={styles.loginLink}>Já tenho uma conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primaryBg,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    textSection: {
        alignItems: 'center',
    },
    appIcon: {
        width: 80,
        height: 80,
        marginBottom: 12,
        borderRadius: 20,
    },
    tagline: {
        fontSize: 30,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: Spacing.lg,
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonSection: {
        width: '100%',
        gap: Spacing.md,
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    loginContainer: {
        paddingVertical: Spacing.sm,
    },
    loginLink: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
});
