import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform, Image, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { Colors, Spacing, Fonts, JOB_TYPES, COMMON_SKILLS, REMOTE_CATEGORIES, ONSITE_CATEGORIES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import { handleError } from '../../utils/errorHandler';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function EditProfile() {
    const router = useRouter();
    const { user, refreshUser, deleteAccount } = useAuthStore();
    const { categories, getSpecialtiesByCategoryName } = useTaxonomy();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const AVATAR_STYLES = [
        {
            label: 'Pessoas', style: 'lorelei', seeds: [
                'Maria', 'Jose', 'Elena', 'Carlos', 'Amina', 'David', 'Sofia', 'Lucas',
                'Zoe', 'Toby', 'Lilly', 'Jack', 'Mia', 'Noah', 'Ava', 'Leo',
                'Ines', 'Hugo', 'Bia', 'Rui', 'Clara', 'Nuno', 'Rosa', 'Vitor'
            ]
        },
        {
            label: 'Artísticos', style: 'avataaars', seeds: [
                'Ana', 'Pedro', 'Luz', 'Tomas', 'Fatima', 'Jorge', 'Mariana', 'Rafael',
                'Celeste', 'Dinis', 'Laura', 'Mateus'
            ]
        },
        {
            label: 'Divertidos', style: 'bottts', seeds: [
                'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
                'Iota', 'Kappa', 'Lambda', 'Omega'
            ]
        },
    ];

    const AVATARS = AVATAR_STYLES.flatMap(group =>
        group.seeds.map(seed => ({
            url: `https://api.dicebear.com/7.x/${group.style}/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
            group: group.label,
        }))
    );
    const [loading, setLoading] = useState(false);
    const [initialForm, setInitialForm] = useState(null);
    const [profileExists, setProfileExists] = useState(false);
    const [showAllFields, setShowAllFields] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const isPickingImage = useRef(false);

    const [form, setForm] = useState({
        name: '', phone: '', document: '', province: '', city: '', bairro: '', addressDetails: '', companyName: '',
        professionCategory: '', customCategory: '',
        workTypes: [], customWT: '',
        skills: [], tempSkill: '',
        workModalities: ['PRESENCIAL'],
        serviceTypes: ['SINGLE_TASK'],
        availability: 'IMMEDIATE',
        hasExperience: null, description: '', interests: '',
    });
    const [employerInterests, setEmployerInterests] = useState({
        modalities: [],
        categories: [],
        specialties: []
    });

    const getAvailableCategories = (modalities) => {
        let cats = new Set();
        if (modalities.includes('Remoto')) REMOTE_CATEGORIES.forEach(c => cats.add(c));
        if (modalities.includes('Presencial')) ONSITE_CATEGORIES.forEach(c => cats.add(c));
        if (modalities.includes('Híbrido')) {
            REMOTE_CATEGORIES.forEach(c => cats.add(c));
            ONSITE_CATEGORIES.forEach(c => cats.add(c));
        }
        return Array.from(cats).sort();
    };

    useFocusEffect(
        useCallback(() => {
            if (isPickingImage.current) return;
            const loadData = async () => {
                const uid = user?.uid || user?.id;
                if (!uid) return;
                try {
                    setLoading(true);
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', uid)
                        .maybeSingle();

                    if (userError || !userData) {
                        const metadata = user?.user_metadata || {};
                        const initialData = {
                            name: metadata.name || '',
                            province: metadata.province || '',
                            city: metadata.city || '',
                            bairro: metadata.bairro || '',
                            phone: metadata.phone || '',
                            document: '',
                            professionCategory: metadata.role === 'EMPLOYER' ? '' : '',
                            workTypes: [],
                            skills: [],
                            workModalities: ['PRESENCIAL'],
                            serviceTypes: ['SINGLE_TASK'],
                            availability: 'IMMEDIATE',
                            description: ''
                        };
                        setForm(prev => ({ ...prev, ...initialData }));
                        setInitialForm({});
                        setLoading(false);
                        return;
                    }

                    const profileTable = userData.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                    const { data: profileData, error: profileError } = await supabase
                        .from(profileTable)
                        .select('*')
                        .eq('user_id', uid)
                        .maybeSingle();

                    setProfileExists(!!profileData);

                    if (userData) {
                        const loadedWT = profileData?.work_types || [];
                        const customWT = loadedWT.find(w => !JOB_TYPES.includes(w));
                        const wts = loadedWT.filter(w => JOB_TYPES.includes(w));
                        if (customWT) wts.push('Outro');

                        const loadedSkills = profileData?.skills || [];
                        const customSkill = loadedSkills.find(s => !COMMON_SKILLS.includes(s));
                        const sks = loadedSkills.filter(s => COMMON_SKILLS.includes(s));
                        if (customSkill) sks.push('Outro');

                        const loadedCat = profileData?.profession_category || '';
                        const isCustomCat = loadedCat && !categories.some(c => c.name === loadedCat);

                        setProfilePhoto(userData?.profile_photo || null);

                        const loadedForm = {
                            phone: userData.phone || '',
                            name: userData.name || '',
                            document: userData.document || '',
                            province: userData.province || '',
                            city: userData.city || '',
                            bairro: userData.bairro || '',
                            professionCategory: isCustomCat ? 'Outro' : loadedCat,
                            customCategory: isCustomCat ? loadedCat : '',
                            workTypes: wts,
                            customWT: customWT || '',
                            skills: sks,
                            tempSkill: customSkill || '',
                            workModalities: profileData?.work_modalities || ['PRESENCIAL'],
                            serviceTypes: profileData?.service_types || ['SINGLE_TASK'],
                            availability: profileData?.availability || 'IMMEDIATE',
                            hasExperience: profileData?.has_experience ?? null,
                            description: profileData?.description || '',
                            interests: profileData?.interests || ''
                        };

                        let parsedInterests = { modalities: [], categories: [], specialties: [] };
                        if (profileData?.interests) {
                            try {
                                parsedInterests = JSON.parse(profileData.interests);
                            } catch (e) {
                                parsedInterests.modalities = profileData.interests.split(',').map(s => s.trim()).filter(Boolean);
                            }
                        }
                        setEmployerInterests(parsedInterests);

                        setForm(loadedForm);
                        setInitialForm(loadedForm);
                    }
                } catch (err) {
                    handleError(err, 'Carregamento de Perfil');
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }, [user?.uid, user?.id])
    );

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const selectAvatar = (avatarUrl) => {
        setProfilePhoto(avatarUrl);
        setShowAvatarModal(false);
    };

    const handlePickImage = async (useCamera = false) => {
        isPickingImage.current = true;
        try {
            const { status } = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                useAlertStore.getState().showAlert('Permissão Negada', 'Precisamos de acesso para carregar a foto.', 'error');
                isPickingImage.current = false;
                return;
            }

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });

            if (!result.canceled && result.assets && result.assets[0].uri) {
                const imageUri = result.assets[0].uri;
                await uploadImage(imageUri);
            }
        } catch (err) {
            console.error('Pick image error:', err);
        } finally {
            setShowPhotoOptions(false);
            setTimeout(() => { isPickingImage.current = false; }, 1000);
        }
    };

    const uploadImage = async (uri) => {
        const uid = user?.uid || user?.id;
        if (!uid) return;

        setUploadingPhoto(true);
        try {
            // Improved extension detection
            let fileExt = uri.split('.').pop()?.toLowerCase() || 'png';
            if (fileExt.includes('?')) fileExt = fileExt.split('?')[0];
            if (fileExt.length > 4) fileExt = 'png'; // Fallback for blob URLs

            const fileName = `${uid}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Convert to base64
            const response = await fetch(uri);
            const blob = await response.blob();
            const reader = new FileReader();

            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });
            const base64 = await base64Promise;

            const { data, error } = await supabase.storage
                .from('profiles')
                .upload(filePath, decode(base64), {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            setProfilePhoto(publicUrl);
        } catch (err) {
            console.error('Upload error:', err);
            useAlertStore.getState().showAlert('Erro no Upload', 'Não foi possível carregar a imagem.', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const toggleWorkType = (type) => {
        const currentWT = form.workTypes || [];
        const wt = currentWT.includes(type)
            ? currentWT.filter((t) => t !== type)
            : [...currentWT, type];
        update('workTypes', wt);
    };

    const toggleSkill = (skill) => {
        const currentSkills = form.skills || [];
        if (currentSkills.includes(skill)) {
            update('skills', currentSkills.filter((s) => s !== skill));
        } else {
            if (currentSkills.length >= 5) {
                useAlertStore.getState().showAlert('Aviso', 'Pode adicionar no máximo 5 habilidades.', 'error');
                return;
            }
            update('skills', [...currentSkills, skill]);
        }
    };

    const handleCustomSkillInput = (val) => {
        if (val.includes('#')) {
            const parts = val.split('#');
            const newSkill = parts[0].trim();
            if (newSkill) {
                const currentSkills = form.skills || [];
                if (currentSkills.length >= 5) {
                    useAlertStore.getState().showAlert('Aviso', 'Pode adicionar no máximo 5 habilidades.', 'error');
                    update('tempSkill', '');
                    return;
                }
                if (!currentSkills.includes(newSkill)) {
                    setForm(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill], tempSkill: '' }));
                    return;
                }
            }
            update('tempSkill', '');
        } else {
            update('tempSkill', val);
        }
    };

    const handleCustomWTInput = (val) => {
        if (val.includes('#')) {
            const parts = val.split('#');
            const newWT = parts[0].trim();
            if (newWT) {
                const currentWT = form.workTypes || [];
                if (!currentWT.includes(newWT)) {
                    setForm(prev => ({ ...prev, workTypes: [...(prev.workTypes || []), newWT], customWT: '' }));
                    return;
                }
            }
            update('customWT', '');
        } else {
            update('customWT', val);
        }
    };

    const toggleModality = (mod) => {
        const currentMods = form.workModalities || [];
        const updated = currentMods.includes(mod)
            ? currentMods.filter(m => m !== mod)
            : [...currentMods, mod];
        if (updated.length === 0) return; // Must have at least 1 modality
        update('workModalities', updated);
    };

    const toggleServiceType = (st) => {
        const currentST = form.serviceTypes || [];
        const updated = currentST.includes(st)
            ? currentST.filter(s => s !== st)
            : [...currentST, st];
        if (updated.length === 0) return; // Must have at least 1 service type
        update('serviceTypes', updated);
    };

    const handleSave = async () => {
        const uid = user?.uid || user?.id;
        if (!uid) {
            useAlertStore.getState().showAlert('Erro', 'Sessão inválida. Reinicie a app.', 'error');
            return;
        }

        const currentRole = user?.role || initialForm?.role || form.role || 'WORKER';

        setLoading(true);
        console.log('[handleSave] Iniciando...', { uid, currentRole });

        try {
            const userUpdate = {
                profile_photo: profilePhoto
            };

            if (!initialForm?.name && form.name) userUpdate.name = form.name;
            if (!initialForm?.phone && form.phone) userUpdate.phone = form.phone;
            if (!initialForm?.province && form.province) userUpdate.province = form.province;
            if (!initialForm?.city && form.city) userUpdate.city = form.city;
            if (!initialForm?.bairro && form.bairro) userUpdate.bairro = form.bairro;

            console.log('[handleSave] Atualizando public.users:', userUpdate);
            const { error: userError } = await supabase.from('users').update(userUpdate).eq('id', uid);

            if (userError) throw userError;

            let finalCategory = form.professionCategory === 'Outro' && form.customCategory?.trim()
                ? form.customCategory.trim()
                : form.professionCategory;

            let finalWT = (form.workTypes || []).filter(t => t !== 'Outro' && !!t);
            if ((form.workTypes || []).includes('Outro') && form.customWT?.trim()) {
                finalWT.push(form.customWT.trim());
            }

            let finalSkills = (form.skills || []).filter(s => s !== 'Outro' && !!s);
            if ((form.skills || []).includes('Outro') && form.tempSkill?.trim()) {
                finalSkills.push(form.tempSkill.trim());
            }

            const profileTable = currentRole === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';

            let profilePayload = {};
            if (currentRole === 'WORKER') {
                profilePayload = {
                    user_id: uid,
                    profession_category: finalCategory || null,
                    work_types: Array.from(new Set(finalWT)),
                    skills: Array.from(new Set(finalSkills)),
                    work_modalities: form.workModalities || ['PRESENCIAL'],
                    service_types: form.serviceTypes || ['SINGLE_TASK'],
                    availability: form.availability || 'IMMEDIATE',
                    has_experience: form.hasExperience,
                    description: form.description || null
                };
            } else {
                profilePayload = {
                    user_id: uid,
                    interests: JSON.stringify(employerInterests)
                };
            }

            console.log('[handleSave] Atualizando tabela de perfil:', profileTable, profilePayload);
            const profileUpdatePayload = { ...profilePayload };
            delete profileUpdatePayload.user_id;
            const profileMutation = profileExists
                ? supabase.from(profileTable).update(profileUpdatePayload).eq('user_id', uid)
                : supabase.from(profileTable).insert(profilePayload);
            const { error: profileError } = await profileMutation;

            if (profileError) throw profileError;

            console.log('[handleSave] Fazendo refreshUser...');
            await refreshUser();
            
            console.log('[handleSave] Concluído com Sucesso!');
            useAlertStore.getState().showAlert('Sucesso', 'Perfil atualizado com sucesso!', 'success');

            setTimeout(() => {
                router.replace('/(tabs)/profile');
            }, 2000);

        } catch (err) {
            console.error('[handleSave] Erro capturado:', err);
            handleError(err, 'Guardar Perfil');
        } finally {
            console.log('[handleSave] Finalizando (Loading = false)');
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await deleteAccount(deletePassword);
            setShowDeleteModal(false);
            router.replace('/(auth)/login');
        } catch (err) {
            handleError(err, 'Eliminar Conta');
            setLoading(false);
        }
    };

    // Bloqueia apenas se o campo já tiver sido preenchido inicialmente.
    // Se estiver vazio (ex: utilizador que fez registo via Google sem número de telefone), permite o preenchimento!
    const isLocked = (field) => {
        const permanentFields = ['name', 'phone', 'province', 'city', 'bairro'];
        if (!permanentFields.includes(field)) return false;
        const initialVal = initialForm ? initialForm[field] : null;
        return !!(initialVal && String(initialVal).trim() !== '');
    };

    // Mostra o campo se showAllFields for true, se não estiver bloqueado (ex: telefone vazio) ou se for um campo normal
    const shouldShow = (field) => {
        if (showAllFields) return true;
        if (loading && !initialForm) return false;

        const autoHideFields = ['name', 'phone', 'province', 'city', 'bairro'];

        if (autoHideFields.includes(field)) {
            const initialVal = initialForm ? initialForm[field] : null;
            const isFilled = initialVal && String(initialVal).trim() !== '';
            // Se NÃO está preenchido (ex: Google user sem telefone), DEVE MOSTRAR para o utilizador preencher!
            return !isFilled;
        }

        return true;
    };

    // Helper to see if any field is hidden because it was already filled
    const hasHiddenFields = initialForm && !showAllFields && ['name', 'phone', 'province', 'city', 'bairro'].some(k => {
        const val = initialForm[k];
        return val && String(val).trim() !== '';
    });

    return (
        <View style={styles.container}>
            {saveSuccess && (
                <View style={styles.successBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        <Text style={styles.successText}>Alterações salvas com sucesso!</Text>
                    </View>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.content}>
                {/* Foto de Perfil */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={() => setShowPhotoOptions(true)} style={styles.photoContainer}>
                        {profilePhoto ? (
                            <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Ionicons name="person" size={40} color={Colors.textLight} />
                                <Text style={{ fontSize: 10, color: Colors.textLight, textAlign: 'center' }}>Adicionar Foto</Text>
                            </View>
                        )}
                        {uploadingPhoto ? (
                            <View style={[styles.photoBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                <ActivityIndicator size="small" color={Colors.white} />
                            </View>
                        ) : (
                            <View style={styles.photoBadge}>
                                <Ionicons name="camera" size={16} color={Colors.white} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.photoLabel}>Toque para mudar a sua foto de perfil</Text>
                </View>

                {/* Photo Options Modal */}
                {showPhotoOptions && (
                    <Modal visible={showPhotoOptions} transparent animationType="fade">
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowPhotoOptions(false)}
                        >
                            <View style={styles.photoMenu}>
                                <Text style={styles.photoMenuTitle}>Foto de Perfil</Text>

                                <TouchableOpacity style={styles.photoMenuOption} onPress={() => handlePickImage(true)}>
                                    <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                                    <Text style={styles.photoMenuText}>Tirar Foto</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.photoMenuOption} onPress={() => handlePickImage(false)}>
                                    <Ionicons name="images-outline" size={24} color={Colors.primary} />
                                    <Text style={styles.photoMenuText}>Escolher da Galeria</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.photoMenuOption} onPress={() => {
                                    setShowPhotoOptions(false);
                                    setShowAvatarModal(true);
                                }}>
                                    <Ionicons name="happy-outline" size={24} color={Colors.primary} />
                                    <Text style={styles.photoMenuText}>Escolher Avatar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.photoMenuOption, { borderBottomWidth: 0 }]}
                                    onPress={() => {
                                        setProfilePhoto(null);
                                        setShowPhotoOptions(false);
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={24} color={Colors.error} />
                                    <Text style={[styles.photoMenuText, { color: Colors.error }]}>Remover Foto</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}

                {/* Avatar Selection Modal */}
                {showAvatarModal && (
                    <View style={styles.avatarModalOverlay}>
                        <View style={styles.avatarModal}>
                            <View style={styles.avatarModalHeader}>
                                <Text style={styles.avatarModalTitle}>Escolha o seu Avatar</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setProfilePhoto(null);
                                            setShowAvatarModal(false);
                                        }}
                                        style={{ flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={Colors.error} style={{ marginRight: 4 }} />
                                        <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 13 }}>Remover</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                                        <Ionicons name="close" size={24} color={Colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ScrollView
                                contentContainerStyle={{ paddingBottom: 20 }}
                                style={{ maxHeight: 450 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {AVATAR_STYLES.map((group, gIndex) => (
                                    <View key={gIndex} style={{ marginBottom: 16 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, paddingLeft: 4 }}>{group.label}</Text>
                                        <View style={styles.avatarGrid}>
                                            {AVATARS.filter(a => a.group === group.label).map((avatar, index) => (
                                                <TouchableOpacity
                                                    key={`${gIndex}-${index}`}
                                                    style={[styles.avatarOption, profilePhoto === avatar.url && styles.avatarOptionSelected]}
                                                    onPress={() => selectAvatar(avatar.url)}
                                                >
                                                    <Image source={{ uri: avatar.url }} style={styles.avatarGridImage} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

                {hasHiddenFields && (
                    <TouchableOpacity style={styles.showAllBanner} onPress={() => setShowAllFields(true)}>
                        <Text style={styles.showAllText}>Alguns campos já preenchidos estão ocultos.</Text>
                        <Text style={styles.showAllTextBold}>Toque aqui para ver/editar todos os campos.</Text>
                    </TouchableOpacity>
                )}

                {(!initialForm?.phone || String(initialForm.phone).trim() === '') && (
                    <View style={styles.missingPhoneBanner}>
                        <Ionicons name="information-circle" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.missingPhoneText}>
                            Por favor, complete o seu perfil para que seja mais fácil conectar-se com outros usuários.
                        </Text>
                    </View>
                )}

                {shouldShow('name') && (
                    <View style={styles.inputGroup}>
                        <Input
                            label="Nome"
                            inputStyle={[isLocked('name') && styles.inputDisabled]}
                            value={form.name}
                            onChangeText={(v) => update('name', v)}
                            editable={!isLocked('name')}
                            placeholder="Insira seu nome completo"
                        />
                        <Text style={styles.helperText}>O nome tem que ser exatamente o mesmo do documento para verificação.</Text>
                    </View>
                )}

                {shouldShow('phone') && (
                    <View style={styles.inputGroup}>
                        <Input
                            label="Telefone"
                            inputStyle={[isLocked('phone') && styles.inputDisabled]}
                            value={form.phone}
                            onChangeText={(v) => update('phone', v)}
                            editable={!isLocked('phone')}
                            keyboardType="phone-pad"
                            placeholder="Ex: 840000000"
                        />
                    </View>
                )}

                {/* Document Field Removed */}

                {/* Common Location Fields */}
                {shouldShow('province') && (
                    <View style={styles.inputGroup}>
                        <Input
                            label="Província"
                            inputStyle={[isLocked('province') && styles.inputDisabled]}
                            value={form.province}
                            onChangeText={(v) => update('province', v)}
                            editable={!isLocked('province')}
                            placeholder="Sua província"
                        />
                    </View>
                )}

                {shouldShow('city') && (
                    <View style={styles.inputGroup}>
                        <Input
                            label="Cidade"
                            inputStyle={[isLocked('city') && styles.inputDisabled]}
                            value={form.city}
                            onChangeText={(v) => update('city', v)}
                            editable={!isLocked('city')}
                            placeholder="Sua cidade"
                        />
                    </View>
                )}

                {shouldShow('bairro') && (
                    <View style={styles.inputGroup}>
                        <Input
                            label="Bairro"
                            inputStyle={[isLocked('bairro') && styles.inputDisabled]}
                            value={form.bairro}
                            onChangeText={(v) => update('bairro', v)}
                            editable={!isLocked('bairro')}
                            placeholder="Seu bairro"
                        />
                    </View>
                )}

                {/* Worker Specific Fields */}
                {user?.role === 'WORKER' && (
                    <>
                        {shouldShow('professionCategory') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Área de Atuação (Categoria Principal)</Text>
                                <View style={styles.chips}>
                                    {categories.map((catObj) => (
                                        <TouchableOpacity
                                            key={catObj.name}
                                            style={[styles.chip, form.professionCategory === catObj.name && styles.chipActive]}
                                            onPress={() => update('professionCategory', catObj.name)}
                                        >
                                            <Text style={[styles.chipText, form.professionCategory === catObj.name && styles.chipTextActive]}>{catObj.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {form.professionCategory === 'Outro' && (
                                    <Input
                                        inputStyle={[{ marginTop: 12 }]}
                                        placeholder="Ex: Operador de Máquinas"
                                        value={form.customCategory}
                                        onChangeText={(v) => update('customCategory', v)}
                                    />
                                )}
                            </View>
                        )}

                        {shouldShow('workTypes') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Especialidades</Text>
                                <View style={styles.chips}>
                                    {form.professionCategory && getSpecialtiesByCategoryName(form.professionCategory).length > 0 ? (
                                        Array.from(new Set([...getSpecialtiesByCategoryName(form.professionCategory).map(s => s.name), ...(form.workTypes || []).filter(w => w !== 'Outro')])).filter(t => t !== 'Outro').map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[styles.chip, (form.workTypes || []).includes(type) && styles.chipActive]}
                                                onPress={() => toggleWorkType(type)}
                                            >
                                                <Text style={[styles.chipText, (form.workTypes || []).includes(type) && styles.chipTextActive]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : form.professionCategory === 'Outro' ? (
                                        <Text style={styles.helperText}>Como escolheu "Outro" na categoria, digite a sua especialidade abaixo.</Text>
                                    ) : (
                                        <Text style={styles.helperText}>Selecione uma categoria principal acima para ver as especialidades disponíveis.</Text>
                                    )}
                                </View>
                                {(form.workTypes || []).includes('Outro') && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={[styles.label, { fontSize: 12 }]}>Digite a especialidade e use # para adicionar:</Text>
                                        <Input
                                            placeholder="Ex: Operador de Guindaste#"
                                            value={form.customWT}
                                            onChangeText={handleCustomWTInput}
                                            onSubmitEditing={() => handleCustomWTInput(form.customWT + '#')}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Modalidade de Atendimento</Text>
                            <View style={styles.chips}>
                                {[
                                    { id: 'PRESENCIAL', label: '🏢 Presencial' },
                                    { id: 'REMOTE', label: '💻 Remoto' },
                                    { id: 'HYBRID', label: '🔄 Híbrido' }
                                ].map((opt) => {
                                    const active = (form.workModalities || []).includes(opt.id);
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[styles.chip, active && styles.chipActive]}
                                            onPress={() => toggleModality(opt.id)}
                                        >
                                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipos de Serviço / Contratação Aceites</Text>
                            <View style={styles.chips}>
                                {[
                                    { id: 'SINGLE_TASK', label: '⚡ Serviço Único / Tarefa' },
                                    { id: 'PROJECT', label: '📁 Por Projeto' },
                                    { id: 'RECURRING', label: '🔄 Recorrente' },
                                    { id: 'CONTINUOUS', label: '📜 Contrato Contínuo' }
                                ].map((opt) => {
                                    const active = (form.serviceTypes || []).includes(opt.id);
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[styles.chip, active && styles.chipActive]}
                                            onPress={() => toggleServiceType(opt.id)}
                                        >
                                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {shouldShow('availability') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Disponibilidade</Text>
                                <View style={styles.chips}>
                                    {[
                                        { id: 'IMMEDIATE', label: '⚡ Imediata' },
                                        { id: 'SCHEDULED', label: '📅 Agendada / Programada' },
                                        { id: 'FLEXIBLE', label: '🕒 Horário Flexível' }
                                    ].map((opt) => (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[styles.chip, form.availability === opt.id && styles.chipActive]}
                                            onPress={() => update('availability', opt.id)}
                                        >
                                            <Text style={[styles.chipText, form.availability === opt.id && styles.chipTextActive]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {shouldShow('hasExperience') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Já trabalhou antes?</Text>
                                <View style={styles.optionRow}>
                                    <TouchableOpacity
                                        style={[styles.option, form.hasExperience === true && styles.optionActive]}
                                        onPress={() => update('hasExperience', true)}
                                    >
                                        <Text style={[styles.optionText, form.hasExperience === true && styles.optionTextActive]}>Sim</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.option, form.hasExperience === false && styles.optionActive]}
                                        onPress={() => update('hasExperience', false)}
                                    >
                                        <Text style={[styles.optionText, form.hasExperience === false && styles.optionTextActive]}>Não</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {shouldShow('description') && (
                            <View style={styles.inputGroup}>
                                <Input
                                    label="Descrição pessoal"
                                    inputStyle={[styles.textArea]}
                                    value={form.description}
                                    onChangeText={(v) => update('description', v)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholder="Fale sobre si, sua experiência..."
                                />
                            </View>
                        )}
                    </>
                )}

                {/* Employer Specific Fields */}
                {user?.role === 'EMPLOYER' && (
                    <>
                        {shouldShow('interests') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Em que modalidade de trabalho você se interessa?</Text>
                                <View style={styles.chips}>
                                    {['Remoto', 'Presencial', 'Híbrido'].map((modality) => {
                                        const isSelected = employerInterests.modalities.includes(modality);
                                        return (
                                            <TouchableOpacity
                                                key={modality}
                                                style={[styles.chip, isSelected && styles.chipActive]}
                                                onPress={() => {
                                                    setEmployerInterests(prev => ({
                                                        ...prev,
                                                        modalities: isSelected
                                                            ? prev.modalities.filter(m => m !== modality)
                                                            : [...prev.modalities, modality]
                                                    }));
                                                }}
                                            >
                                                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{modality}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {employerInterests.modalities.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { marginTop: 16 }]}>Quais áreas de trabalho?</Text>
                                        <View style={styles.chips}>
                                            {getAvailableCategories(employerInterests.modalities).map(cName => {
                                                const isSelected = employerInterests.categories.includes(cName);
                                                return (
                                                    <TouchableOpacity
                                                        key={cName}
                                                        style={[styles.chip, isSelected && styles.chipActive]}
                                                        onPress={() => {
                                                            setEmployerInterests(prev => ({
                                                                ...prev,
                                                                categories: isSelected
                                                                    ? prev.categories.filter(c => c !== cName)
                                                                    : [...prev.categories, cName]
                                                            }));
                                                        }}
                                                    >
                                                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cName}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </>
                                )}

                                {employerInterests.categories.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { marginTop: 16 }]}>Quais especialidades?</Text>
                                        <View style={styles.chips}>
                                            {employerInterests.categories.flatMap(c => getSpecialtiesByCategoryName(c)).map(s => {
                                                const isSelected = employerInterests.specialties.includes(s.name);
                                                return (
                                                    <TouchableOpacity
                                                        key={s.name}
                                                        style={[styles.chip, isSelected && styles.chipActive]}
                                                        onPress={() => {
                                                            setEmployerInterests(prev => ({
                                                                ...prev,
                                                                specialties: isSelected
                                                                    ? prev.specialties.filter(sp => sp !== s.name)
                                                                    : [...prev.specialties, s.name]
                                                            }));
                                                        }}
                                                    >
                                                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </>
                                )}

                                <Text style={[styles.helperText, { marginTop: 8 }]}>Usado para recomendações de profissionais</Text>
                            </View>
                        )}
                    </>
                )}
            <Button 
                title="Guardar Alterações" 
                onPress={handleSave} 
                loading={loading}
                style={{ marginBottom: Spacing.md }}
            />

            <Button 
                title="Apagar Conta Permanentemente" 
                onPress={() => setShowDeleteModal(true)} 
                variant="danger"
                icon={<Ionicons name="trash-outline" size={20} color={Colors.white} />}
                disabled={loading}
            />

                {/* Modal de Confirmação de Deleção */}
                <Modal visible={showDeleteModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.deleteIconContainer}>
                                <Ionicons name="warning" size={48} color={Colors.error} />
                            </View>
                            <Text style={styles.modalTitle}>Apagar Conta?</Text>
                            <Text style={styles.modalSubtitle}>
                                Esta ação é irreversível. Por segurança, introduza a sua senha para confirmar.
                            </Text>

                            <Input
                                inputStyle={[{ width: '100%', marginBottom: 20 }]}
                                placeholder="Sua senha"
                                secureTextEntry
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                            />

                            <View style={styles.modalActions}>
                                <Button 
                                    title="Manter Conta" 
                                    onPress={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                    }} 
                                    variant="outline"
                                    style={{ flex: 1, marginRight: Spacing.sm }}
                                    disabled={loading}
                                />
                                <Button 
                                    title="Sim, Apagar" 
                                    onPress={handleDeleteAccount} 
                                    variant="danger"
                                    style={{ flex: 1, marginLeft: Spacing.sm }}
                                    loading={loading}
                                    disabled={!deletePassword}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}) },
    photoSection: { alignItems: 'center', marginBottom: Spacing.xl },
    photoContainer: { position: 'relative', width: 100, height: 100 },
    photoImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background },
    photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.borderLight, borderStyle: 'dashed' },
    photoBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
    photoLabel: { fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 8 },
    showAllBanner: { backgroundColor: Colors.primary + '11', padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '33' },
    showAllText: { fontSize: Fonts.sizes.sm, color: Colors.primary, textAlign: 'center', marginBottom: 4 },
    showAllTextBold: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
    inputGroup: { marginBottom: Spacing.md },
    label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: Fonts.sizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight },
    inputDisabled: { backgroundColor: Colors.background, color: Colors.textLight, opacity: 0.6, borderColor: 'transparent' },
    helperText: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },
    textArea: { height: 100, paddingTop: 14 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: Colors.background, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.borderLight },
    chipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
    chipText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    chipTextActive: { color: Colors.primary, fontWeight: '600' },
    optionRow: { flexDirection: 'row', gap: 10 },
    option: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
    optionActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
    optionText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    optionTextActive: { color: Colors.primary, fontWeight: '600' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, marginBottom: Spacing.sm },
    switchLabel: { fontSize: Fonts.sizes.md, color: Colors.text },
    button: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.lg },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '700' },
    buttonDelete: { flexDirection: 'row', backgroundColor: Colors.error + '15', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.error + '30' },
    buttonDeleteText: { color: Colors.error, fontSize: Fonts.sizes.md, fontWeight: '700' },
    successBanner: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        zIndex: 999,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    successText: { color: 'white', fontWeight: 'bold' },
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

    // Modal Styles for Deletion
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
    deleteIconContainer: { marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 20 },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.background },
    cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
    submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: Colors.white, fontWeight: '700' },

    // Photo Menu Styles
    photoMenu: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    photoMenuTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    photoMenuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        gap: 16,
    },
    photoMenuText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    missingPhoneBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryBg,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    missingPhoneText: {
        flex: 1,
        fontSize: 13,
        color: Colors.text,
        lineHeight: 18,
        fontWeight: '500',
    },
    submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: Colors.white, fontWeight: '700' },
});
