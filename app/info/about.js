import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AboutUs() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Sobre Nós</Text>
                <Text style={styles.date}>A Missão Mão Segura</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>A Nossa História</Text>
                <Text style={styles.text}>
                    O Mão Segura nasceu em 2024 com a missão de formalizar e trazer segurança ao mercado de serviços em Moçambique. Sediados em Nampula, começamos por entender os desafios locais e rapidamente expandimos a nossa visão para todo o país.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>A Nossa Visão e Valores</Text>
                <Text style={styles.text}>
                    Acreditamos que cada lar e pequena empresa merece profissionais de confiança e que cada trabalhador informal merece ser valorizado, credenciado e respeitado. Através da tecnologia, o Mão Segura atua como a ponte segura que elimina barreiras, promove o empoderamento económico e cria oportunidades reais de emprego sustentável.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sede e Operação</Text>
                <Text style={styles.text}>
                    A nossa sede central está localizada na cidade de Nampula. A nossa plataforma, contudo, é desenhada para conectar moçambicanos de Norte a Sul, com forte presença em Nampula, Maputo e Matola.
                </Text>
            </View>

            <View style={[styles.section, { backgroundColor: 'transparent', alignItems: 'center', elevation: 0, paddingBottom: 40 }]}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 4 }}>
                    Versão 1.0.0
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Criado e Desenvolvido por <Text style={{fontWeight: 'bold', color: Colors.primary}}>Hypertech</Text>
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingBottom: 60, maxWidth: 800, alignSelf: 'center', width: '100%' },
    header: { marginBottom: Spacing.xl },
    backIcon: { marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
    date: { fontSize: 13, color: Colors.textSecondary },
    section: { marginBottom: Spacing.xl, backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
    text: { fontSize: 15, color: '#444', lineHeight: 24 },
});
