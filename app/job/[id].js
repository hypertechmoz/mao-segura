import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '../../utils/useAuthGuard';

export default function JobDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    const loadJob = useCallback(async () => {
        if (!user) return;
        try {
            // Fetch job
            const jobRef = doc(db, 'jobs', id);
            const jobSnap = await getDoc(jobRef);
            if (!jobSnap.exists()) throw new Error('Vaga não encontrada');
            const jobData = { id: jobSnap.id, ...jobSnap.data() };
            
            // fetch Employer
            if (jobData.employer_id) {
                const empRef = doc(db, 'users', jobData.employer_id);
                const empSnap = await getDoc(empRef);
                if (empSnap.exists()) {
                    jobData.employer = { id: empSnap.id, ...empSnap.data() };
                }
            }

            // Check if current worker has applied
            let hasApplied = false;
            if (user.role === 'WORKER') {
                const q = query(collection(db, 'applications'), where('job_id', '==', id), where('worker_id', '==', user.uid));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    hasApplied = true;
                    setHasPendingRequest(true);
                }

                // Also check connection
                const connQ1 = query(collection(db, 'chat_conversations'), where('employer_id', '==', jobData.employer_id), where('worker_id', '==', user.uid));
                const connSnap = await getDocs(connQ1);
                if (!connSnap.empty && connSnap.docs[0].data().is_authorized) setIsConnected(true);
            }

            // Map standard format
            const formattedJob = {
                ...jobData,
                _count: { applications: jobData.applications_count || 0 },
                hasApplied,
            };
            setJob(formattedJob);

            // Fetch applicants if Employer owns the job
            if (user.role === 'EMPLOYER' && jobData.employer_id === user.uid) {
                const q = query(collection(db, 'applications'), where('job_id', '==', id), where('employer_id', '==', user.uid), orderBy('created_at', 'desc'));
                const snap = await getDocs(q);
                const appsData = [];
                for (const d of snap.docs) {
                    const app = { id: d.id, ...d.data() };
                    if (app.worker_id) {
                        const wSnap = await getDoc(doc(db, 'users', app.worker_id));
                        if(wSnap.exists()) app.worker = { id: wSnap.id, ...wSnap.data() };
                    }
                    appsData.push(app);
                }
                setApplicants(appsData);
            }
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadJob();
    }, [loadJob]);

    const handleApply = async () => {
        if (!requireAuth()) return;
        
        if (isConnected) {
            try {
                // Open Chat directly
                const q = query(collection(db, 'chat_conversations'), where('employer_id', '==', job.employer_id), where('worker_id', '==', user.uid));
                const snap = await getDocs(q);

                let conversationId;
                if (!snap.empty) {
                    conversationId = snap.docs[0].id;
                } else {
                    const newRef = await addDoc(collection(db, 'chat_conversations'), {
                        employer_id: job.employer_id,
                        worker_id: user.uid,
                        job_id: id,
                        created_at: serverTimestamp(),
                        updated_at: serverTimestamp(),
                        last_message: 'Candidatura iniciada',
                        is_authorized: true,
                        initiated_by: user.uid
                    });
                    conversationId = newRef.id;
                }
                router.push({ pathname: `/chat/${conversationId}`, params: { name: job.employer?.name } });
            } catch (err) {
                Alert.alert('Erro', err.message);
            }
        } else if (hasPendingRequest) {
            Alert.alert("Aviso", "Já enviou um pedido de candidatura para esta vaga.");
        } else {
            try {
                // Create the application document for employer dashboard compatibility
                await addDoc(collection(db, 'applications'), {
                    job_id: id,
                    worker_id: user.uid,
                    employer_id: job.employer_id,
                    status: 'PENDING',
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                });

                // Send permission to converse request
                import('../../utils/chatSecureHelper').then(async ({ sendConnectionRequest }) => {
                    await sendConnectionRequest(user, job.employer_id, { type: 'APPLY', job_id: job.id });
                    setHasPendingRequest(true);
                    Alert.alert("Sucesso", "Pedido de permissão para se candidatar enviado. Será notificado quando o empregador aceitar para poderem conversar.");
                    loadJob();
                });
            } catch (err) {
                Alert.alert('Erro', err.message);
            }
        }
    };

    const handleChat = async () => {
        if (!requireAuth()) return;
        try {
            // Create or get chat conversation
            const q = query(collection(db, 'chat_conversations'), where('job_id', '==', id), where('worker_id', '==', user.uid));
            const snap = await getDocs(q);

            let conversationId;
            if (!snap.empty) {
                conversationId = snap.docs[0].id;
            } else {
                // Not found, create one
                const newRef = await addDoc(collection(db, 'chat_conversations'), {
                    job_id: id,
                    employer_id: job.employer_id,
                    worker_id: user.uid,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                });
                conversationId = newRef.id;
            }
            router.push({ pathname: `/chat/${conversationId}`, params: { name: job.employer?.name } });
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    const handleApplicationAction = async (appId, status) => {
        try {
            await updateDoc(doc(db, 'applications', appId), { 
                status,
                updated_at: serverTimestamp()
            });
            loadJob();
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!job) {
        return <View style={styles.loading}><Text>Vaga não encontrada</Text></View>;
    }

    const isOwner = user?.uid === job.employer_id;
    const isWorker = user?.role === 'WORKER';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>{job.type}</Text>
                </View>
                <Text style={styles.title}>{job.title}</Text>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.meta}> {job.city}, {job.bairro || job.province}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.meta}>
                        <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
                        {' '}{job.contract_type === 'DAILY' ? 'Diarista' : job.contract_type === 'TEMPORARY' ? 'Temporário' : 'Permanente'}
                        {'  ·  '}
                        <Ionicons name={job.forResidence ? 'home-outline' : 'business-outline'} size={14} color={Colors.textSecondary} />
                        {' '}{job.forResidence ? 'Residência' : 'Mini-empresa'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.description}>{job.description}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Empregador</Text>
                <View style={styles.employerCard}>
                    <View style={styles.empAvatar}>
                        <Text style={styles.empAvatarText}>{job.employer?.name?.[0] || '?'}</Text>
                    </View>
                    <View style={styles.empInfo}>
                        <View style={styles.empNameRow}>
                            <Text style={styles.empName}>{job.employer?.name}</Text>
                            {job.employer?.isVerified && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Ionicons name="checkmark-circle" size={14} color={Colors.primary} /><Text style={styles.verified}>Verificado</Text></View>}
                        </View>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.empLocation}> {job.employer?.city}, {job.employer?.bairro || job.employer?.province}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.stats}>
                <View style={styles.stat}>
                    <Text style={styles.statNumber}>{job._count?.applications || 0}</Text>
                    <Text style={styles.statLabel}>Candidatos</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statNumber}>
                        <Ionicons name={job.status === 'ACTIVE' ? 'ellipse' : 'close-circle'} size={22} color={job.status === 'ACTIVE' ? '#4CAF50' : Colors.error} />
                    </Text>
                    <Text style={styles.statLabel}>{job.status === 'ACTIVE' ? 'Ativa' : 'Encerrada'}</Text>
                </View>
            </View>

            {isWorker && job.status === 'ACTIVE' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.applyButton, (!isConnected && hasPendingRequest) && { backgroundColor: Colors.borderLight }]} 
                        onPress={handleApply} 
                        activeOpacity={0.8}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name={isConnected ? "chatbubble-ellipses" : (hasPendingRequest ? "time" : "document-text")} size={18} color={(!isConnected && hasPendingRequest) ? Colors.textSecondary : Colors.white} />
                            <Text style={[styles.applyButtonText, (!isConnected && hasPendingRequest) && { color: Colors.textSecondary }]}>
                                {isConnected ? 'Enviar Mensagem' : (hasPendingRequest ? 'Pedido Pendente' : 'Pedir para Candidatar-se')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {isOwner && applicants.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Candidatos ({applicants.length})</Text>
                    {applicants.map((app) => (
                        <View key={app.id} style={styles.applicantCard}>
                            <View style={styles.appAvatar}>
                                <Text style={styles.appAvatarText}>{app.worker?.name?.[0]}</Text>
                            </View>
                            <View style={styles.appInfo}>
                                <Text style={styles.appName}>{app.worker?.name}</Text>
                                <Text style={styles.appMeta}><Ionicons name="location-outline" size={12} color={Colors.textSecondary} /> {app.worker?.city}</Text>
                            </View>
                            {app.status === 'PENDING' && (
                                <View style={styles.appActions}>
                                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleApplicationAction(app.id, 'ACCEPTED')}>
                                        <Ionicons name="checkmark" size={18} color={Colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleApplicationAction(app.id, 'REJECTED')}>
                                        <Ionicons name="close" size={18} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {app.status !== 'PENDING' && (
                                <Ionicons 
                                    name={app.status === 'ACCEPTED' ? 'checkmark-circle' : app.status === 'REJECTED' ? 'close-circle' : 'remove-circle'} 
                                    size={22} 
                                    color={app.status === 'ACCEPTED' ? '#4CAF50' : Colors.error} 
                                />
                            )}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: Spacing.xxl, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: Colors.white, padding: Spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    typeTag: { backgroundColor: Colors.primaryBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
    typeTagText: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '600' },
    title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, marginBottom: 8 },
    metaRow: { marginBottom: 4 },
    meta: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    section: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, margin: Spacing.md, marginBottom: 0 },
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: 8 },
    description: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: 24 },
    employerCard: { flexDirection: 'row', alignItems: 'center' },
    empAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    empAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
    empInfo: { flex: 1 },
    empNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    empName: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
    verified: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600' },
    empLocation: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    stats: { flexDirection: 'row', gap: 12, margin: Spacing.md },
    stat: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
    statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
    actions: { padding: Spacing.md, gap: 10 },
    applyButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    applyButtonText: { color: Colors.white, fontSize: Fonts.sizes.lg, fontWeight: '700' },
    chatButton: { backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: Colors.primary },
    chatButtonText: { color: Colors.primary, fontSize: Fonts.sizes.md, fontWeight: '600' },
    appliedBanner: { backgroundColor: Colors.primaryBg, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    appliedText: { fontSize: Fonts.sizes.md, color: Colors.primary, fontWeight: '600' },
    applicantCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    appAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    appAvatarText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
    appInfo: { flex: 1 },
    appName: { fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text },
    appMeta: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
    appActions: { flexDirection: 'row', gap: 8 },
    acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
    acceptBtnText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
    rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.error + '12', justifyContent: 'center', alignItems: 'center' },
    rejectBtnText: { color: Colors.error, fontSize: 18, fontWeight: '700' },
    appStatus: { fontSize: 18 },
});
