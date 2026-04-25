import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { Colors, Spacing, Fonts, JOB_TYPES, COMMON_SKILLS, PROFESSION_CATEGORIES, JOBS_CATEGORIES_MAP } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfile() {
    const router = useRouter();
    const { user, refreshUser, deleteAccount } = useAuthStore();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    
    const AVATAR_STYLES = [
        { label: 'Pessoas', style: 'lorelei', seeds: [
            'Maria', 'Jose', 'Elena', 'Carlos', 'Amina', 'David', 'Sofia', 'Lucas',
            'Zoe', 'Toby', 'Lilly', 'Jack', 'Mia', 'Noah', 'Ava', 'Leo',
            'Ines', 'Hugo', 'Bia', 'Rui', 'Clara', 'Nuno', 'Rosa', 'Vitor'
        ]},
        { label: 'Artísticos', style: 'avataaars', seeds: [
            'Ana', 'Pedro', 'Luz', 'Tomas', 'Fatima', 'Jorge', 'Mariana', 'Rafael',
            'Celeste', 'Dinis', 'Laura', 'Mateus'
        ]},
        { label: 'Divertidos', style: 'bottts', seeds: [
            'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
            'Iota', 'Kappa', 'Lambda', 'Omega'
        ]},
    ];

    const AVATARS = AVATAR_STYLES.flatMap(group =>
        group.seeds.map(seed => ({
            url: `https://api.dicebear.com/7.x/${group.style}/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
            group: group.label,
        }))
    );
    const [loading, setLoading] = useState(false);
    const [initialForm, setInitialForm] = useState(null);
    const [showAllFields, setShowAllFields] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    
    const [form, setForm] = useState({
        name: '', document: '', province: '', city: '', bairro: '', addressDetails: '', companyName: '',
        professionCategory: '', customCategory: '',
        workTypes: [], customWT: '', skills: [], tempSkill: '', availability: '', canSleepOnSite: false,
        hasExperience: false, description: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const userSnap = await getDoc(doc(db, 'users', user.uid));
                const userData = userSnap.exists() ? userSnap.data() : null;

                const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                const profileSnap = await getDoc(doc(db, profileTable, user.uid));
                const profileData = profileSnap.exists() ? profileSnap.data() : null;

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

                    setProfilePhoto(profileData?.profile_photo || userData?.profile_photo || null);

                    const loadedForm = {
                        name: userData.name || '',
                        document: userData.document || '',
                        province: userData.province || '',
                        city: userData.city || '',
                        bairro: userData.bairro || '',
                        professionCategory: isCustomCat ? 'Outro' : loadedCat,
                        customCategory: isCustomCat ? loadedCat : '',
                        workTypes: wts,
                        customWT: customWT || '',
                        skills: profileData?.skills || [],
                        tempSkill: '',
                        availability: profileData?.availability || '',
                        canSleepOnSite: profileData?.can_sleep_onsite || false,
                        hasExperience: profileData?.has_experience || false,
                        description: profileData?.description || '',
                        companyName: profileData?.company_name || '',
                        addressDetails: profileData?.address_details || ''
                    };
                    setForm(loadedForm);
                    setInitialForm(loadedForm);
                }
            } catch (err) {
                console.error('Load profile error:', err);
            }
        };
        loadData();
    }, [user]);

    const update = (field, value) => setForm({ ...form, [field]: value });

    const pickProfilePhoto = () => {
        setShowAvatarModal(true);
    };

    const selectAvatar = (avatarUrl) => {
        setProfilePhoto(avatarUrl);
        setShowAvatarModal(false);
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
        if (!user) return;
        setLoading(true);
        try {
            // 1. Update User info
            const userUpdate = {
                province: form.province,
                city: form.city,
                bairro: form.bairro,
                profile_photo: profilePhoto // Save the selected avatar
            };
            
            // Only update name if it wasn't set initially (implements immutability)
            if (!initialForm?.name) userUpdate.name = form.name;

            await updateDoc(doc(db, 'users', user.uid), userUpdate);

            // 2. Update Role-specific profile
            let finalCategory = form.professionCategory === 'Outro' && form.customCategory.trim() 
                ? form.customCategory.trim() 
                : form.professionCategory;

            // Filter out 'Outro' and include any pending manual input
            let finalWT = form.workTypes.filter(t => t !== 'Outro' && !!t);
            if (form.workTypes.includes('Outro') && form.customWT.trim()) {
                finalWT.push(form.customWT.trim());
            }
            
            let finalSkills = form.skills.filter(s => s !== 'Outro' && !!s);
            if (form.skills.includes('Outro') && form.tempSkill.trim()) {
                finalSkills.push(form.tempSkill.trim());
            }

            const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
            const profilePayload = user.role === 'WORKER' ? {
                user_id: user.uid,
                profession_category: finalCategory,
                work_types: Array.from(new Set(finalWT)),
                skills: Array.from(new Set(finalSkills)),
                availability: form.availability || null,
                can_sleep_onsite: form.canSleepOnSite,
                has_experience: form.hasExperience,
                description: form.description
            } : {
                user_id: user.uid,
                description: form.description,
                company_name: form.companyName,
                address_details: form.addressDetails
            };

            await setDoc(doc(db, profileTable, user.uid), profilePayload, { merge: true });

            const { refreshUser } = useAuthStore.getState();
            await refreshUser();
            
            setSaveSuccess(true);
            useAlertStore.getState().showAlert('Sucesso', 'O seu perfil foi atualizado.', 'success');
            setTimeout(() => {
                setSaveSuccess(false);
                router.replace('/(tabs)/profile');
            }, 2500);
            
        } catch (err) {
            useAlertStore.getState().showAlert('Erro', err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await deleteAccount();
            setShowDeleteModal(false);
            
            useAlertStore.getState().showAlert('Sucesso', 'A sua conta foi apagada permanentemente.', 'success');
            
            if (Platform.OS === 'web') {
                window.location.href = '/auth/choose-type';
            } else {
                router.replace('/auth/choose-type');
            }
        } catch (err) {
            console.error('Delete error:', err);
            useAlertStore.getState().showAlert('Erro', 'Por questões de segurança, pode ser necessário voltar a fazer login antes de apagar a conta.', 'error');
            setLoading(false);
        }
    };

    const isLocked = (field) => {
        if (!initialForm) return false;
        const permanentFields = ['name', 'province', 'city', 'bairro'];
        if (permanentFields.includes(field)) {
            const val = initialForm[field];
            if (val && val.toString().trim() !== '') return true;
        }
        return false;
    };

    const shouldShow = (field) => {
        if (showAllFields) return true;
        if (!initialForm) return true;
        if (field === 'name' || field === 'document') return true; // Always show basic fields 
        
        // Array or string checks
        const initialVal = initialForm[field];
        if (Array.isArray(initialVal)) {
            return initialVal.length === 0;
        }
        return !initialVal; // show if falsy (empty or not set)
    };

    // Helpet to see if any non-essential field is hidden because it was already filled
    const hasHiddenFields = initialForm && !showAllFields && Object.keys(initialForm).some(k => {
        if (k === 'name' || k === 'document') return false;
        if (Array.isArray(initialForm[k])) return initialForm[k].length > 0;
        return !!initialForm[k];
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
                    <TouchableOpacity onPress={pickProfilePhoto} style={styles.photoContainer}>
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

            {/* Document Field Removed */}

            {/* Common Location Fields */}
            {shouldShow('province') && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Província</Text>
                    <TextInput style={styles.input} value={form.province} onChangeText={(v) => update('province', v)} placeholder="Sua província" placeholderTextColor={Colors.textLight} />
                </View>
            )}

            {shouldShow('city') && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput style={styles.input} value={form.city} onChangeText={(v) => update('city', v)} placeholder="Sua cidade" placeholderTextColor={Colors.textLight} />
                </View>
            )}

            {shouldShow('bairro') && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bairro</Text>
                    <TextInput style={styles.input} value={form.bairro} onChangeText={(v) => update('bairro', v)} placeholder="Seu bairro" placeholderTextColor={Colors.textLight} />
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
                            <View style={styles.optionRow}>
                                {['DAILY', 'PERMANENT'].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[styles.option, form.availability === val && styles.optionActive]}
                                        onPress={() => update('availability', val)}
                                    >
                                        <Text style={[styles.optionText, form.availability === val && styles.optionTextActive]}>
                                            {val === 'DAILY' ? 'Diarista' : 'Permanente'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {shouldShow('canSleepOnSite') && (
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Pode dormir no local</Text>
                            <Switch value={form.canSleepOnSite} onValueChange={(v) => update('canSleepOnSite', v)} trackColor={{ true: Colors.primary }} />
                        </View>
                    )}

                    {shouldShow('hasExperience') && (
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Já trabalhou antes</Text>
                            <Switch value={form.hasExperience} onValueChange={(v) => update('hasExperience', v)} trackColor={{ true: Colors.primary }} />
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
                            Esta ação é irreversível. Todos os seus dados, perfil e mensagens serão removidos permanentemente.
                        </Text>
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.cancelBtn} 
                                onPress={() => setShowDeleteModal(false)}
                                disabled={loading}
                            >
                                <Text style={styles.cancelBtnText}>Manter Conta</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.submitBtn, { backgroundColor: Colors.error }]} 
                                onPress={handleDeleteAccount}
                                disabled={loading}
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
});
