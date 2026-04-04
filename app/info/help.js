import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
    {
        q: 'Como apagar a minha conta?',
        a: 'Aceda a Editar Perfil através do menu, e selecione "Apagar Conta". Esta ação é irreversível e todos os seus dados serão eliminados.'
    },
    {
        q: 'Quando devo pagar pelo serviço?',
        a: 'A nossa plataforma não faz o intermédio de pagamentos de momento. Qualquer pagamento pelo serviço deve ser acordado diretamente entre o trabalhador e o cliente (empregador).'
    },
    {
        q: 'Quero reportar um utilizador. Como faço?',
        a: 'Se notou algum comportamento indevido, aceda ao perfil da pessoa em causa e clique no botão "Reportar" no topo. Pode também entrar em contacto diretamente com o nosso Suporte abaixo.'
    },
    {
        q: 'Esqueci-me da minha palavra-passe',
        a: 'Na página de login, clique em "Esqueceu-se da sua palavra-passe" para receber um email de recuperação. Se fez login pelo Google, não é necessária palavra-passe.'
    }
];

function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <View style={styles.faqCard}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => setOpen(!open)}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {open && (
                <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{answer}</Text>
                </View>
            )}
        </View>
    );
}

export default function SupportAndHelp() {
    const router = useRouter();
    const [problemText, setProblemText] = useState('');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Ajuda e Suporte</Text>
                <Text style={styles.subtitle}>Encontre respostas para as principais dúvidas ou fale diretamente connosco.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
                {FAQS.map((faq, idx) => (
                    <FAQItem key={idx} question={faq.q} answer={faq.a} />
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Não encontrou a resposta?</Text>
                <Text style={styles.textLabel}>Exponha o seu problema aqui:</Text>
                <TextInput
                    style={styles.problemInput}
                    placeholder="Descreva a sua situação de forma resumida..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={4}
                    value={problemText}
                    onChangeText={setProblemText}
                    textAlignVertical="top"
                />
                
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.btnAction, problemText.trim().length === 0 && { opacity: 0.5 }]} 
                        disabled={problemText.trim().length === 0}
                        onPress={() => {
                            Linking.openURL(`mailto:hypertechsupport004@gmail.com?subject=Suporte Mão Segura&body=${encodeURIComponent(problemText)}`);
                            setProblemText('');
                        }}
                    >
                        <Ionicons name="send" size={16} color={Colors.white} />
                        <Text style={styles.btnActionText}>Enviar E-mail</Text>
                    </TouchableOpacity>

                    <Text style={{ marginHorizontal: 12, color: Colors.textSecondary }}>ou</Text>

                    <TouchableOpacity style={styles.supportButton} onPress={() => Linking.openURL('https://wa.me/258843623989')}>
                        <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                        <Text style={styles.supportButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>
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
    subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    faqCard: { 
        backgroundColor: Colors.white, 
        borderRadius: 12, 
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        overflow: 'hidden'
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqQuestion: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1, paddingRight: 10 },
    faqBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    faqAnswer: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
    textLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
    problemInput: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: Colors.text,
        minHeight: 100,
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnAction: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    btnActionText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
    supportButton: { 
        flex: 1,
        backgroundColor: '#25D366', // WhatsApp
        paddingVertical: 14, 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    supportButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
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
