import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, Spacing } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Careers() {
    const router = useRouter();

    return (
        <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Carreiras no Kwick</Text>
                <Text style={styles.date}>Junte-se à nossa rede de profissionais</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seja o Próximo Especialista</Text>
                <Text style={styles.text}>
                    No Kwick, acreditamos que o talento deve ser valorizado e conectado às melhores oportunidades. 
                    Seja você um trabalhador independente, técnico especializado ou empresa prestadora de serviços, a nossa plataforma oferece as ferramentas certas para impulsionar a sua carreira e aumentar os seus rendimentos.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vantagens de Trabalhar Connosco</Text>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>✓</Text>
                    <Text style={styles.stepText}>Acesso a milhares de clientes na sua zona à procura dos seus serviços.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>✓</Text>
                    <Text style={styles.stepText}>Gestão simplificada através da aplicação (chat, agendamento e reputação).</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>✓</Text>
                    <Text style={styles.stepText}>Construa uma marca de confiança com avaliações reais de clientes verificados.</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingBottom: 60, maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
    header: { marginBottom: Spacing.xl },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
    date: { fontSize: 13, color: Colors.textSecondary },
    section: { marginBottom: Spacing.xl, backgroundColor: Colors.white, padding: Spacing.lg, borderRadius: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
    step: { flexDirection: 'row', marginBottom: 10, paddingRight: 20 },
    stepNumber: { width: 24, fontWeight: '800', color: Colors.primary },
    stepText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 22 },
    text: { fontSize: 14, color: '#666', lineHeight: 22 },
    backButton: { 
        backgroundColor: Colors.white, 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        marginBottom: Spacing.xl,
    },
    backButtonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
