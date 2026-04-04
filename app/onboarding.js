import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Fonts } from '../constants';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();
    const setOnboarded = useAuthStore((s) => s.setOnboarded);

    const handleStart = () => {
        setOnboarded();
        router.replace('/auth/choose-type');
    };

    const handleExplore = () => {
        setOnboarded();
        router.replace('/(tabs)/home');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Background Image */}
            <Image 
                source={require('../assets/images/workers-onboarding.png')} 
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            
            {/* Dark Overlay for readability */}
            <View style={styles.darkOverlay} />

            <View style={styles.contentContainer}>
                <View style={styles.topSpacer} />
                
                <View style={styles.textSection}>
                    <Text style={styles.title}>Mão Segura</Text>
                    <Text style={styles.subtitle}>
                        A maior rede de confiança para serviços{'\n'}
                        domésticos e comerciais em Moçambique.
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.tagline}>
                        A oportunidade certa para si!
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton]} 
                        onPress={handleStart} 
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Começar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.loginContainer}>
                        <Text style={styles.loginLink}>Já tenho uma conta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.tertiaryButton} 
                        onPress={handleExplore} 
                        activeOpacity={0.8}
                    >
                        <Text style={styles.tertiaryButtonText}>Explorar a plataforma livremente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        position: 'absolute',
        width: width,
        height: height,
        opacity: 0.65, // user asked for not 100%
    },
    darkOverlay: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // further darken for contrast
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        justifyContent: 'space-between',
        paddingBottom: Spacing.xxl + 20,
    },
    topSpacer: {
        height: 80,
    },
    textSection: {
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: Colors.white,
        marginBottom: Spacing.xs,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255, 255, 255, 0.9)',
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
        color: Colors.white,
        textAlign: 'center',
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    secondaryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    tertiaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    tertiaryButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
    },
    loginContainer: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
        alignItems: 'center',
    },
    loginLink: {
        color: Colors.white,
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
