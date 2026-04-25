import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants';
import { useAuthStore } from '../store/authStore';
import TermsModal from '../components/TermsModal';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
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
    
    const [fontsLoaded] = useFonts({
        ...Ionicons.font,
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
        if (user && expoPushToken && user.pushToken !== expoPushToken) {
            // Save valid token to Firestore if different
            updateDoc(doc(db, 'users', user.uid), {
                pushToken: expoPushToken
            }).catch(e => console.error('Erro ao guardar pushToken:', e));
            
            // Minimal optimistic update to avoid loop
            useAuthStore.setState({ user: { ...user, pushToken: expoPushToken }});
        }
    }, [user?.uid, expoPushToken]);

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
                <Stack.Screen name="worker/[id]" options={{ headerShown: false }} />
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
