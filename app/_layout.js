import { useEffect } from 'react';
import { AppState, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants';
import { useAuthStore } from '../store/authStore';
import TermsModal from '../components/TermsModal';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { supabase } from '../services/supabase';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { GlobalAlerts } from '../components/GlobalAlerts';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebNavbar from '../components/WebNavbar';
import { useSegments, usePathname } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import AppDownloadPrompt from '../components/AppDownloadPrompt';
import { useUnreadCount } from '../utils/useUnreadCount';

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
    const [fontsLoaded, fontError] = useFonts({
        ...Ionicons.font,
        ...MaterialIcons.font,
    });

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (!isLoading && (fontsLoaded || fontError)) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [isLoading, fontsLoaded, fontError]);

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

    // Handle AppState to automatically refresh Supabase token
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <Head>
                <title>Konekta | A sua plataforma de serviços e profissionais</title>
                <meta name="description" content="Encontre os melhores profissionais para qualquer serviço, desde limpeza e construção até tecnologia e design. Rápido, fácil e seguro no Konekta." />
                <meta property="og:title" content="Konekta | A sua plataforma de serviços e profissionais" />
                <meta property="og:description" content="Encontre os melhores profissionais para qualquer serviço, desde limpeza e construção até tecnologia e design." />
                <meta property="og:type" content="website" />
                <style>{`
                    body, html, #root { 
                        background-color: ${Colors.background};
                    }
                `}</style>
            </Head>
            <StatusBar style="dark" />
            <GlobalAlerts />
            <TermsModal />
            <MainAppWrapper />
            <AppDownloadPrompt />
        </SafeAreaProvider>
    );
}

function MainAppWrapper() {
    const { user } = useAuthStore();
    const segments = useSegments();
    const pathname = usePathname();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 768;
    const isMobileWeb = width < 480;
    const isWeb = Platform.OS === 'web';
    
    // We only call this if we are on web and not on auth/landing, but hooks must be called unconditionally.
    // However, useUnreadCount is safe to call always.
    const { unreadMessages, unreadNotifications, unreadConnectionRequests } = useUnreadCount();

    // Do not show on auth pages or landing page
    const isAuthRoute = segments[0] === 'auth' || pathname === '/auth/login' || pathname === '/auth/register';
    const isLandingRoute = segments.length === 0 || pathname === '/' || pathname === '/index';
    const showWebNav = isWeb && user && !isAuthRoute && !isLandingRoute;

    return (
        <View style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : '100%', backgroundColor: Colors.background }}>
            {showWebNav && (
                <WebNavbar 
                    isSmall={isSmallScreen} 
                    isMobile={isMobileWeb} 
                    unreadMessages={unreadMessages} 
                    unreadNotifications={unreadNotifications} 
                    unreadConnectionRequests={unreadConnectionRequests} 
                />
            )}
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
                <Stack.Screen name="auth/update-password" options={{ headerShown: false }} />
                <Stack.Screen name="auth/verify-2fa" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="job/[id]" options={{ title: 'Detalhes da Vaga' }} />
                <Stack.Screen name="job/create" options={{ headerShown: false }} />
                <Stack.Screen name="post/create" options={{ headerShown: false }} />
                <Stack.Screen name="post/[id]/comments" options={{ headerShown: false }} />
                <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="auth/success" options={{ headerShown: false }} />
                <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="settings/edit-profile" options={{ title: 'Editar Perfil' }} />
                <Stack.Screen name="settings/security" options={{ headerShown: false }} />
                <Stack.Screen name="settings/complete-profile" options={{ title: 'Completar Perfil' }} />
                <Stack.Screen name="settings/premium" options={{ title: 'Premium' }} />
                <Stack.Screen name="info/terms" options={{ headerShown: false }} />
                <Stack.Screen name="info/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="info/help" options={{ headerShown: false }} />
                <Stack.Screen name="info/how" options={{ headerShown: false }} />
                <Stack.Screen name="info/about" options={{ headerShown: false }} />
                <Stack.Screen name="info/coming-soon" options={{ headerShown: false }} />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}
