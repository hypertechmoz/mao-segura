import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function CompleteProfile() {
    const router = useRouter();
    const { user, refreshUser } = useAuthStore();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);

    const AVATARS = [
        'Maria', 'Jose', 'Elena', 'Carlos', 'Amina', 'David', 'Sofia', 'Lucas',
        'Zoe', 'Toby', 'Lilly', 'Jack', 'Mia', 'Noah', 'Ava', 'Leo',
        'Ines', 'Hugo', 'Bia', 'Rui', 'Clara', 'Nuno', 'Rosa', 'Vitor'
    ].map(seed => `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`);
    const [loading, setLoading] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    
    const [initialProfile, setInitialProfile] = useState({
        profile_photo: null,
        description: null,
        contact_preference: null,
        document_photo: null,
    });

    const [form, setForm] = useState({
        profile_photo: '',
        description: '',
        contact_preference: '',
        document_photo: '',
    });

    // Local state for picked image URIs before upload
    const [pickedProfilePhoto, setPickedProfilePhoto] = useState(null);
    const [pickedDocPhoto, setPickedDocPhoto] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                const profileSnap = await getDoc(doc(db, profileTable, user.uid));
                const profileData = profileSnap.exists() ? profileSnap.data() : {};

                const loadedProfile = {
                    profile_photo: profileData.profile_photo || null,
                    description: profileData.description || null,
                    contact_preference: profileData.contact_preference || null,
                    document_photo: profileData.document_photo || null,
                };

                setInitialProfile(loadedProfile);
                setProfilePhoto(loadedProfile.profile_photo || null);
                setForm({
                    profile_photo: loadedProfile.profile_photo || '',
                    description: loadedProfile.description || '',
                    contact_preference: loadedProfile.contact_preference || '',
                    document_photo: loadedProfile.document_photo || '',
                });
                setInitialDataLoaded(true);
            } catch (err) {
                console.error('Load profile error:', err);
            }
        };
        loadData();
    }, [user]);

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const selectAvatar = (url) => {
        setProfilePhoto(url);
        setShowAvatarModal(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
            
            const updates = {};
            
            if (profilePhoto && profilePhoto !== initialProfile.profile_photo) {
                updates.profile_photo = profilePhoto;
            }

            if (isEmpty(initialProfile.description) && form.description.trim()) updates.description = form.description;
            if (isEmpty(initialProfile.contact_preference) && form.contact_preference.trim()) updates.contact_preference = form.contact_preference;

            if (Object.keys(updates).length > 0) {
                await setDoc(doc(db, profileTable, user.uid), updates, { merge: true });
                
                if (updates.profile_photo) {
                    await setDoc(doc(db, 'users', user.uid), { profile_photo: updates.profile_photo }, { merge: true });
                }
                
                await refreshUser();
            }

            Alert.alert('Sucesso', 'Perfil completado com sucesso!', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (err) {
            console.error('Save error:', err);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar os seus dados. Verifique a sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const isEmpty = (val) => !val || val.trim() === '';

    if (!initialDataLoaded) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const showPhoto = isEmpty(initialProfile.profile_photo);
    const showDesc = isEmpty(initialProfile.description);
    const showContactPref = isEmpty(initialProfile.contact_preference);
    const showDocPhoto = isEmpty(initialProfile.document_photo);

    const hasFieldsToShow = showPhoto || showDesc || showContactPref || showDocPhoto;

    if (!hasFieldsToShow) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.primary} style={{ marginBottom: Spacing.md }} />
                <Text style={styles.successText}>Seu perfil já está 100% completo!</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.pageTitle}>Completar Perfil</Text>
            <Text style={styles.pageSubtitle}>Preencha apenas o que falta para aumentar a sua visibilidade na plataforma.</Text>

            <View style={styles.photoSection}>
                <TouchableOpacity onPress={() => setShowAvatarModal(true)} style={styles.photoContainer}>
                    {profilePhoto ? (
                        <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Ionicons name="person" size={40} color={Colors.textLight} />
                            <Text style={{ fontSize: 10, color: Colors.textLight, textAlign: 'center' }}>Escolher Avatar</Text>
                        </View>
                    )}
                    <View style={styles.photoBadge}>
                        <Ionicons name="camera" size={16} color={Colors.white} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.photoLabel}>Toque para escolher o seu avatar</Text>
            </View>

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <View style={styles.avatarModalOverlay}>
                    <View style={styles.avatarModal}>
                        <View style={styles.avatarModalHeader}>
                            <Text style={styles.avatarModalTitle}>Escolha o seu Avatar</Text>
                            <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView 
                            contentContainerStyle={styles.avatarGrid} 
                            style={{ maxHeight: 400 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {AVATARS.map((url, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[styles.avatarOption, profilePhoto === url && styles.avatarOptionSelected]}
                                    onPress={() => selectAvatar(url)}
                                >
                                    <Image source={{ uri: url }} style={styles.avatarGridImage} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {showDesc && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descrição / Sobre mim</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        value={form.description} 
                        onChangeText={(v) => update('description', v)} 
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholder="Dê mais detalhes sobre as suas experiências ou o que procura..."
                        placeholderTextColor={Colors.textLight}
                    />
                </View>
            )}

            {showContactPref && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Preferência de Contacto</Text>
                    <View style={styles.optionRow}>
                        {['chamada', 'mensagem', 'whatsapp'].map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={[styles.option, form.contact_preference === val && styles.optionActive]}
                                onPress={() => update('contact_preference', val)}
                            >
                                <Text style={[styles.optionText, form.contact_preference === val && styles.optionTextActive]}>
                                    {val === 'chamada' ? 'Chamada' : val === 'mensagem' ? 'SMS' : 'WhatsApp'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Document Photo Removed */}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Completar</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    centered: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}) },
    pageTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
    pageSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
    successText: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.primary, textAlign: 'center', marginBottom: Spacing.xl },
    inputGroup: { marginBottom: Spacing.lg },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
    textArea: { height: 100, paddingTop: 14 },
    button: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md, width: '100%' },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '700' },
    optionRow: { flexDirection: 'row', gap: 10 },
    option: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
    optionActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
    optionText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    optionTextActive: { color: Colors.primary, fontWeight: '600' },
    imagePickerBtn: { width: '100%', height: 180, backgroundColor: Colors.background, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    pickerPlaceholder: { alignItems: 'center' },
    pickerText: { marginTop: 8, fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '500' },
    imagePreview: { width: 150, height: 150, borderRadius: 75 },
    imagePreviewSquare: { width: '100%', height: '100%' },
    helperText: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 4, fontStyle: 'italic' },
    
    // Avatar selection styles
    photoSection: { alignItems: 'center', marginBottom: Spacing.xl },
    photoContainer: { position: 'relative', width: 100, height: 100 },
    photoImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background },
    photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.borderLight, borderStyle: 'dashed' },
    photoBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
    photoLabel: { fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 8 },
    avatarModalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        justifyContent: 'center', alignItems: 'center', padding: 20
    },
    avatarModal: {
        backgroundColor: Colors.white, borderRadius: 20, padding: 20, width: '100%', maxWidth: 400,
    },
    avatarModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    avatarModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
    avatarOption: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'transparent', padding: 2 },
    avatarOptionSelected: { borderColor: Colors.primary },
    avatarGridImage: { width: '100%', height: '100%', borderRadius: 32 },
});
