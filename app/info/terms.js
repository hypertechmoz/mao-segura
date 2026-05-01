import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAndConditions() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Termos e Condições</Text>
                <Text style={styles.date}>Última atualização: Março de 2026</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
                <Text style={styles.text}>
                    Ao utilizar a plataforma Trabalhe já, o utilizador concorda em cumprir estes Termos e Condições. 
                    Se não concordar, por favor, não utilize os nossos serviços.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
                <Text style={styles.text}>
                    O Trabalhe já é uma plataforma que conecta prestadores de serviços (Trabalhadores) e clientes (Empregadores) em Moçambique. 
                    O Trabalhe já não é uma agência de emprego e não se responsabiliza pelas negociações diretas entre as partes.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Responsabilidades do Utilizador</Text>
                <Text style={styles.text}>
                    Os utilizadores são responsáveis pela veracidade das informações fornecidas nos seus perfis. 
                    Empregadores devem garantir um ambiente de trabalho adequado e o pagamento pontual conforme acordado.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Pagamentos e Mediação</Text>
                <Text style={styles.text}>
                    A plataforma oferece ferramentas de mediação, mas não processa diretamente todos os pagamentos de serviços, 
                    exceto quando indicado expressamente através de sistemas integrados de M-Pesa ou e-Mola.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Direitos e Propriedade</Text>
                <Text style={styles.text}>
                    Todo o conteúdo disponível na plataforma é propriedade do Trabalhe já ou dos seus licenciadores.
                </Text>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Entendido</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingBottom: 60 },
    header: { marginBottom: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.md },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
    date: { fontSize: 13, color: Colors.textSecondary },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
    text: { fontSize: 15, color: Colors.text, lineHeight: 24, textAlign: 'justify' },
    backButton: { 
        backgroundColor: Colors.primary, 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: Spacing.xl,
        shadowColor: Colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    backButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
