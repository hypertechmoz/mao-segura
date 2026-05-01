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
                <Text style={styles.date}>A missão Trabalhe já</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>A Nossa História</Text>
                <Text style={styles.text}>
                    O Trabalhe Já é uma plataforma inovadora de emprego focada em aproximar clientes, empresas e profissionais qualificados. A nossa missão é facilitar a contratação de forma rápida e segura.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>A Nossa Visão e Valores</Text>
                <Text style={styles.text}>
                    Acreditamos que cada empresa e cada lar merece profissionais de excelência, e que cada trabalhador deve ter as suas competências valorizadas. Através da nossa tecnologia, o Trabalhe Já conecta oportunidades a talentos, promovendo o crescimento económico e a geração de emprego.
                </Text>
            </View>

            <View style={[styles.section, { backgroundColor: 'transparent', alignItems: 'center', elevation: 0, paddingBottom: 40 }]}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 4 }}>
                    Versão 1.0.1
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Criado e Desenvolvido pelo <Text style={{fontWeight: 'bold', color: Colors.primary}}>Estúdio do Scott</Text>
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
