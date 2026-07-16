import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants';
import { useAuthStore } from '../store/authStore';
import TermsModal from '../components/TermsModal';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import IoniconsFont from '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf';
import MaterialIconsFont from '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf';

import { supabase } from '../services/supabase';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { GlobalAlerts } from '../components/GlobalAlerts';

// Initialize i18n
import '../utils/i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const initialize = useAuthStore(s => s.initialize);
    const isLoading = useAuthStore(s => s.isLoading);
    const user = useAuthStore(s => s.user);
    const { expoPushToken } = usePushNotifications();
    
    // Load ALL icon font families. The key names here become the CSS
    // font-family values in @font-face rules on web.
    // We register both "MaterialIcons" and "Material Icons" (with space)
    // because different parts of the library reference different names.
    const [fontsLoaded] = useFonts({
        'Ionicons': IoniconsFont,
        'MaterialIcons': MaterialIconsFont,
        'Material Icons': MaterialIconsFont,
    });

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (!isLoading && fontsLoaded) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [isLoading, fontsLoaded]);

    useEffect(() => {
        const userId = user?.uid || user?.id;
        if (userId && expoPushToken && user.pushToken !== expoPushToken) {
            // Save valid token to Supabase if different
            supabase
                .from('users')
                .update({ pushToken: expoPushToken })
                .eq('id', userId)
                .then(({ error }) => {
                    if (error) console.error('Erro ao guardar pushToken:', error);
                });
            
            // Minimal optimistic update to avoid loop
            useAuthStore.setState({ user: { ...user, pushToken: expoPushToken }});
        }
    }, [user?.uid, user?.id, expoPushToken]);

    // This guarantees the fonts are loaded in the browser immediately on web!
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const styleId = 'konekta-static-fonts';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @font-face {
                    font-family: "Ionicons";
                    src: url(${IoniconsFont}) format("truetype");
                }
                @font-face {
                    font-family: "MaterialIcons";
                    src: url(${MaterialIconsFont}) format("truetype");
                }
                @font-face {
                    font-family: "Material Icons";
                    src: url(${MaterialIconsFont}) format("truetype");
                }
            `;
            document.head.appendChild(style);
        }
    }

    return (
        <>
            <StatusBar style="dark" />
            <GlobalAlerts />
            <TermsModal />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: Colors.white },
                    headerTintColor: Colors.primary,
                    headerTitleStyle: { fontWeight: '600', fontSize: 18 },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="auth/choose-type" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ title: 'Criar Conta' }} />

                <Stack.Screen name="auth/login" options={{ title: 'Entrar' }} />
                <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
                <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="job/[id]" options={{ title: 'Detalhes da Vaga' }} />
                <Stack.Screen name="job/create" options={{ headerShown: false }} />
                <Stack.Screen name="post/create" options={{ headerShown: false }} />
                <Stack.Screen name="post/[id]/comments" options={{ headerShown: false }} />
                <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="auth/success" options={{ headerShown: false }} />
                <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="settings/edit-profile" options={{ title: 'Editar Perfil' }} />
                <Stack.Screen name="settings/complete-profile" options={{ title: 'Completar Perfil' }} />
                <Stack.Screen name="settings/premium" options={{ title: 'Premium' }} />
                <Stack.Screen name="info/terms" options={{ headerShown: false }} />
                <Stack.Screen name="info/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="info/help" options={{ headerShown: false }} />
                <Stack.Screen name="info/how" options={{ headerShown: false }} />
                <Stack.Screen name="info/about" options={{ headerShown: false }} />
                <Stack.Screen name="info/coming-soon" options={{ headerShown: false }} />
            </Stack>
        </>
    );
}
