import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuthGuard } from '../../utils/useAuthGuard';
import { startOrGetConversation } from '../../utils/chatHelper';

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
    const [applicationStatus, setApplicationStatus] = useState(null);

    const loadJob = useCallback(async () => {
        if (!id) return;
        const uid = user?.uid || user?.id;
        setLoading(true);
        try {
            // Fetch job
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*, employer:employer_id(*)')
                .eq('id', id)
                .single();
            
            if (jobError || !jobData) {
                setJob(null);
                setLoading(false);
                return;
            }

            // Sync application count (Employer only)
            if (uid === jobData.employer_id) {
                const { count } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('job_id', id);
                
                if (count !== jobData.applications_count) {
                    await supabase.from('jobs').update({ applications_count: count }).eq('id', id);
                    jobData.applications_count = count;
                }
            }

            // Check if current worker has applied
            let hasApplied = false;
            if (user?.role === 'WORKER') {
                const { data: appData } = await supabase
                    .from('applications')
                    .select('id, status')
                    .eq('job_id', id)
                    .eq('worker_id', uid)
                    .maybeSingle();
                
                if (appData) {
                    hasApplied = true;
                    setApplicationStatus(appData.status);
                    setHasPendingRequest(true);
                }

                // Check connection
                const { data: convData } = await supabase
                    .from('chat_conversations')
                    .select('is_authorized')
                    .eq('employer_id', jobData.employer_id)
                    .eq('worker_id', uid)
                    .maybeSingle();
                
                if (convData?.is_authorized) setIsConnected(true);
            }

            // Fetch applicants if Employer owns the job
            if (user?.role === 'EMPLOYER' && jobData.employer_id === uid) {
                const { data: apps } = await supabase
                    .from('applications')
                    .select('*, worker:worker_id(*)')
                    .eq('job_id', id)
                    .order('created_at', { ascending: false });
                setApplicants(apps || []);
            }

            setJob({
                ...jobData,
                _count: { applications: jobData.applications_count || 0 },
                hasApplied,
            });
        } catch (err) {
            console.error('Load job error:', err);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadJob();
    }, [loadJob]);

    const handleApply = async () => {
        if (!requireAuth()) return;
        const uid = user?.uid || user?.id;
        
        if (isConnected) {
            try {
                const { data: existing } = await supabase
                    .from('chat_conversations')
                    .select('id')
                    .eq('employer_id', job.employer_id)
                    .eq('worker_id', uid)
                    .maybeSingle();

                let conversationId;
                if (existing) {
                    conversationId = existing.id;
                } else {
                    const { data: newConv, error } = await supabase
                        .from('chat_conversations')
                        .insert({
                            employer_id: job.employer_id,
                            worker_id: uid,
                            job_id: id,
                            last_message: 'Candidatura iniciada',
                            is_authorized: true,
                            initiated_by: uid,
                            participants: [uid, job.employer_id]
                        })
                        .select()
                        .single();
                    if (error) throw error;
                    conversationId = newConv.id;
                }
                router.push({ pathname: `/chat/${conversationId}`, params: { name: job.employer?.name } });
            } catch (err) {
                Alert.alert('Erro', err.message);
            }
        } else if (hasPendingRequest) {
            Alert.alert("Aviso", "Já enviou um pedido de candidatura para esta vaga.");
        } else {
            try {
                await supabase.from('applications').insert({
                    job_id: id,
                    worker_id: uid,
                    employer_id: job.employer_id,
                    status: 'PENDING'
                });

                // Update count via RPC or manual increment (manual for simplicity here)
                await supabase.rpc('increment_applications_count', { row_id: id });

                const { sendConnectionRequest } = await import('../../utils/chatSecureHelper');
                await sendConnectionRequest(user, job.employer_id, { type: 'APPLY', job_id: job.id });
                
                const { error: notifErr } = await supabase.from('notifications').insert({
                    user_id: job.employer_id,
                    sender_id: uid,
                    title: 'Nova Candidatura',
                    content: `${user.name} candidatou-se a "${job.title}".`,
                    type: 'NEW_APPLICATION',
                    is_read: false,
                    route: `/job/${id}`
                }).select();

                if (notifErr) {
                    console.log('Erro ao gravar notificação (Possível bloqueio RLS ou Trigger):', notifErr);
                    // Não vamos parar o fluxo principal, mas avisamos o dev
                }

                setHasPendingRequest(true);
                Alert.alert("Sucesso", "Pedido de permissão para se candidatar enviado. Será notificado quando o cliente aceitar para poderem conversar.");
                loadJob();
            } catch (err) {
                Alert.alert('Erro', err.message);
            }
        }
    };

    const handleChat = async () => {
        if (!requireAuth()) return;
        try {
            const conversationId = await startOrGetConversation(user, job.employer_id, {
                job_id: id,
                last_message: `Olá, tenho interesse na sua vaga de "${job.title}"`
            });
            router.push({ pathname: `/chat/${conversationId}`, params: { name: job.employer?.name } });
        } catch (err) {
            Alert.alert('Erro', err.message);
        }
    };

    const handleApplicationAction = async (app, status) => {
        const uid = user?.uid || user?.id;
        try {
            await supabase.from('applications').update({ 
                status,
                updated_at: new Date().toISOString()
            }).eq('id', app.id);

            if (status === 'ACCEPTED') {
                try {
                    const { acceptConnectionRequest } = await import('../../utils/chatSecureHelper');
                    const { data: existingReq } = await supabase
                        .from('connection_requests')
                        .select('id')
                        .eq('sender_id', app.worker_id)
                        .eq('receiver_id', uid)
                        .eq('status', 'PENDING')
                        .maybeSingle();
                    
                    if (existingReq) {
                        await acceptConnectionRequest(existingReq.id, user, app.worker_id);
                    }
                } catch (e) {
                    console.log('Chat auth error:', e);
                }
            }

            // Notifications
            let notifTitle = '';
            let notifDesc = '';
            let notifType = '';

            if (status === 'ACCEPTED') {
                notifTitle = 'Candidatura Aceite! 🎉';
                notifDesc = `A sua candidatura para "${job.title}" foi aceite. O cliente já pode entrar em contacto.`;
                notifType = 'APPLICATION_ACCEPTED';
            } else if (status === 'REJECTED') {
                notifTitle = 'Candidatura não selecionada';
                notifDesc = `Obrigado pelo interesse na vaga "${job.title}", mas o cliente decidiu avançar com outros perfis.`;
                notifType = 'APPLICATION_REJECTED';
            } else if (status === 'HIRED') {
                notifTitle = 'FOI CONTRATADO! 🏆';
                notifDesc = `Parabéns! Você foi contratado para a vaga "${job.title}". Combine os detalhes no chat.`;
                notifType = 'USER_HIRED';
            }

            if (notifTitle) {
                await supabase.from('notifications').insert({
                    user_id: app.worker_id,
                    sender_id: uid,
                    title: notifTitle,
                    description: notifDesc,
                    type: notifType,
                    is_read: false,
                    route: `/job/${id}`
                });
            }

            Alert.alert("Sucesso", "Estado da candidatura atualizado e candidato notificado.");
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

    const isOwner = (user?.uid || user?.id) === job.employer_id;
    const isWorker = user?.role === 'WORKER';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                        <Text>{` ${job.contract_type === 'DAILY' ? 'Diarista' : job.contract_type === 'TEMPORARY' ? 'Temporário' : 'Permanente'} · `}</Text>
                        <Ionicons name={job.forResidence ? 'home-outline' : 'business-outline'} size={14} color={Colors.textSecondary} />
                        <Text>{` ${job.forResidence ? 'Residência' : 'Mini-empresa'}`}</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.description}>{job.description}</Text>
                {job.image_url && (
                    <Image 
                        source={{ uri: job.image_url }} 
                        style={[styles.detailImage, Platform.OS === 'web' && { objectFit: 'cover' }]} 
                        resizeMode="cover" 
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cliente</Text>
                <View style={styles.employerCard}>
                    <View style={styles.empAvatar}>
                        <Text style={styles.empAvatarText}>{job.employer?.name?.[0] || '?'}</Text>
                    </View>
                    <View style={styles.empInfo}>
                        <View style={styles.empNameRow}>
                            <Text style={styles.empName}>{job.employer?.name}</Text>
                            {job.employer?.is_premium && <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />}
                            {job.employer?.isVerified && <MaterialIcons name="verified" size={14} color="#25D366" style={{ marginLeft: 4 }} />}
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
                    {applicationStatus === 'HIRED' ? (
                        <View style={[styles.applyButton, { backgroundColor: '#4CAF50', elevation: 0, shadowOpacity: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="trophy" size={18} color={Colors.white} />
                                <Text style={[styles.applyButtonText, { color: Colors.white }]}>Contratado para a vaga!</Text>
                            </View>
                        </View>
                    ) : applicationStatus === 'REJECTED' ? (
                        <View style={[styles.applyButton, { backgroundColor: Colors.borderLight, elevation: 0, shadowOpacity: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                                <Text style={[styles.applyButtonText, { color: Colors.textSecondary }]}>Candidatura não selecionada</Text>
                            </View>
                        </View>
                    ) : applicationStatus === 'ACCEPTED' ? (
                        <TouchableOpacity 
                            style={styles.applyButton} 
                            onPress={handleApply} 
                            activeOpacity={0.8}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="chatbubble-ellipses" size={18} color={Colors.white} />
                                <Text style={styles.applyButtonText}>Candidatura Aceite - Enviar Mensagem</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.applyButton, (!isConnected && hasPendingRequest) && { backgroundColor: Colors.borderLight, elevation: 0, shadowOpacity: 0 }]} 
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
                    )}
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
                                {app.status === 'PENDING' && (
                                    <View style={styles.appActions}>
                                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleApplicationAction(app, 'ACCEPTED')}>
                                            <Ionicons name="checkmark" size={18} color={Colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleApplicationAction(app, 'REJECTED')}>
                                            <Ionicons name="close" size={18} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {app.status === 'ACCEPTED' && (
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity 
                                        style={{ backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                        onPress={() => handleApplicationAction(app, 'REJECTED')}
                                    >
                                        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>Rejeitar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={{ backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                        onPress={() => handleApplicationAction(app, 'HIRED')}
                                    >
                                        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>Contratar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(app.status === 'REJECTED' || app.status === 'HIRED') && (
                                <Ionicons 
                                    name={app.status === 'HIRED' ? 'checkmark-circle' : 'close-circle'} 
                                    size={22} 
                                    color={app.status === 'HIRED' ? '#4CAF50' : Colors.error} 
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
    sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
    description: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: 24 },
    detailImage: { width: '100%', height: 300, borderRadius: 12, marginTop: Spacing.md },
    employerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: Spacing.md, borderRadius: 12 },
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
