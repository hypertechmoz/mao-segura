import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform, Image, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { Colors, Spacing, Fonts, JOB_TYPES, COMMON_SKILLS, PROFESSION_CATEGORIES, JOBS_CATEGORIES_MAP } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import { handleError } from '../../utils/errorHandler';

export default function EditProfile() {
    const router = useRouter();
    const { user, refreshUser, deleteAccount } = useAuthStore();
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
        name: '', document: '', province: '', city: '', bairro: '', addressDetails: '', companyName: '',
        professionCategory: '', customCategory: '',
        workTypes: [], customWT: '', skills: [], tempSkill: '', availability: '',
        canSleepOnSite: null, hasExperience: null, description: '',
    });

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
                        // User record in public.users doesn't exist yet (likely a new user)
                        // Let's pull everything from metadata so they don't have to type again!
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
                            availability: '',
                            description: ''
                        };
                        setForm(prev => ({ ...prev, ...initialData }));
                        setInitialForm({}); // Still empty to allow the first save
                        setLoading(false);
                        return;
                    }

                    // 2. Get profile data based on role
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
                        const isCustomCat = loadedCat && !PROFESSION_CATEGORIES.includes(loadedCat);

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
                            availability: profileData?.availability || '',
                            canSleepOnSite: profileData?.can_sleep_on_site ?? null,
                            hasExperience: profileData?.has_experience ?? null,
                            description: profileData?.description || '',
                            companyName: profileData?.company_name || '',
                            addressDetails: profileData?.address_details || ''
                        };
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
        const wt = form.workTypes.includes(type)
            ? form.workTypes.filter((t) => t !== type)
            : [...form.workTypes, type];
        update('workTypes', wt);
    };

    const toggleSkill = (skill) => {
        if (form.skills.includes(skill)) {
            update('skills', form.skills.filter((s) => s !== skill));
        } else {
            if (form.skills.length >= 5) {
                useAlertStore.getState().showAlert('Aviso', 'Pode adicionar no máximo 5 habilidades.', 'error');
                return;
            }
            update('skills', [...form.skills, skill]);
        }
    };

    const handleCustomSkillInput = (val) => {
        if (val.includes('#')) {
            const parts = val.split('#');
            const newSkill = parts[0].trim();
            if (newSkill) {
                if (form.skills.length >= 5) {
                    useAlertStore.getState().showAlert('Aviso', 'Pode adicionar no máximo 5 habilidades.', 'error');
                    update('tempSkill', '');
                    return;
                }
                if (!form.skills.includes(newSkill)) {
                    setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill], tempSkill: '' }));
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
                if (!form.workTypes.includes(newWT)) {
                    setForm(prev => ({ ...prev, workTypes: [...prev.workTypes, newWT], customWT: '' }));
                    return;
                }
            }
            update('customWT', '');
        } else {
            update('customWT', val);
        }
    };

    const handleSave = async () => {
        const uid = user?.uid || user?.id;
        if (!uid) {
            useAlertStore.getState().showAlert('Erro', 'Sessão inválida. Reinicie a app.', 'error');
            return;
        }

        // Fallback para o role (se o authStore ainda não tiver carregado corretamente)
        const currentRole = user?.role || initialForm?.role || form.role || 'WORKER';

        setLoading(true);
        console.log('[handleSave] Iniciando...', { uid, currentRole });

        try {
            // 1. Update User info
            const userUpdate = {
                profile_photo: profilePhoto
            };

            // Só atualiza os campos de localização/nome se eles vierem vazios (o que não deve acontecer se estiverem bloqueados)
            if (!initialForm?.name && form.name) userUpdate.name = form.name;
            if (!initialForm?.phone && form.phone) userUpdate.phone = form.phone;
            if (!initialForm?.province && form.province) userUpdate.province = form.province;
            if (!initialForm?.city && form.city) userUpdate.city = form.city;
            if (!initialForm?.bairro && form.bairro) userUpdate.bairro = form.bairro;

            console.log('[handleSave] Atualizando public.users:', userUpdate);
            const { error: userError } = await supabase.from('users').update(userUpdate).eq('id', uid);

            if (userError) throw userError;

            // 2. Update Role-specific profile
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
                    availability: form.availability || null,
                    can_sleep_on_site: form.canSleepOnSite,
                    has_experience: form.hasExperience,
                    description: form.description || null
                };
            } else {
                profilePayload = {
                    user_id: uid,
                    description: form.description || null,
                    company_name: form.companyName || null,
                    address_details: form.addressDetails || null
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

    // Bloqueia sempre os campos imutáveis, mesmo se estiverem vazios. O preenchimento deve ser no registo.
    const isLocked = (field) => {
        const permanentFields = ['name', 'phone', 'province', 'city', 'bairro'];
        return permanentFields.includes(field);
    };

    // Só mostra o campo se estiver preenchido no initialForm ou se showAllFields for true.
    const shouldShow = (field) => {
        if (showAllFields) return true;
        if (loading && !initialForm) return false;

        const autoHideFields = ['name', 'phone', 'province', 'city', 'bairro'];

        if (autoHideFields.includes(field)) {
            const initialVal = initialForm ? initialForm[field] : null;
            const isFilled = initialVal && String(initialVal).trim() !== '';
            // Se já tem um valor inicial preenchido, oculta-o na vista simplificada
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

                {shouldShow('name') && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome</Text>
                        <TextInput
                            style={[styles.input, isLocked('name') && styles.inputDisabled]}
                            value={form.name}
                            onChangeText={(v) => update('name', v)}
                            editable={!isLocked('name')}
                            placeholder="Insira seu nome completo"
                            placeholderTextColor={Colors.textLight}
                        />
                        <Text style={styles.helperText}>O nome tem que ser exatamente o mesmo do documento para verificação.</Text>
                    </View>
                )}

                {shouldShow('phone') && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                            style={[styles.input, isLocked('phone') && styles.inputDisabled]}
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
                        <Text style={styles.label}>Província</Text>
                        <TextInput
                            style={[styles.input, isLocked('province') && styles.inputDisabled]}
                            value={form.province}
                            onChangeText={(v) => update('province', v)}
                            editable={!isLocked('province')}
                            placeholder="Sua província"
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>
                )}

                {shouldShow('city') && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cidade</Text>
                        <TextInput
                            style={[styles.input, isLocked('city') && styles.inputDisabled]}
                            value={form.city}
                            onChangeText={(v) => update('city', v)}
                            editable={!isLocked('city')}
                            placeholder="Sua cidade"
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>
                )}

                {shouldShow('bairro') && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bairro</Text>
                        <TextInput
                            style={[styles.input, isLocked('bairro') && styles.inputDisabled]}
                            value={form.bairro}
                            onChangeText={(v) => update('bairro', v)}
                            editable={!isLocked('bairro')}
                            placeholder="Seu bairro"
                            placeholderTextColor={Colors.textLight}
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
                                    {PROFESSION_CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.chip, form.professionCategory === cat && styles.chipActive]}
                                            onPress={() => update('professionCategory', cat)}
                                        >
                                            <Text style={[styles.chipText, form.professionCategory === cat && styles.chipTextActive]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {form.professionCategory === 'Outro' && (
                                    <TextInput
                                        style={[styles.input, { marginTop: 12 }]}
                                        placeholder="Ex: Operador de Máquinas"
                                        placeholderTextColor={Colors.textLight}
                                        value={form.customCategory}
                                        onChangeText={(v) => update('customCategory', v)}
                                    />
                                )}
                            </View>
                        )}

                        {shouldShow('workTypes') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tipos de trabalho / Especialização</Text>
                                <View style={styles.chips}>
                                    {form.professionCategory && JOBS_CATEGORIES_MAP[form.professionCategory] ? (
                                        Array.from(new Set([...JOBS_CATEGORIES_MAP[form.professionCategory], ...form.workTypes.filter(w => w !== 'Outro')])).filter(t => t !== 'Outro').map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[styles.chip, form.workTypes.includes(type) && styles.chipActive]}
                                                onPress={() => toggleWorkType(type)}
                                            >
                                                <Text style={[styles.chipText, form.workTypes.includes(type) && styles.chipTextActive]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : form.professionCategory === 'Outro' ? (
                                        <Text style={styles.helperText}>Como escolheu "Outro" na categoria, digite o seu tipo de trabalho abaixo.</Text>
                                    ) : (
                                        <Text style={styles.helperText}>Selecione uma categoria principal acima para ver as especializações disponíveis.</Text>
                                    )}
                                </View>
                                {form.workTypes.includes('Outro') && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={[styles.label, { fontSize: 12 }]}>Digite a profissão e use # para adicionar:</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: Operador de Guindaste#"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.customWT}
                                            onChangeText={handleCustomWTInput}
                                            onSubmitEditing={() => handleCustomWTInput(form.customWT + '#')}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        {shouldShow('skills') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Especialidades / Habilidades (Máx. 5)</Text>

                                {/* Selected Skills Chips */}
                                <View style={[styles.chips, { marginBottom: 12 }]}>
                                    {form.skills.filter(s => s !== 'Outro').map((skill) => (
                                        <TouchableOpacity
                                            key={skill}
                                            style={[styles.chip, styles.chipActive]}
                                            onPress={() => toggleSkill(skill)}
                                        >
                                            <Text style={[styles.chipText, styles.chipTextActive]}>{skill}  <Ionicons name="close" size={12} color={Colors.primary} /></Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { fontSize: 12, color: Colors.textSecondary }]}>Sugestões:</Text>
                                <View style={styles.chips}>
                                    {COMMON_SKILLS.map((skill) => (
                                        <TouchableOpacity
                                            key={skill}
                                            style={[styles.chip, form.skills.includes(skill) && styles.chipActive]}
                                            onPress={() => toggleSkill(skill)}
                                        >
                                            <Text style={[styles.chipText, form.skills.includes(skill) && styles.chipTextActive]}>{skill}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {form.skills.includes('Outro') && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={[styles.label, { fontSize: 12 }]}>Digite uma habilidade personalizada e use # para adicionar:</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: Pintura Automotiva#"
                                            placeholderTextColor={Colors.textLight}
                                            value={form.tempSkill}
                                            onChangeText={handleCustomSkillInput}
                                            onSubmitEditing={() => handleCustomSkillInput(form.tempSkill + '#')}
                                        />
                                    </View>
                                )}
                                <Text style={styles.helperText}>Dica: Ao selecionar "Outro", você pode digitar habilidades novas manualmente usando o símbolo #.</Text>
                            </View>
                        )}

                        {shouldShow('availability') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Disponibilidade</Text>
                                <View style={styles.chips}>
                                    {[
                                        { id: 'IMMEDIATE', label: 'Imediata' },
                                        { id: 'TEMPORARY', label: 'Temporária' },
                                        { id: 'DAILY', label: 'Diarista' },
                                        { id: 'PERMANENT', label: 'Permanente' }
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

                        {shouldShow('canSleepOnSite') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Pode dormir no local?</Text>
                                <View style={styles.optionRow}>
                                    <TouchableOpacity
                                        style={[styles.option, form.canSleepOnSite === true && styles.optionActive]}
                                        onPress={() => update('canSleepOnSite', true)}
                                    >
                                        <Text style={[styles.optionText, form.canSleepOnSite === true && styles.optionTextActive]}>Sim</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.option, form.canSleepOnSite === false && styles.optionActive]}
                                        onPress={() => update('canSleepOnSite', false)}
                                    >
                                        <Text style={[styles.optionText, form.canSleepOnSite === false && styles.optionTextActive]}>Não</Text>
                                    </TouchableOpacity>
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
                                <Text style={styles.label}>Descrição pessoal</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={form.description}
                                    onChangeText={(v) => update('description', v)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholder="Fale sobre si, sua experiência..."
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                        )}
                    </>
                )}

                {/* Employer Specific Fields */}
                {user?.role === 'EMPLOYER' && (
                    <>
                        {shouldShow('companyName') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome da Empresa (Opcional se for individual)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.companyName}
                                    onChangeText={(v) => update('companyName', v)}
                                    placeholder="Ex: Serviços de Limpeza Lda."
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                        )}

                        {shouldShow('addressDetails') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Detalhes do Endereço / Ponto de Referência</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={form.addressDetails}
                                    onChangeText={(v) => update('addressDetails', v)}
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                    placeholder="Rua, número, vizinhança ou ponto de referência importante perto de si..."
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                        )}

                        {shouldShow('description') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descrição do Perfil / Necessidades</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={form.description}
                                    onChangeText={(v) => update('description', v)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholder="Descreva a sua vivência, rotina ou família..."
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                        )}
                    </>
                )}
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Guardar Alterações</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttonDelete, loading && styles.buttonDisabled]} onPress={() => setShowDeleteModal(true)} disabled={loading}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} style={{ marginRight: 8 }} />
                <Text style={styles.buttonDeleteText}>Apagar Conta Permanentemente</Text>
            </TouchableOpacity>

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

                            <TextInput
                                style={[styles.input, { width: '100%', marginBottom: 20 }]}
                                placeholder="Sua senha"
                                secureTextEntry
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelBtnText}>Manter Conta</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: Colors.error }]}
                                    onPress={handleDeleteAccount}
                                    disabled={loading || !deletePassword}
                                >
                                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>Sim, Apagar</Text>}
                                </TouchableOpacity>
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
    submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: Colors.white, fontWeight: '700' },
});
