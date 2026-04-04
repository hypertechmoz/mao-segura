import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function ComingSoon() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Ionicons name="construct-outline" size={80} color={Colors.primary} style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Em Breve</Text>
            <Text style={styles.subtitle}>
                Esta página está em desenvolvimento. Estamos a preparar secções dedicadas e novas funcionalidades para a comunidade Mão Segura.
            </Text>
            
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Voltar à plataforma</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 12 },
    subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, maxWidth: 400 },
    backButton: { 
        backgroundColor: Colors.primary, 
        paddingVertical: 14, 
        paddingHorizontal: 32,
        borderRadius: 12, 
        marginTop: 32,
    },
    backButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
