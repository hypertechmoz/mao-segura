import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Fonts } from '../constants';
import { Ionicons } from '@expo/vector-icons';

const TERMS_ACCEPTED_KEY = 'mao_segura_terms_v1';

export default function TermsModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkTerms();
    }, []);

    const checkTerms = async () => {
        try {
            const accepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
            if (!accepted) {
                setIsVisible(true);
            }
        } catch (error) {
            console.error('Error checking terms:', error);
            setIsVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
            setIsVisible(false);
        } catch (error) {
            console.error('Error saving terms:', error);
            setIsVisible(false); // Hide anyway to not block user
        }
    };

    if (loading) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                // Prevent closing by Android back button
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    <View style={styles.header}>
                        <Ionicons name="shield-checkmark" size={36} color={Colors.primary} style={{ marginBottom: 12 }} />
                        <Text style={styles.title}>Bem-vindo ao Mão Segura</Text>
                        <Text style={styles.subtitle}>Antes de entrar, por favor leia atentamente as nossas regras essenciais de convivência e termos de uso da comunidade.</Text>
                    </View>

                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
                        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>1. Informação Real e Honesta</Text>
                        <Text style={styles.text}>
                            Para garantir a segurança de todos, é obrigatório o uso do seu nome real e o fornecimento de contatos válidos. A criação de perfis falsos resultará no banimento imediato da conta.
                        </Text>
                        
                        <Text style={styles.sectionTitle}>2. Respeito e Segurança Mútua</Text>
                        <Text style={styles.text}>
                            A nossa plataforma baseia-se no respeito entre profissionais e clientes. Qualquer comportamento abusivo, assédio, violência ou linguagem inadequada será motivo de expulsão. Se suspeitar de uma burla, reporte de imediato.
                        </Text>

                        <Text style={styles.sectionTitle}>3. Responsabilidade do Serviço</Text>
                        <Text style={styles.text}>
                            O Mão Segura facilita a ligação e o primeiro contacto entre as partes. Todas as negociações de valores, duração e qualidade do serviço a prestar são da inteira responsabilidade do cliente e do trabalhador.
                        </Text>

                        <Text style={styles.sectionTitle}>4. Veracidade das Vagas</Text>
                        <Text style={styles.text}>
                            Empregadores devem publicar anúncios e vagas de forma detalhada e honesta, honrando sempre as compensações financeiras combinadas com o trabalhador após a devida prestação do serviço.
                        </Text>

                        <Text style={styles.sectionTitle}>5. Compromisso com Privacidade e Termos</Text>
                        <Text style={styles.text}>
                            Ao prosseguir, interagir, comunicar-se com pessoas, partilhar dados e usar a plataforma, declara ter compreendido e aceite integralmente a nossa Política de Privacidade e os Termos de Uso. Em caso de infração e de denúncia, as autoridades competentes poderão ser acionadas.
                        </Text>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
                            <Text style={styles.acceptButtonText}>Li e Aceito as Condições</Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.md,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    modalCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%', 
        flexShrink: 1, 
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        padding: Spacing.xl,
        paddingBottom: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: Colors.primaryBg,
        flexShrink: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    scrollView: {
        flexShrink: 1,
        paddingHorizontal: Spacing.xl,
    },
    scrollContent: {
        paddingVertical: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        marginTop: 20,
    },
    text: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        textAlign: 'justify',
    },
    footer: {
        padding: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.white,
    },
    acceptButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    acceptButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
