import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Fonts } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandWordmark from '../components/BrandWordmark';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();
    const setOnboarded = useAuthStore((s) => s.setOnboarded);
    const insets = useSafeAreaInsets();
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const { data } = await supabase
                    .from('testimonials')
                    .select('*, author:users!user_id(profile_photo)')
                    .in('status', ['APPROVED_ONBOARDING', 'APPROVED_BOTH'])
                    .order('created_at', { ascending: false })
                    .limit(5);
                
                if (data) {
                    setTestimonials(data.map(item => ({
                        ...item,
                        user_photo: item.author?.profile_photo || null
                    })));
                }
            } catch (err) {
                console.error('Error fetching testimonials:', err);
            }
        };
        fetchTestimonials();
    }, []);

    const handleStart = () => {
        setOnboarded();
        router.push('/auth/choose-type');
    };

    const handleExplore = () => {
        setOnboarded();
        router.replace('/(tabs)/home');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Background removed as requested */}
            <View style={styles.contentContainer}>
                <View style={styles.topSpacer} />
                
                <View style={styles.textSection}>
                    <Image 
                        source={require('../assets/splash-icon.jpg')} 
                        style={styles.appIcon} 
                        resizeMode="contain" 
                    />
                    <BrandWordmark style={{ marginBottom: 12 }} />
                    <Text style={styles.subtitle}>
                        Clientes e profissionais mais perto, para serviços{'\n'}
                        domésticos e comerciais em Moçambique.
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.tagline}>
                        A oportunidade certa perto de si!
                    </Text>
                </View>

                {testimonials.length > 0 && (
                    <View style={styles.testimonialsSection}>
                        <ScrollView 
                            horizontal 
                            pagingEnabled 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ alignItems: 'center' }}
                        >
                            {testimonials.map((t) => (
                                <View key={t.id} style={styles.testimonialCard}>
                                    <Ionicons name="chatbubbles" size={24} color={Colors.primary + '30'} style={{ marginBottom: 8 }} />
                                    <Text style={styles.testimonialText} numberOfLines={3}>"{t.text}"</Text>
                                    <View style={styles.testimonialAuthor}>
                                        <Text style={styles.testimonialName}>{t.name}</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Ionicons key={i} name="star" size={12} color={i < t.rating ? Colors.star : Colors.border} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton]} 
                        onPress={handleStart} 
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Começar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginContainer}>
                        <Text style={styles.loginLink}>Já tenho uma conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        justifyContent: 'space-between',
    },
    topSpacer: {
        height: 0,
    },
    textSection: {
        alignItems: 'center',
    },
    appIcon: {
        width: 90,
        height: 90,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.lg,
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: Colors.primary,
        borderRadius: 2,
        marginBottom: Spacing.lg,
    },
    tagline: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
    },
    testimonialsSection: {
        width: '100%',
        height: 140,
        marginVertical: Spacing.md,
    },
    testimonialCard: {
        width: width - (Spacing.xl * 2),
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    testimonialText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: Spacing.sm,
    },
    testimonialAuthor: {
        alignItems: 'center',
        marginTop: 4,
    },
    testimonialName: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    buttonSection: {
        width: '100%',
        gap: Spacing.sm,
    },
    button: {
        width: '100%',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: Colors.primary,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1.5,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    secondaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    loginContainer: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
        alignItems: 'center',
    },
    loginLink: {
        color: Colors.text,
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
