import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading]);

  if (isLoading || user?.role !== 'ADMIN') return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Painel de Controlo' }} />
      <Stack.Screen name="users" options={{ title: 'Gerir Utilizadores' }} />
      <Stack.Screen name="reports" options={{ title: 'Denúncias' }} />
    </Stack>
  );
}
