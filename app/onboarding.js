import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Fonts } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandWordmark from '../components/BrandWordmark';

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
