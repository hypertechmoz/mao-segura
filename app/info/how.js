import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function HowItWorks() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Como Funciona</Text>
                <Text style={styles.date}>Guia Rápido da Plataforma</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Para Empregadores</Text>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>1.</Text>
                    <Text style={styles.stepText}>Crie uma conta como Empregador e complete o seu perfil.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>2.</Text>
                    <Text style={styles.stepText}>Pesquise por profissionais na sua zona ou publique uma vaga gratuita.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>3.</Text>
                    <Text style={styles.stepText}>Analise as avaliações e perfis e inicie uma conversa via chat.</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Para Trabalhadores</Text>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>1.</Text>
                    <Text style={styles.stepText}>Crie o seu perfil profissional com as suas melhores habilidades.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>2.</Text>
                    <Text style={styles.stepText}>Mantenha o seu perfil atualizado para aparecer no topo das pesquisas.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>3.</Text>
                    <Text style={styles.stepText}>Responda prontamente às mensagens e propostas recebidas.</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Primeiro contacto com bom senso</Text>
                <Text style={styles.text}>
                    Nunca realize pagamentos antecipados sem confirmar a identidade do profissional. 
                    Recomendamos que a primeira entrevista seja feita em locais públicos ou através de referências verificadas no Trabalhe já.
                </Text>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingBottom: 60, maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
    header: { marginBottom: Spacing.xl },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
    date: { fontSize: 13, color: Colors.textSecondary },
    section: { marginBottom: Spacing.xl, backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 16 },
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
