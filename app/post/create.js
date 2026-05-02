import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { uploadImage } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { sendPushNotification } from '../../services/notificationService';
import { Colors, Spacing, Fonts, PROFESSION_CATEGORIES, JOBS_CATEGORIES_MAP } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function CreatePost() {
    const router = useRouter();
    const { user } = useAuthStore();
    
    useEffect(() => {
        if (user?.role === 'EMPLOYER') {
            router.replace('/job/create');
        }
    }, [user]);

    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [category, setCategory] = useState('');
    const [workType, setWorkType] = useState('');
    const [customWorkType, setCustomWorkType] = useState('');
    const [availability, setAvailability] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCreatePost = async () => {
        if (!category) {
            Alert.alert('Aviso', 'Por favor, selecione uma categoria de serviço.');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Aviso', 'Por favor, escreva uma descrição ou detalhes da sua disponibilidade/vaga.');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = null;
            if (imageUri) {
                imageUrl = await uploadImage(imageUri, `posts/${user.uid}/${Date.now()}.jpg`);
            }

            const postData = {
                user_id: user.uid,
                user_role: user.role,
                author_name: user?.name || 'Usuário',
                author_photo: user?.profile_photo || null,
                content: content.trim(),
                image_url: imageUrl,
                work_type: (workType === 'Outro' ? customWorkType.trim() : workType) || null,
                availability: availability || null,
                province: user?.province || null,
                city: user?.city || null,
                bairro: user?.bairro || null,
                created_at: serverTimestamp(),
                liked_by: [],
                comments_count: 0
            };

            await addDoc(collection(db, 'posts'), postData);

            // Disparar Notificação Background para Empregadores da mesma cidade
            (async () => {
                try {
                    const qEmps = query(collection(db, 'users'), where('role', '==', 'EMPLOYER'));
                    const snap = await getDocs(qEmps);
                    snap.forEach(docSnap => {
                        const data = docSnap.data();
                        if (data.pushToken && data.city === user.city) {
                            sendPushNotification(
                                data.pushToken, 
                                'Profissional Disponível!', 
                                `${user.name} partilhou disponibilidade para trabalhos.`, 
                                { type: 'post' }
                            );
                        }
                    });
                } catch(e) {
                    console.warn('Network log on broadcast push:', e);
                }
            })();

            Alert.alert('Sucesso', 'Sua disponibilidade foi publicada!');
            router.back();
        } catch (error) {
            console.error('Erro ao publicar post:', error);
            Alert.alert('Erro', 'Ocorreu um problema ao publicar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={[{ flex: 1 }, Platform.OS === 'web' && { alignItems: 'center', backgroundColor: Colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[{ flex: 1, width: '100%' }, Platform.OS === 'web' && { maxWidth: 600 }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Criar Publicação</Text>
                    <TouchableOpacity 
                        onPress={handleCreatePost} 
                        disabled={loading || !content.trim() || !category}
                        style={[styles.publishBtn, (loading || !content.trim() || !category) && styles.publishBtnDisabled]}
                    >
                        {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.publishBtnText}>Publicar</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            {user?.profile_photo ? (
                                <Image source={{ uri: user.profile_photo }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
                            )}
                        </View>
                        <View>
                            <Text style={styles.authorName}>{user?.name || 'Você'}</Text>
                            <Text style={styles.authorRole}>{user?.role === 'WORKER' ? 'Profissional' : 'Empregador'}</Text>
                        </View>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Deixe os outros saberem da sua disponibilidade ou vaga..."
                        placeholderTextColor={Colors.textLight}
                        multiline
                        value={content}
                        onChangeText={setContent}
                    />

                    <View style={styles.locationSummary}>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.locationSummaryText}>
                            {user?.city}, {user?.province} {user?.bairro ? `• ${user.bairro}` : ''}
                        </Text>
                        <View style={styles.lockBadge}>
                            <Ionicons name="lock-closed" size={10} color={Colors.textLight} />
                            <Text style={styles.lockText}>Perfil</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>Categoria do Serviço</Text>
                    <ScrollView 
                        horizontal={Platform.OS !== 'web'} 
                        showsHorizontalScrollIndicator={Platform.OS === 'web'} 
                        style={styles.chipsScroll}
                        contentContainerStyle={Platform.OS === 'web' && { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                    >
                        {PROFESSION_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipActive]}
                                onPress={() => { setCategory(cat); setWorkType(''); }}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {category && category !== 'Outro' && (
                        <>
                            <Text style={styles.sectionLabel}>Tipo de Trabalho / Especialização</Text>
                            <ScrollView 
                                horizontal={Platform.OS !== 'web'} 
                                showsHorizontalScrollIndicator={Platform.OS === 'web'} 
                                style={styles.chipsScroll}
                                contentContainerStyle={Platform.OS === 'web' && { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                            >
                                {JOBS_CATEGORIES_MAP[category]?.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.chip, workType === type && styles.chipActive]}
                                        onPress={() => setWorkType(workType === type ? '' : type)}
                                    >
                                        <Text style={[styles.chipText, workType === type && styles.chipTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {category === 'Outro' && (
                        <TextInput
                            style={[styles.input, { minHeight: 48, marginBottom: Spacing.md, borderRadius: 12, paddingHorizontal: 16, paddingTop: 14 }]}
                            placeholder="Especifique a sua área / vaga..."
                            placeholderTextColor={Colors.textLight}
                            value={customWorkType}
                            onChangeText={(text) => {
                                setCustomWorkType(text);
                                setWorkType('Outro');
                            }}
                        />
                    )}

                    <Text style={styles.sectionLabel}>Disponibilidade ou Turno</Text>
                    <ScrollView 
                        horizontal={Platform.OS !== 'web'} 
                        showsHorizontalScrollIndicator={Platform.OS === 'web'} 
                        style={styles.chipsScroll} 
                        contentContainerStyle={Platform.OS === 'web' ? { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } : { paddingRight: 20 }}
                    >
                        {['Imediato', 'Integral', 'Meio-período', 'Permanente', 'Diarista', 'Temporário'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.chip, availability === type && styles.chipActive]}
                                onPress={() => setAvailability(availability === type ? '' : type)}
                            >
                                <Text style={[styles.chipText, availability === type && styles.chipTextActive]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                                <Ionicons name="close-circle" size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.toolbar, { opacity: 0.6 }]}>
                    <TouchableOpacity 
                        style={styles.toolbarBtn} 
                        onPress={() => Alert.alert('Em Desenvolvimento', 'A funcionalidade de adicionar imagens estará disponível em breve.')}
                    >
                        <Ionicons name="image-outline" size={24} color={Colors.textLight} />
                        <Text style={[styles.toolbarBtnText, { color: Colors.textLight }]}>Imagem (Em breve)</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 10, color: Colors.textLight, marginLeft: 10, flex: 1 }}>
                        O armazenamento de imagens está a ser configurado.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.md, paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    publishBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    publishBtnDisabled: { backgroundColor: Colors.borderLight },
    publishBtnText: { color: Colors.white, fontWeight: '600', fontSize: Fonts.sizes.sm },
    
    container: { padding: Spacing.md, paddingBottom: 100, backgroundColor: Colors.white, flexGrow: 1 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
    avatarImage: { width: 44, height: 44, borderRadius: 22 },
    avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
    authorName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    authorRole: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
    
    
    input: { fontSize: Fonts.sizes.md, color: Colors.text, minHeight: 120, textAlignVertical: 'top', padding: 0, marginBottom: Spacing.sm },
    
    sectionLabel: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: 8 },
    chipsScroll: { marginBottom: Spacing.md },
    chip: { backgroundColor: Colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Colors.borderLight },
    chipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
    chipText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
    chipTextActive: { color: Colors.primary, fontWeight: '700' },

    imagePreviewContainer: { marginTop: Spacing.md, position: 'relative' },
    imagePreview: { width: '100%', height: 250, borderRadius: 12, backgroundColor: Colors.background },
    removeImageBtn: { position: 'absolute', top: 10, right: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
    
    toolbar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.md },
    toolbarBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: Colors.primaryBg, borderRadius: 8 },
    toolbarBtnText: { marginLeft: 8, color: Colors.primary, fontWeight: '600', fontSize: Fonts.sizes.sm },

    locationSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 10, borderRadius: 10, marginBottom: Spacing.md, gap: 6 },
    locationSummaryText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto', backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.borderLight },
    lockText: { fontSize: 9, color: Colors.textLight, fontWeight: '700', textTransform: 'uppercase' },
});
