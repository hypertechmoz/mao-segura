import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts, Shadows, Radius } from '../../constants';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import ScreenSafeArea from '../../components/ScreenSafeArea';

export default function ChooseProfile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, refreshUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleSelectRole = async (role) => {
        if (loading || !user) return;
        setLoading(true);
        try {
            // Update user role in public.users
            const { error: dbError } = await supabase
                .from('users')
                .update({ role })
                .eq('id', user.id);

            if (dbError) throw dbError;

            // Also update raw_user_meta_data just in case
            await supabase.auth.updateUser({
                data: { role }
            });

            // Refresh local auth state
            await refreshUser();

            // Redirect
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erro ao selecionar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenSafeArea style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={[styles.container, { paddingBottom: Spacing.xxl + insets.bottom }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Quase lá, {user?.name?.split(' ')[0] || 'Utilizador'}!</Text>
                    <Text style={styles.subtitle}>Como deseja usar o Konekta?</Text>
                </View>

                <View style={styles.cards}>
                    <TouchableOpacity
                        style={[styles.card, loading && styles.cardDisabled]}
                        onPress={() => handleSelectRole('WORKER')}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Image source={require('../../assets/images/cook.png')} style={styles.cardImage} resizeMode="cover" />
                        <Text style={styles.cardTitle}>Sou um Profissional</Text>
                        <Text style={styles.cardDescription}>
                            Quero encontrar trabalho, criar o meu perfil profissional e candidatar-me a vagas.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, styles.cardEmployer, loading && styles.cardDisabled]}
                        onPress={() => handleSelectRole('EMPLOYER')}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Image source={require('../../assets/images/plumber.png')} style={styles.cardImage} resizeMode="cover" />
                        <Text style={styles.cardTitle}>Sou um Cliente</Text>
                        <Text style={styles.cardDescription}>
                            Quero publicar vagas, encontrar profissionais e gerir contratações.
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>A configurar o seu perfil...</Text>
                    </View>
                )}
            </ScrollView>
        </ScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: 40,
        ...(Platform.OS === 'web' ? { maxWidth: 500, alignSelf: 'center', width: '100%' } : {}),
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        lineHeight: 22,
        textAlign: 'center',
    },
    cards: {
        gap: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        ...Shadows.sm,
    },
    cardEmployer: {
        borderColor: Colors.primary + '30',
    },
    cardDisabled: {
        opacity: 0.6,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: Spacing.md,
    },
    cardTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 8,
    },
    loadingContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
});
