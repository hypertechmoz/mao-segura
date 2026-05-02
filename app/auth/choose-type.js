import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';

export default function ChooseType() {
    const router = useRouter();

    const handleSelect = (type) => {
        router.push({ pathname: '/auth/register', params: { role: type } });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Como deseja usar{'\n'}o Trabalhe Já?</Text>
                <Text style={styles.subtitle}>Escolha o tipo de conta que melhor se adequa a si.</Text>
            </View>

            <View style={styles.cards}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelect('WORKER')}
                    activeOpacity={0.8}
                >
                    <Image source={require('../../assets/images/cook.png')} style={styles.cardImage} resizeMode="cover" />
                    <Text style={styles.cardTitle}>Sou um Profissional</Text>
                    <Text style={styles.cardDescription}>
                        Quero encontrar trabalho, criar o meu perfil profissional e candidatar-me a vagas.
                    </Text>
                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>• Pode candidatar-se a vagas{'\n'}• Não pode publicar vagas</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, styles.cardEmployer]}
                    onPress={() => handleSelect('EMPLOYER')}
                    activeOpacity={0.8}
                >
                    <Image source={require('../../assets/images/plumber.png')} style={styles.cardImage} resizeMode="cover" />
                    <Text style={styles.cardTitle}>Sou um Cliente</Text>
                    <Text style={styles.cardDescription}>
                        Quero publicar vagas, encontrar profissionais e gerir contratações.
                    </Text>
                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>• Pode publicar vagas e contratar{'\n'}• Não pode candidatar-se</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginLink}>
                <Text style={styles.loginText}>Já tenho uma conta? <Text style={styles.loginBold}>Entrar</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        paddingTop: 80,
        paddingBottom: 40,
        ...(Platform.OS === 'web' ? { maxWidth: 500, alignSelf: 'center', width: '100%' } : {}),
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
        lineHeight: 22,
        textAlign: 'center',
    },
    cards: {
        gap: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cardEmployer: {
        borderColor: Colors.primary + '30',
    },
    cardImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: Spacing.md,
    },
    cardTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 8,
    },
    noteBox: {
        backgroundColor: Colors.background,
        padding: 8,
        borderRadius: 8,
        width: '100%',
    },
    noteText: {
        fontSize: 10,
        color: Colors.textSecondary,
        textAlign: 'left',
        lineHeight: 14,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    loginText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textSecondary,
    },
    loginBold: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
