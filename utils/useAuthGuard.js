import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export function useAuthGuard() {
    const router = useRouter();
    const { user } = useAuthStore();

    const requireAuth = () => {
        if (!user) {
            const msg = 'Faça login ou crie conta para explorar mais opções.';
            if (Platform.OS === 'web') {
                if (window.confirm(msg)) {
                    router.push('/auth/choose-type');
                }
            } else {
                Alert.alert(
                    'Acesso Restrito',
                    msg,
                    [
                        { text: 'Agora Não', style: 'cancel' },
                        { text: 'Fazer Login', onPress: () => router.push('/auth/choose-type') }
                    ]
                );
            }
            return false;
        }

        if (!user.emailVerified) {
            router.push('/auth/verify-email');
            return false;
        }

        return true;
    };

    return { requireAuth };
}
