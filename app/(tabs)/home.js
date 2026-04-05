import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Platform, ScrollView, Image, ActivityIndicator, useWindowDimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts, PROFESSION_CATEGORIES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/PostCard';
import { useAuthGuard } from '../../utils/useAuthGuard';
import { startOrGetConversation } from '../../utils/chatHelper';
import { calculateCompleteness } from '../../utils/profileUtils';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// === Shared Components ===
function ProfileBanner({ completeness }) {
    const router = useRouter();
    if (completeness >= 100) return null;
    return (
        <TouchableOpacity style={styles.banner} onPress={() => router.push('/settings/edit-profile')} activeOpacity={0.8}>
            <View style={styles.bannerContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="sparkles" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.bannerText}>
                            Complete o seu perfil
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '700' }}>Finalizar ›</Text>
                </View>
                <View style={styles.progressBar}>
                    {completeness > 0 && <View style={[styles.progressFill, { width: `${completeness}%` }]} />}
                </View>
                <Text style={styles.bannerPercent}>{Math.round(completeness)}% completo</Text>
            </View>
        </TouchableOpacity>
    );
}

function JobCard({ job, onPress, userLocation, isApplied }) {
    const router = useRouter();
    const isNear = userLocation?.city && job.city && userLocation.city.toLowerCase() === job.city.toLowerCase();

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.cardType}>
                        <Text style={styles.cardTypeText}>{job.type}</Text>
                    </View>
                    {isNear && (
                        <View style={styles.proximityBadge}>
                            <Text style={styles.proximityText}>Perto de si</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardTime}>
                    {job.created_at?.seconds
                        ? new Date(job.created_at.seconds * 1000).toLocaleDateString('pt-MZ')
                        : job.created_at instanceof Date
                            ? job.created_at.toLocaleDateString('pt-MZ')
                            : ''}
                </Text>
            </View>
            <Text style={styles.cardTitle}>{job.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>{job.description}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.cardLocation}>
                    <Text style={styles.locationText}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} /> {job.city || 'Moçambique'}{job.province ? `, ${job.province}` : ''}
                    </Text>
                </View>
                <View style={styles.cardContract}>
                    <Text style={styles.contractText}>
                        {job.contract_type === 'DAILY' ? 'Diarista' : job.contract_type === 'TEMPORARY' ? 'Temporário' : 'Permanente'}
                    </Text>
                </View>
            </View>
            <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={styles.cardEmployer}
                    onPress={() => router.push(`/(tabs)/profile?id=${job.employer_id}`)}
                >
                    <View style={styles.employerAvatar}>
                        {job.employer?.profile_photo ? (
                            <Image source={{ uri: job.employer.profile_photo }} style={styles.avatarImageSmall} />
                        ) : (
                            <Text style={styles.avatarText}>{job.employer?.name?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.employerName}>{job.employer?.name || 'Empregador'}</Text>
                            {job.employer?.is_verified && <Ionicons name="checkmark-circle" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />}
                        </View>
                        <Text style={styles.applicants}>{job.applications ? job.applications[0]?.count : 0} candidatos</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
                        isApplied ? { backgroundColor: Colors.borderLight } : { backgroundColor: Colors.primary }
                    ]}
                    onPress={() => !isApplied && onPress('APPLY', job)}
                    disabled={isApplied}
                >
                    <Ionicons name={isApplied ? "checkmark-circle" : "document-text"} size={14} color={isApplied ? Colors.textSecondary : Colors.white} style={{ marginRight: 6 }} />
                    <Text style={{ color: isApplied ? Colors.textSecondary : Colors.white, fontWeight: '700', fontSize: 13 }}>
                        {isApplied ? 'Candidatado' : 'Candidatar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

function WorkerCard({ worker, onPress, userLocation, isContacted }) {
    const isNear = userLocation?.city && worker.city && userLocation.city.toLowerCase() === worker.city.toLowerCase();

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.cardType}>
                        <Text style={styles.cardTypeText}>{worker.work_types?.[0] || worker.profession_category || 'Profissional'}</Text>
                    </View>
                    {isNear && (
                        <View style={styles.proximityBadge}>
                            <Text style={styles.proximityText}>Perto de si</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardTime}>
                    {worker.province || ''}
                </Text>
            </View>
            <View style={styles.workerMain}>
                <View style={[styles.employerAvatar, { width: 44, height: 44, borderRadius: 22 }]}>
                    {worker.profile_photo ? (
                        <Image source={{ uri: worker.profile_photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                    ) : (
                        <Text style={[styles.avatarText, { fontSize: 18 }]}>{worker.name?.[0] || '?'}</Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{worker.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                        {worker.skills?.length > 0 ? worker.skills.join(', ') : (worker.profession_category || 'Profissional')}
                    </Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.cardLocation}>
                    <Text style={styles.locationText}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} /> {worker.city}, {worker.bairro}
                    </Text>
                </View>
                {worker.rating_avg > 0 && (
                    <View style={styles.cardRating}>
                        <Ionicons name="star" size={12} color="#FFB800" />
                        <Text style={styles.cardRatingText}>{worker.rating_avg.toFixed(1)}</Text>
                        <Text style={styles.cardCompletedText}>({worker.completed_contracts || 0})</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[
                    { marginTop: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
                    isContacted ? { backgroundColor: Colors.borderLight } : { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primary + '30' }
                ]}
                onPress={() => !isContacted && onPress('CONTACT', worker)}
                disabled={isContacted}
            >
                <Ionicons name={isContacted ? "checkmark-circle" : "chatbubble-ellipses"} size={16} color={isContacted ? Colors.textSecondary : Colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: isContacted ? Colors.textSecondary : Colors.primary, fontWeight: '700', fontSize: 14 }}>
                    {isContacted ? 'Contactado' : 'Contactar profissional'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// === Web-Only: Right Sidebar (Widgets) ===
function WebRightSidebar({ router }) {
    const trendingTypes = PROFESSION_CATEGORIES.slice(0, 5);

    return (
        <View style={{ flex: 1 }}>
            {/* Tips Card Redesigned */}
            <View style={webStyles.premiumWidget}>
                <View style={webStyles.premiumWidgetHeader}>
                    <View style={webStyles.bulbIconBox}>
                        <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
                    </View>
                    <Text style={webStyles.premiumWidgetTitle}>Dicas de Sucesso</Text>
                </View>
                <Text style={webStyles.premiumWidgetText}>
                    Sabia que utilizadores com o <Text style={{fontWeight: '700'}}>perfil Completo</Text> recebem em média <Text style={{color: Colors.primary, fontWeight: '700'}}>3x mais</Text> propostas de trabalho em Moçambique?
                </Text>
                <TouchableOpacity 
                    style={webStyles.premiumWidgetBtn}
                    onPress={() => router.push('/settings/edit-profile')}
                >
                    <Text style={webStyles.premiumWidgetBtnText}>Melhorar Perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Trending */}
            <View style={webStyles.widget}>
                <Text style={webStyles.widgetTitle}>
                    <Ionicons name="flame-outline" size={16} color="#FF5722" /> Tendências
                </Text>
                {trendingTypes.map((type, i) => (
                    <TouchableOpacity key={i} style={webStyles.trendItem}>
                        <Text style={webStyles.trendText}>{type}</Text>
                        <Text style={webStyles.trendSub}>Procura em alta</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Support Links */}
            <View style={webStyles.widget}>
                <Text style={webStyles.widgetTitle}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.primary} /> Sobre e Suporte
                </Text>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/how')}>
                    <Text style={webStyles.trendText}>Como Funciona</Text>
                    <Text style={webStyles.trendSub}>Guia de utilização</Text>
                </TouchableOpacity>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/privacy')}>
                    <Text style={webStyles.trendText}>Privacidade</Text>
                    <Text style={webStyles.trendSub}>Proteção de dados</Text>
                </TouchableOpacity>
                <TouchableOpacity style={webStyles.trendItem} onPress={() => router.push('/info/terms')}>
                    <Text style={webStyles.trendText}>Termos de Uso</Text>
                    <Text style={webStyles.trendSub}>Contrato de plataforma</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={webStyles.footer}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => router.push('/info/help')}><Text style={webStyles.footerLink}>Ajuda</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/info/privacy')}><Text style={webStyles.footerLink}>Privacidade</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/info/terms')}><Text style={webStyles.footerLink}>Termos</Text></TouchableOpacity>
                </View>
                <Text style={webStyles.footerText}>Mão Segura © 2026</Text>
                <Text style={webStyles.footerSub}>A sua rede de confiança</Text>
            </View>
        </View>
    );
}

// === Main Component ===
export default function Home() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { unreadMessages, unreadNotifications } = useUnreadCount();
    const { requireAuth } = useAuthGuard();
    const [jobs, setJobs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [feedTab, setFeedTab] = useState('POSTS');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionedIds, setActionedIds] = useState(new Set());
    const [completeness, setCompleteness] = useState(user?.completeness || 0);
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isSmallScreen = width < 800;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // --- Header Animation (Mobile) ---
    const scrollY = useRef(new Animated.Value(0)).current;
    const TAB_BAR_HEIGHT = 58;
    const HEADER_HEIGHT = 64 + insets.top + TAB_BAR_HEIGHT;
    
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
    const headerTranslateY = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT],
    });

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, (HEADER_HEIGHT - TAB_BAR_HEIGHT) * 0.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const userName = user?.name || user?.displayName || user?.firstName || 'Acesso Visitante';

    const handleContact = useCallback(async (type, item) => {
        if (!requireAuth()) return;
        
        const targetId = type === 'APPLY' ? item.employer_id : item.id;
        if (user.uid === targetId) return;

        try {
            const conversationId = await startOrGetConversation(user, targetId, {
                job_id: type === 'APPLY' ? item.id : null,
                last_message: type === 'APPLY' ? 'Candidatou-se à vaga' : 'Interessado no perfil',
            });
            
            // Optimistic update for home feed
            setActionedIds(prev => new Set(prev).add(item.id));
            
            router.push({ pathname: `/chat/${conversationId}`, params: { name: item.name || item.employer?.name || 'Contacto' } });
        } catch (err) {
            console.error('Error starting chat:', err);
        }
    }, [user, requireAuth, router]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user || user.role === 'WORKER') {
                // Fetch Active Jobs for Workers
                const jobsQuery = query(
                    collection(db, 'jobs'),
                    where('status', '==', 'ACTIVE')
                );
                const jobsSnap = await getDocs(jobsQuery);
                const jobsData = [];
                const empPromises = [];

                for (const docSnap of jobsSnap.docs) {
                    const job = { id: docSnap.id, ...docSnap.data() };
                    job.applications = [{ count: job.applications_count || 0 }];
                    jobsData.push(job);
                    if (job.employer_id) {
                        empPromises.push({ index: jobsData.length - 1, promise: getDoc(doc(db, 'users', job.employer_id)) });
                    }
                }

                // Resolve all employers at once sequentially wait
                const empSnaps = await Promise.all(empPromises.map(p => p.promise));

                empPromises.forEach((p, i) => {
                    const empSnap = empSnaps[i];
                    if (empSnap.exists()) {
                        const empData = empSnap.data();
                        jobsData[p.index].employer = {
                            id: empSnap.id,
                            name: empData.name,
                            city: empData.city,
                            province: empData.province,
                            is_verified: empData.is_verified,
                        };
                    }
                });

                // --- Location-based Sorting ---
                const userProvince = user?.province?.toLowerCase();
                const userCity = user?.city?.toLowerCase();

                jobsData.sort((a, b) => {
                    const locA = (userCity && a.city?.toLowerCase() === userCity ? 2 : (userProvince && a.province?.toLowerCase() === userProvince ? 1 : 0));
                    const locB = (userCity && b.city?.toLowerCase() === userCity ? 2 : (userProvince && b.province?.toLowerCase() === userProvince ? 1 : 0));

                    if (locA !== locB) return locB - locA;
                    return new Date(b.created_at) - new Date(a.created_at);
                });

                setJobs(jobsData);
            } else {
                // Fetch Workers for Employers
                const workersQuery = query(
                    collection(db, 'users'),
                    where('role', '==', 'WORKER')
                );
                const workersSnap = await getDocs(workersQuery);
                const workersData = [];

                // Load all profiles in parallel
                const profilePromises = workersSnap.docs.map(docSnap =>
                    getDoc(doc(db, 'worker_profiles', docSnap.id))
                );

                const profileSnaps = await Promise.all(profilePromises);

                workersSnap.docs.forEach((docSnap, index) => {
                    const workerUser = { id: docSnap.id, ...docSnap.data() };
                    const profileSnap = profileSnaps[index];

                    if (profileSnap.exists()) {
                        workersData.push({
                            ...workerUser,
                            ...profileSnap.data(),
                            id: workerUser.id
                        });
                    } else {
                        workersData.push(workerUser);
                    }
                });

                setJobs(workersData); // Reusing 'jobs' state for feedData
            }

            // Fetch Posts
            const postsQuery = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
            const postsSnap = await getDocs(postsQuery);
            const postsData = [];

            // To ensure compatibility with older posts, we fetch the role if missing
            for (const d of postsSnap.docs) {
                const p = { id: d.id, ...d.data() };
                if (!p.user_role && p.user_id) {
                    const authorSnap = await getDoc(doc(db, 'users', p.user_id));
                    if (authorSnap.exists()) {
                        p.user_role = authorSnap.data().role;
                    }
                }
                postsData.push(p);
            }

            // --- Location-based Sorting for Posts ---
            const postUserProvince = user?.province?.toLowerCase();
            const postUserCity = user?.city?.toLowerCase();

            postsData.sort((a, b) => {
                const locA = (postUserCity && a.city?.toLowerCase() === postUserCity ? 2 : (postUserProvince && a.province?.toLowerCase() === postUserProvince ? 1 : 0));
                const locB = (postUserCity && b.city?.toLowerCase() === postUserCity ? 2 : (postUserProvince && b.province?.toLowerCase() === postUserProvince ? 1 : 0));

                if (locA !== locB) return locB - locA;
                return new Date(b.created_at?.seconds * 1000 || b.created_at) - new Date(a.created_at?.seconds * 1000 || a.created_at);
            });

            setPosts(postsData);

            // Fetch Actioned IDs (Conversations)
            if (user) {
                const fieldSelf = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
                const convQ = query(collection(db, 'chat_conversations'), where(fieldSelf, '==', user.uid));
                const convSnap = await getDocs(convQ);
                const ids = new Set();
                convSnap.forEach(d => {
                    const data = d.data();
                    if (data.job_id) ids.add(data.job_id);
                    // For workers, we track the user ID of the employer they contacted via profile
                    const otherId = user.role === 'WORKER' ? data.employer_id : data.worker_id;
                    if (otherId) ids.add(otherId);
                });
                setActionedIds(ids);
            }

            // Calculate Completeness
            if (user) {
                const profileTable = user.role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                const profileRef = doc(db, profileTable, user.uid);
                const userRef = doc(db, 'users', user.uid);
                const [profileSnap, userSnap] = await Promise.all([getDoc(profileRef), getDoc(userRef)]);

                const userData = userSnap.exists() ? userSnap.data() : {};
                const profileData = profileSnap.exists() ? profileSnap.data() : {};

                const finalCompleteness = calculateCompleteness(userData, profileData, user.role);
                setCompleteness(finalCompleteness);
            } else {
                setCompleteness(100); // Hide banner for visitors
            }
        } catch (err) {
            console.warn('Load data error:', err);
        } finally {
            setLoading(false);
        }
    }, [user, userName]);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // === WEB: 3-Column Layout ===
    if (isWeb) {
        return (
            <View style={[webStyles.webContainer, { height: '100vh', overflow: 'hidden' }]}>
                <View style={[webStyles.threeCol, isSmallScreen && { flexDirection: 'column', maxWidth: 600, alignItems: 'center' }, { flex: 1 }]}>
                    {/* Center Feed */}
                    <View style={webStyles.centerFeed}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                            {loading ? (
                                <View style={{ paddingVertical: 100, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <Text style={{ marginTop: 16, color: Colors.textSecondary, fontWeight: '500' }}>Carregando atualizações...</Text>
                                </View>
                            ) : (
                                <>
                                    {completeness < 100 && (
                                        <View style={[webStyles.feedGreetingCard, { paddingVertical: 16 }]}>
                                            <View style={webStyles.feedProgressSection}>
                                                <View style={webStyles.feedProgressInfo}>
                                                    <Text style={webStyles.feedProgressLabel}>
                                                        <Ionicons name="sparkles" size={14} color={Colors.primary} /> Perfil {Math.round(completeness)}% completo
                                                    </Text>
                                                    <TouchableOpacity onPress={() => router.push('/settings/edit-profile')}>
                                                        <Text style={webStyles.feedProgressAction}>Finalizar perfil ›</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={webStyles.feedProgressBar}>
                                                    {completeness > 0 && <View style={[webStyles.feedProgressFill, { width: `${completeness}%` }]} />}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Create Post / Job Button */}
                                    {(user?.role === 'EMPLOYER' || feedTab === 'POSTS') && (
                                        <TouchableOpacity
                                            style={webStyles.createJobBox}
                                            onPress={() => {
                                                if (requireAuth()) {
                                                    router.push(feedTab === 'POSTS' ? (user.role === 'EMPLOYER' ? '/job/create' : '/post/create') : '/job/create');
                                                }
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={webStyles.webAvatarIcon}>
                                                {user?.profile_photo ? (
                                                    <Image source={{ uri: user.profile_photo }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                                                ) : (
                                                    <Text style={webStyles.webAvatarIconText}>{user?.name?.[0] || '?'}</Text>
                                                )}
                                            </View>
                                            <View style={webStyles.createJobInput}>
                                                <Text style={webStyles.createJobPlaceholder}>
                                                    {feedTab === 'POSTS' ? 'Começar uma publicação...' : 'Publicar uma nova vaga...'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {/* Sort bar & Tabs */}
                                    <View style={webStyles.tabContainerWeb}>
                                        <TouchableOpacity style={[webStyles.tabBtnWeb, feedTab === 'POSTS' && webStyles.tabBtnWebActive]} onPress={() => setFeedTab('POSTS')}>
                                            <Text style={[webStyles.tabBtnTextWeb, feedTab === 'POSTS' && webStyles.tabBtnWebActive]}>Comunidade</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[webStyles.tabBtnWeb, feedTab === 'OPORTUNIDADES' && webStyles.tabBtnWebActive]} onPress={() => setFeedTab('OPORTUNIDADES')}>
                                            <Text style={[webStyles.tabBtnTextWeb, feedTab === 'OPORTUNIDADES' && webStyles.tabBtnWebActive]}>
                                                {user?.role === 'WORKER' ? 'Vagas Recentes' : 'Recomendações'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {(feedTab === 'POSTS' ? posts : jobs).length === 0 ? (
                                        <View style={styles.empty}>
                                            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} style={{ marginBottom: 16 }} />
                                            <Text style={styles.emptyText}>Nenhuma informação disponível</Text>
                                            <Text style={styles.emptySubtext}>Não há atualizações para mostrar agora.</Text>
                                        </View>
                                    ) : (
                                        (feedTab === 'POSTS' ? posts : jobs).map(item => (
                                            feedTab === 'POSTS' ? (
                                                <PostCard key={item.id} post={item} />
                                            ) : (
                                                (!user || user.role === 'WORKER')
                                                    ? <JobCard key={item.id} job={item} onPress={handleContact} userLocation={user} isApplied={actionedIds.has(item.id)} />
                                                    : <WorkerCard key={item.id} worker={item} onPress={handleContact} userLocation={user} isContacted={actionedIds.has(item.id)} />
                                            )
                                        ))
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>

                    {!isSmallScreen && (
                        <View style={webStyles.rightSidebar}>
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                                <WebRightSidebar router={router} />
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // === MOBILE: Single column (unchanged) ===
    return (
        <View style={styles.container}>
            {/* Custom Animated Header (Mobile) */}
            {!isWeb && (
                <Animated.View style={[
                    styles.mobileHeader, 
                    { 
                        height: HEADER_HEIGHT, 
                        paddingTop: insets.top,
                        transform: [{ translateY: headerTranslateY }],
                    }
                ]}>
                    <View style={styles.headerContent}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.headerTitle}>{t('tabs.home')}</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                                <Ionicons name="search-outline" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={styles.headerIconBtn}>
                                <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
                                {unreadNotifications > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Integrated Mobile Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tabBtn, feedTab === 'POSTS' && styles.tabBtnActive]} onPress={() => setFeedTab('POSTS')}>
                            <Text style={[styles.tabBtnText, feedTab === 'POSTS' && styles.tabBtnTextActive]}>Comunidade</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabBtn, feedTab === 'OPORTUNIDADES' && styles.tabBtnActive]} onPress={() => setFeedTab('OPORTUNIDADES')}>
                            <Text style={[styles.tabBtnText, feedTab === 'OPORTUNIDADES' && styles.tabBtnTextActive]}>
                                {user?.role === 'WORKER' ? 'Vagas' : 'Profissionais'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={feedTab === 'POSTS' ? posts : jobs}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    ListHeaderComponent={() => (
                        <View>
                            <ProfileBanner completeness={completeness} />
                        </View>
                    )}
                    renderItem={({ item }) => {
                        if (feedTab === 'POSTS') {
                            return <PostCard post={item} />;
                        }
                        return (!user || user.role === 'WORKER')
                            ? <JobCard job={item} onPress={handleContact} userLocation={user} isApplied={actionedIds.has(item.id)} />
                            : <WorkerCard worker={item} onPress={handleContact} userLocation={user} isContacted={actionedIds.has(item.id)} />
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>Nenhuma informação</Text>
                            <Text style={styles.emptySubtext}>Volte mais tarde para ver atualizações</Text>
                        </View>
                    )}
                    contentContainerStyle={[styles.list, !isWeb && { paddingTop: HEADER_HEIGHT }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

// === Mobile Styles ===
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    greeting: { marginBottom: Spacing.md },
    greetingText: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
    greetingSubtext: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    banner: {
        backgroundColor: Colors.primary + '10',
        borderRadius: 16, padding: Spacing.md,
        marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '20',
    },
    bannerContent: {},
    bannerText: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '500', marginBottom: 8 },
    progressBar: { height: 6, backgroundColor: Colors.primary + '20', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
    bannerPercent: { fontSize: Fonts.sizes.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
    createButton: {
        backgroundColor: Colors.primary, borderRadius: 14,
        paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.md,
    },
    createButtonText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' },
    card: {
        backgroundColor: Colors.white,
        borderRadius: Platform.OS === 'web' ? 8 : 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...(Platform.OS === 'web' ? {
            borderWidth: 1,
            borderColor: '#E0DFDC',
        } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardType: { backgroundColor: Colors.primaryBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    cardTypeText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600' },
    cardTime: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    cardTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    cardDescription: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    cardLocation: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
    cardContract: { backgroundColor: Colors.info + '12', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    contractText: { fontSize: Fonts.sizes.xs, color: Colors.info, fontWeight: '600' },
    cardEmployer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
    employerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
    avatarImageSmall: { width: 28, height: 28, borderRadius: 14 },
    avatarText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    employerName: { fontSize: Fonts.sizes.sm, color: Colors.text, fontWeight: '500', flex: 1 },
    verified: { color: Colors.primary, fontWeight: '700', marginRight: 8 },
    applicants: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    proximityBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    proximityText: { fontSize: 10, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
    emptyText: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text },
    emptySubtext: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
    workerMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 8, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: Colors.primary },
    tabBtnText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },
    tabBtnTextActive: { color: Colors.primary },
    cardRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
    cardRatingText: { fontSize: 12, fontWeight: '700', color: Colors.text },
    cardCompletedText: { fontSize: 11, color: Colors.textLight },
    
    // Header Mobile
    mobileHeader: {
        backgroundColor: Colors.white,
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        justifyContent: 'flex-end',
    },
    headerContent: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    headerLogo: { width: 32, height: 32, borderRadius: 8, marginRight: 8 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary },
    headerActions: { flexDirection: 'row', gap: 12 },
    headerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
});

// === Web-Only Styles ===
const webStyles = StyleSheet.create({
    webContainer: { flex: 1, backgroundColor: '#F4F2EE' },
    webContentContainer: { alignItems: 'center', paddingTop: 8, paddingBottom: 40 },
    threeCol: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 1300,
        marginHorizontal: 'auto',
        gap: 32,
        paddingHorizontal: 24,
    },

    // Left Sidebar
    leftSidebar: { width: 225 },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        overflow: 'hidden',
        marginBottom: 8,
    },
    profileBanner: {
        height: 56,
        backgroundColor: Colors.primary,
        backgroundImage: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%)`,
    },
    profileCardContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginTop: -24,
    },
    profileAvatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.white,
        marginBottom: 8,
    },
    profileAvatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
    profileName: { fontSize: 15, fontWeight: '700', color: Colors.text, textAlign: 'center' },
    profileRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    profileLocation: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
    completenessSection: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    completenessRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    completenessLabel: { fontSize: 12, color: Colors.textSecondary },
    completenessValue: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    completenessBar: { height: 4, backgroundColor: Colors.primary + '20', borderRadius: 2, overflow: 'hidden' },
    completenessFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
    profileDivider: { height: 1, backgroundColor: Colors.borderLight },
    statRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    statArrow: { fontSize: 16, color: Colors.textLight },

    quickLinks: {
        backgroundColor: Colors.white, borderRadius: 8,
        borderWidth: 1, borderColor: '#E0DFDC',
        paddingVertical: 4,
    },
    quickLink: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    quickLinkIcon: { fontSize: 16, marginRight: 10 },
    quickLinkText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

    // Center Feed
    centerFeed: { flex: 1, maxWidth: 800 },
    feedGreetingCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0DFDC',
    },
    feedGreetingTop: {},
    feedGreetingTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
    feedGreetingSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

    feedProgressSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    feedProgressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    feedProgressLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    feedProgressAction: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    feedProgressBar: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
    feedProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },

    createJobBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.white, borderRadius: 8,
        borderWidth: 1, borderColor: '#E0DFDC',
        padding: 12, marginBottom: 16,
    },
    webAvatarIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    webAvatarIconText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
    createJobInput: {
        flex: 1, backgroundColor: 'transparent',
        borderWidth: 1, borderColor: '#C7C5C1',
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    },
    createJobPlaceholder: { fontSize: 14, color: Colors.textLight },

    sortBar: {
        flexDirection: 'row', alignItems: 'center',
        marginVertical: 12,
    },
    sortLine: { flex: 1, height: 1, backgroundColor: '#E0DFDC' },
    sortText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8 },

    // Right Sidebar
    rightSidebar: { width: 300, flexShrink: 0 },
    widget: {
        backgroundColor: Colors.white, borderRadius: 12,
        borderWidth: 1, borderColor: '#E0DFDC',
        paddingVertical: 12, marginBottom: 8,
    },
    premiumWidget: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    premiumWidgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bulbIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    premiumWidgetTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
    premiumWidgetText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 16 },
    premiumWidgetBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    premiumWidgetBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
    widgetTitle: {
        fontSize: 15, fontWeight: '700', color: Colors.text,
        paddingHorizontal: 16, marginBottom: 8,
    },
    trendItem: {
        paddingHorizontal: 16, paddingVertical: 8,
    },
    trendText: { fontSize: 13, fontWeight: '600', color: Colors.text },
    trendSub: { fontSize: 11, color: Colors.textLight, marginTop: 1 },

    footer: {
        paddingVertical: 16, paddingHorizontal: 16,
    },
    footerText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    footerSub: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
    footerLink: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    tabContainerWeb: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0DFDC' },
    tabBtnWeb: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabBtnWebActive: { borderBottomColor: Colors.primary },
    tabBtnTextWeb: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
    tabBtnTextWebActive: { color: Colors.primary },
    headerBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        zIndex: 10,
    },
    headerBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
