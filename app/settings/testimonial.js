import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function SubmitTestimonial() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) {
            Alert.alert('Erro', 'Por favor, escreva o seu depoimento.');
            return;
        }

        try {
            setSubmitting(true);
            await addDoc(collection(db, 'testimonials'), {
                user_id: user.uid,
                name: user.name || 'Utilizador Mão Segura',
                role: user.role,
                text: text.trim(),
                rating: rating,
                status: 'PENDING',
                created_at: serverTimestamp(),
            });

            Alert.alert(
                'Sucesso', 
                'Obrigado pelo seu depoimento! Ele será analisado pela nossa equipa antes de ser publicado.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err) {
            console.error('Error submitting testimonial:', err);
            Alert.alert('Erro', 'Não foi possível enviar o seu depoimento. Tente novamente mais tarde.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Partilhe a sua experiência</Text>
                    <Text style={styles.subtitle}>O seu feedback ajuda-nos a crescer e a inspirar mais pessoas em Moçambique.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Como avalia a plataforma?</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity 
                                key={star} 
                                onPress={() => setRating(star)}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={star <= rating ? 'star' : 'star-outline'} 
                                    size={40} 
                                    color={star <= rating ? Colors.star : Colors.textLight} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: Spacing.lg }]}>O seu depoimento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Escreva aqui como o Mão Segura mudou a sua vida ou o seu negócio..."
                        placeholderTextColor={Colors.textLight}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={text}
                        onChangeText={setText}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{text.length}/500</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, submitting && styles.disabledButton]} 
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Enviar Depoimento</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => router.back()}
                    disabled={submitting}
                >
                    <Text style={styles.cancelButtonText}>Voltar</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    header: { marginBottom: Spacing.lg, marginTop: Spacing.md },
    title: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xs },
    subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
    card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, shadowColor: Colors.shadow, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
    label: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
    starsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: Spacing.sm },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: Spacing.md, height: 150, fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
    charCount: { fontSize: 12, color: Colors.textLight, textAlign: 'right', marginTop: 4 },
    submitButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    submitButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    disabledButton: { opacity: 0.7 },
    cancelButton: { paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
    cancelButtonText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, fontWeight: '500' },
});
