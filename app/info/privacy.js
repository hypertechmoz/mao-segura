import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Privacidade</Text>
                <Text style={styles.date}>Última atualização: Março de 2026</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Coleta de Informações</Text>
                <Text style={styles.text}>
                    Coletamos dados necessários para o funcionamento da plataforma, como nome, contacto telefónico, 
                    localização e fotos de perfil. Dados de trabalhadores incluem também habilidades e experiências profissionais.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Uso dos Dados</Text>
                <Text style={styles.text}>
                    Os seus dados são utilizados para conectar profissionais e empregadores. O seu número de telefone 
                    apenas é revelado após a sua autorização ou quando inicia uma conversa direta via chat.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Proteção de Dados</Text>
                <Text style={styles.text}>
                    Implementamos medidas de segurança para proteger as suas informações contra acessos não autorizados. 
                    Utilizamos os serviços da Google Firebase para armazenamento seguro e criptografado.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Direitos do Utilizador</Text>
                <Text style={styles.text}>
                    Pode editar ou eliminar o seu perfil a qualquer momento através das definições da aplicação. 
                    Também pode solicitar a remoção total dos seus dados enviando um e-mail para o nosso suporte local.
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
    header: { marginBottom: Spacing.xl },
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
    },
    backButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
