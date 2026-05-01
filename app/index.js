import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, ActivityIndicator, useWindowDimensions, Animated } from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Fonts, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import BrandWordmark from '../components/BrandWordmark';

export default function WebLandingOrSplash() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { user, isOnboarded, isLoading } = useAuthStore();
    const { width, height } = useWindowDimensions();
    const isMobileWeb = width < 768; // Simple responsive check
    const isNarrowWeb = width < 640;
    
    // Refs for smooth scroll navigation
    const scrollRef = useRef(null);
    const howItWorksRef = useRef(null);
    const supportSectionRef = useRef(null);
    const testimonialsRef = useRef(null);
    const aboutUsRef = useRef(null);

    const scrollToSection = (ref) => {
        if (Platform.OS === 'web' && ref.current) {
            ref.current.measureLayout(
                scrollRef.current.getInnerViewNode(),
                (x, y) => {
                    scrollRef.current.scrollTo({ y: y - 80, animated: true });
                }
            );
        }
    };
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
    const [loadingTestimonials, setLoadingTestimonials] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            if (Platform.OS !== 'web' || user) return;
            try {
                const q = query(
                    collection(db, 'testimonials'), 
                    where('status', '==', 'APPROVED'),
                    orderBy('created_at', 'desc'),
                    limit(6)
                );
                const snap = await getDocs(q);
                const data = [];
                for (const d of snap.docs) {
                    const item = { id: d.id, ...d.data() };
                    // Fetch user photo if NOT present (it might already be in the doc if we optimized, 
                    // but let's be safe as per our current implementation)
                   if (item.user_id && !item.user_photo) {
                       const uRef = doc(db, 'users', item.user_id);
                       const uSnap = await getDoc(uRef);
                       if (uSnap.exists()) {
                           item.user_photo = uSnap.data().profile_photo;
                       }
                   }
                   data.push(item);
                }
                setDynamicTestimonials(data);
            } catch (err) {
                console.error('Error fetching testimonials:', err);
            } finally {
                setLoadingTestimonials(false);
            }
        };
        fetchTestimonials();
    }, [user]);

    const sliderImages = [
        require('../assets/images/cook.png'),
        require('../assets/images/gardener.png'),
        require('../assets/images/nanny_realistic.png'),
        require('../assets/images/plumber.png')
    ];

    useEffect(() => {
        // Wait for initialize to finish
        if (isLoading) return;

        if (Platform.OS !== 'web' || user) {
            const timer = setTimeout(() => {
                if (user) {
                    router.replace('/(tabs)/home');
                } else if (!isOnboarded && Platform.OS !== 'web') {
                    router.replace('/onboarding');
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, isOnboarded, isLoading]);

    // Slider effect
    useEffect(() => {
        if (Platform.OS === 'web' && !user) {
            const interval = setInterval(() => {
                setCurrentImageIdx((prev) => (prev + 1) % sliderImages.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [user]);

    if (Platform.OS !== 'web' || user) {
        return (
            <View style={styles.splashContainer}>
                <Image 
                    source={require('../assets/splash-icon.png')} 
                    style={styles.splashLogo} 
                    resizeMode="contain" 
                />
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
            </View>
        );
    }

    // MAIN WEB LANDING PAGE
    return (
        <View style={styles.webContainer}>
            {/* ====== FIXED NAVBAR ====== */}
            <View style={styles.navbarFixed}>
                <View style={styles.navLeft}>
                    <BrandWordmark
                        variant={isMobileWeb ? 'onDark' : 'onDarkLarge'}
                        layout="inline"
                        showIcon
                        iconOnly={isNarrowWeb}
                        style={{ marginRight: 4 }}
                    />
                </View>
                
                {!isMobileWeb && (
                    <View style={styles.navCenter}>
                        <TouchableOpacity onPress={() => scrollToSection(howItWorksRef)}>
                            <Text style={[styles.navLinkCenter, { color: Colors.white }]}>{t('lander.how_it_works')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => scrollToSection(supportSectionRef)}>
                            <Text style={[styles.navLinkCenter, { color: Colors.white }]}>{t('lander.support_nav')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => scrollToSection(testimonialsRef)}>
                            <Text style={[styles.navLinkCenter, { color: Colors.white }]}>{t('lander.testimonials')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => scrollToSection(aboutUsRef)}>
                            <Text style={[styles.navLinkCenter, { color: Colors.white }]}>{t('lander.about_us')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.navRight, isNarrowWeb && styles.navRightTight]}>
                    <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')} style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="globe-outline" size={18} color={Colors.white} />
                        <Text style={[{ color: Colors.white, fontSize: 13, fontWeight: '700' }, isNarrowWeb && { display: 'none' }]}>
                            {i18n.language === 'pt' ? 'English' : 'Português'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.btnEntrar}>
                        <Text style={styles.btnEntrarText}>{t('auth.login')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/auth/choose-type')} style={[styles.btnRegistar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.white }]}>
                        <Text style={[styles.btnRegistarText, { color: Colors.white }]}>{t('auth.register')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[]}>
            
            {/* ====== FULL HERO SECTION ====== */}
            <View style={[styles.heroFull, { height }]}>
                {/* Background Slider Images */}
                {sliderImages.map((src, idx) => (
                    <Image 
                        key={idx}
                        source={src} 
                        style={[styles.heroBgImage, { opacity: currentImageIdx === idx ? 1 : 0 }]} 
                        resizeMode="cover" 
                    />
                ))}
                
                {/* Dark Overlay for text readability */}
                <View style={styles.heroOverlay} />

                {/* Content over Image */}
                <View style={styles.heroContentOver}>
                    <View style={styles.heroTag}>
                        <View style={styles.heroTagBadge}><Text style={styles.heroTagBadgeText}>{t('lander.hero_tag')}</Text></View>
                    </View>
                    
                    <Text style={[styles.heroTitleOver, isMobileWeb && { fontSize: 36, lineHeight: 44 }]}>
                        {t('home.hero_title')}<Text style={{ color: Colors.primary }}>{t('lander.hero_title_accent')}</Text>.
                    </Text>
                    <Text style={styles.heroSubtitleOver}>
                        {t('home.hero_subtitle')}
                    </Text>
                    
                    <View style={[styles.heroButtonsOver, isMobileWeb && { flexDirection: 'column', width: '100%' }]}>
                        <TouchableOpacity style={[styles.btnHeroPrimary, isMobileWeb && { alignItems: 'center' }]} onPress={() => router.push({ pathname: '/auth/register', params: { role: 'EMPLOYER' } })}>
                            <Text style={styles.btnHeroPrimaryText}>{t('lander.hire_button')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnHeroSecondary, { backgroundColor: 'transparent', borderColor: '#4B5563', backgroundColor: 'rgba(255,255,255,0.1)' }, isMobileWeb && { alignItems: 'center' }]} onPress={() => router.push({ pathname: '/auth/register', params: { role: 'WORKER' } })}>
                            <Text style={[styles.btnHeroSecondaryText, { color: Colors.white }]}>{t('lander.work_button')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroTrustIndicators}>
                        <Text style={styles.trustText}><Ionicons name="card" size={14} color={Colors.primary} /> M-Pesa & e-Mola</Text>
                        <Text style={styles.trustText}><Ionicons name="shield-checkmark" size={14} color={Colors.primary} /> {t('lander.trust_profiles')}</Text>
                    </View>
                </View>
            </View>

            {/* ====== SECTION 1B: FIND JOB (DARK) ====== */}
            <View ref={howItWorksRef} style={styles.darkSectionFull}>
                <Image source={require('../assets/images/post_job_bg.png')} style={styles.sectionBgImage} resizeMode="cover" />
                <View style={styles.sectionDarkOverlay} />
                <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobileReverse]}>
                    <View style={styles.sectionVisualCol}>
                        <View style={styles.floatingPreviewCard}>
                            <View style={styles.previewHeader}><Text style={styles.previewDot}>●</Text><Text style={styles.previewDot}>●</Text></View>
                            <Text style={styles.previewTitle}>{t('lander.worker_card_title')}</Text>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>{t('tabs.jobs')}:</Text><Text style={styles.previewValue}>Limpeza / Babá</Text></View>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>Local:</Text><Text style={styles.previewValue}>Maputo / Matola</Text></View>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>Disponib.:</Text><Text style={styles.previewValue}>Imediata</Text></View>
                            <View style={[styles.previewBadge, {backgroundColor: Colors.primary + '20'}]}><Text style={{color: Colors.primary, fontSize: 10, fontWeight: '800'}}>{t('lander.worker_card_verified')}</Text></View>
                        </View>
                    </View>
                    <View style={styles.sectionTextCol}>
                        <Text style={styles.sectionHeadingDark}>{t('lander.worker_heading')}</Text>
                        <Text style={styles.sectionBodyDark}>{t('lander.worker_body_1')}</Text>
                        <Text style={styles.sectionBodyDark}>{t('lander.worker_body_2')}</Text>
                        <TouchableOpacity style={styles.btnSectionAction} onPress={() => router.push({ pathname: '/auth/register', params: { role: 'WORKER' } })}>
                            <Text style={styles.btnSectionActionText}>{t('home.find_job')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ====== SECTION 1: POST JOB (DARK) ====== */}
            <View style={styles.darkSectionFull}>
                <Image source={require('../assets/images/post_job_bg.png')} style={styles.sectionBgImage} resizeMode="cover" />
                <View style={styles.sectionDarkOverlay} />
                <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobile]}>
                    <View style={styles.sectionTextCol}>
                        <Text style={styles.sectionHeadingDark}>{t('lander.employer_heading')}</Text>
                        <Text style={styles.sectionBodyDark}>{t('lander.employer_body_1')}</Text>
                        <Text style={styles.sectionBodyDark}>{t('lander.employer_body_2')}</Text>
                        <TouchableOpacity style={styles.btnSectionAction} onPress={() => router.push('/auth/register')}>
                            <Text style={styles.btnSectionActionText}>{t('lander.employer_action')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sectionVisualCol}>
                        <View style={styles.floatingPreviewCard}>
                            <View style={styles.previewHeader}><Text style={styles.previewDot}>●</Text><Text style={styles.previewDot}>●</Text></View>
                            <Text style={styles.previewTitle}>{t('lander.employer_card_title')}</Text>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>Tipo:</Text><Text style={styles.previewValue}>Cozinheira / Limpeza</Text></View>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>Local:</Text><Text style={styles.previewValue}>Sommerschield, Maputo</Text></View>
                            <View style={styles.previewRow}><Text style={styles.previewLabel}>Turnos:</Text><Text style={styles.previewValue}>Segunda a Sexta (Diarista)</Text></View>
                            <View style={[styles.previewBadge, {backgroundColor: Colors.primary + '20'}]}><Text style={{color: Colors.primary, fontSize: 10, fontWeight: '800'}}>{t('lander.employer_card_recommended')}</Text></View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ====== SECTION 2: CHOOSE WORKERS (LIGHT) ====== */}
            <View style={[styles.sectionLight, {paddingTop: isMobileWeb ? 60 : 100}]}>
                <Image source={require('../assets/images/workers_grid_bg.png')} style={[styles.sectionBgImage, {opacity: 0.25}]} resizeMode="cover" />
                <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobileReverse]}>
                    <View style={styles.sectionVisualCol}>
                        <View style={[styles.profilesGrid, isMobileWeb && { alignItems: 'center', width: '100%' }]}>
                            <View style={styles.miniProfileCard}>
                                <Image source={{uri: 'https://i.pravatar.cc/150?u=1'}} style={styles.miniAvatar} />
                                <View style={styles.miniInfo}>
                                    <Text style={styles.miniName}>Sara Vuma</Text>
                                    <Text style={styles.miniRole}>Limpeza e Cozinha</Text>
                                    <Text style={styles.miniRating}><Ionicons name="star" size={12} color="#F59E0B" /> 4.9 (24 avaliações)</Text>
                                </View>
                            </View>
                            <View style={[styles.miniProfileCard, !isMobileWeb && {marginLeft: 30}]}>
                                <Image source={{uri: 'https://i.pravatar.cc/150?u=2'}} style={styles.miniAvatar} />
                                <View style={styles.miniInfo}>
                                    <Text style={styles.miniName}>José Carlos</Text>
                                    <Text style={styles.miniRole}>Jardineiro Especialista</Text>
                                    <Text style={styles.miniRating}><Ionicons name="star" size={12} color="#F59E0B" /> 4.8 (19 avaliações)</Text>
                                </View>
                            </View>
                            <View style={styles.miniProfileCard}>
                                <Image source={{uri: 'https://i.pravatar.cc/150?u=3'}} style={styles.miniAvatar} />
                                <View style={styles.miniInfo}>
                                    <Text style={styles.miniName}>Ana Maria</Text>
                                    <Text style={styles.miniRole}>Babá Certificada</Text>
                                    <Text style={styles.miniRating}><Ionicons name="star" size={12} color="#F59E0B" /> 5.0 (42 avaliações)</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.sectionTextCol}>
                        <Text style={styles.sectionHeadingLight}>{t('lander.choose_heading')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.choose_body_1')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.choose_body_2')}</Text>
                        <TouchableOpacity style={styles.btnSectionOutline} onPress={() => router.push('/auth/login')}>
                            <Text style={styles.btnSectionOutlineText}>{t('lander.choose_action')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ====== SECTION 4: SUPPORT (LIGHT) ====== */}
            <View ref={supportSectionRef} style={styles.sectionLight}>
                <Image source={require('../assets/images/support_bg.png')} style={[styles.sectionBgImage, {opacity: 0.1}]} resizeMode="cover" />
                <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobileReverse]}>
                    <View style={styles.sectionVisualCol}>
                        <View style={styles.supportCard}>
                            <Ionicons name="headset" size={48} color={Colors.primary} style={{ marginBottom: 20 }} />
                            <Text style={styles.supportCardTitle}>{t('lander.support_card_title')}</Text>
                            <Text style={styles.supportCardText}>{t('lander.support_card_text')}</Text>
                        </View>
                    </View>
                    <View style={styles.sectionTextCol}>
                        <Text style={styles.sectionHeadingLight}>{t('lander.support_heading')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.support_body_1')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.support_body_2')}</Text>
                        <TouchableOpacity style={[styles.btnSectionOutline, {borderColor: Colors.primary}]} onPress={() => router.push('/auth/login')}>
                            <Text style={[styles.btnSectionOutlineText, {color: Colors.primary}]}>{t('lander.support_action')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ====== SECTION 5: TESTIMONIALS (DARK) ====== */}
            <View ref={testimonialsRef} style={styles.darkSectionFull}>
                <View style={[styles.sectionContentRow, {flexDirection: 'column', gap: 40}]}>
                    <Text style={[styles.sectionHeadingDark, {textAlign: 'center'}]}>{t('lander.user_feedback_title')}</Text>
                    <View style={[styles.grid, isMobileWeb && styles.gridMobile]}>
                        {!loadingTestimonials && dynamicTestimonials.length > 0 ? (
                            dynamicTestimonials.map((item) => (
                                <View key={item.id} style={styles.testimoCard}>
                                    <View style={styles.testimoHeader}>
                                        <View style={styles.testimoAvatar}>
                                            {item.user_photo ? (
                                                <Image source={{ uri: item.user_photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                                            ) : (
                                                <Text style={{ fontWeight: '700' }}>{item.name?.[0]}</Text>
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.testimoName}>{item.name}</Text>
                                            <Text style={styles.testimoRole}>{item.role === 'WORKER' ? t('role_worker') : t('role_employer')}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.testimoQuote}>"{item.text}"</Text>
                                    <Text style={styles.stars}>
                                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <>
                                <View style={styles.testimoCard}>
                                    <View style={styles.testimoHeader}>
                                        <View style={styles.testimoAvatar}><Text style={{fontWeight: '700'}}>ES</Text></View>
                                        <View>
                                            <Text style={styles.testimoName}>Elena Sitoe</Text>
                                            <Text style={styles.testimoRole}>Empregadora - Maputo</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.testimoQuote}>"Consegui uma babá maravilhosa em menos de 2 dias. Ver o perfil verificado e as avaliações deu-me confiança para decidir rápido."</Text>
                                    <Text style={styles.stars}>★★★★★</Text>
                                </View>
                                <View style={styles.testimoCard}>
                                    <View style={styles.testimoHeader}>
                                        <View style={styles.testimoAvatar}><Text style={{fontWeight: '700'}}>AL</Text></View>
                                        <View>
                                            <Text style={styles.testimoName}>Armando Langa</Text>
                                            <Text style={styles.testimoRole}>Trabalhador - Matola</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.testimoQuote}>"Desde que entrei no Trabalhe Já, a minha agenda de jardinagem está sempre cheia. Recomendo a todos."</Text>
                                    <Text style={styles.stars}>★★★★★</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* ====== SECTION 6: ABOUT US (LIGHT) ====== */}
            <View ref={aboutUsRef} style={[styles.sectionLight, {backgroundColor: '#F3F4F6'}]}>
                <View style={styles.sectionContentRow}>
                    <View style={styles.sectionTextCol}>
                        <Text style={styles.sectionHeadingLight}>{t('lander.about_heading')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.about_body_1')}</Text>
                        <Text style={styles.sectionBodyLight}>{t('lander.about_body_2')}</Text>
                    </View>
                    {!isMobileWeb && (
                        <View style={styles.sectionVisualCol}>
                            <BrandWordmark variant="muted" />
                        </View>
                    )}
                </View>
            </View>

            {/* ====== FOOTER ====== */}
            <View style={styles.footer}>
                <View style={[styles.footerGrid, isMobileWeb && styles.gridMobile]}>
                    <View style={styles.footerCol}>
                        <View style={styles.footerBrand}>
                            <BrandWordmark variant="footer" />
                        </View>
                        <Text style={styles.footerDesc}>{t('lander.footer_desc')}</Text>
                        <View style={styles.socialIcons}>
                            <Ionicons name="globe-outline" size={20} color="#9CA3AF" />
                            <Ionicons name="logo-whatsapp" size={20} color="#9CA3AF" />
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                    <View style={styles.footerColLinks}>
                        <Text style={styles.footerTitle}>{t('lander.footer_company')}</Text>
                        <TouchableOpacity onPress={() => router.push('/info/about')}><Text style={styles.footerLink}>{t('lander.footer_about')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/info/coming-soon')}><Text style={styles.footerLink}>{t('lander.footer_careers')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/info/coming-soon')}><Text style={styles.footerLink}>{t('lander.footer_press')}</Text></TouchableOpacity>
                    </View>
                    <View style={styles.footerColLinks}>
                        <Text style={styles.footerTitle}>{t('lander.footer_support')}</Text>
                        <TouchableOpacity onPress={() => router.push('/info/help')}><Text style={styles.footerLink}>{t('lander.footer_help')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/info/privacy')}><Text style={styles.footerLink}>{t('lander.footer_privacy')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/info/terms')}><Text style={styles.footerLink}>{t('lander.footer_terms')}</Text></TouchableOpacity>
                    </View>
                </View>
                <View style={styles.footerBottom}>
                    <Text style={styles.footerBottomText}>© {new Date().getFullYear()} Trabalhe Já. Todos os direitos reservados.</Text>
                </View>
            </View>

        </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
    splashLogo: { width: 120, height: 120 },
    webContainer: { flex: 1, backgroundColor: '#FAFAFA' },

    // Navbar
    navbarFixed: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: '5%', paddingVertical: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.4)', // Slightly transparent dark
    },
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    navCenter: { flexDirection: 'row', gap: 24 },
    navLinkCenter: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    navRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    navRightTight: { gap: 8 },
    btnEntrar: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
    btnEntrarText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
    btnRegistar: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
    btnRegistarText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

    // Full Bleed Hero
    heroFull: {
        width: '100%', height: 650, position: 'relative',
        justifyContent: 'center', paddingHorizontal: '8%',
        backgroundColor: '#1C3134' // Fallback color
    },
    heroBgImage: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%', transition: 'opacity 0.8s ease-in-out' },
    heroOverlay: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
    heroContentOver: { position: 'relative', zIndex: 10, maxWidth: 800, marginTop: 60 },
    
    heroTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingRight: 12, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 20, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    heroTagBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginRight: 8 },
    heroTagBadgeText: { color: '#000', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    heroTagText: { color: Colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    
    heroTitleOver: { fontSize: 56, fontWeight: '900', color: Colors.white, lineHeight: 64, letterSpacing: -1.5, marginBottom: 20 },
    heroSubtitleOver: { fontSize: 16, color: '#D1D5DB', lineHeight: 26, marginBottom: 32, maxWidth: 600 },
    
    heroButtonsOver: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    btnHeroPrimary: { 
        backgroundColor: Colors.primary, 
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8,
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
            ios: { shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
            android: { elevation: 5 }
        })
    },
    btnHeroPrimaryText: { color: '#000', fontSize: 14, fontWeight: '800' },
    btnHeroSecondary: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8, borderWidth: 1 },
    btnHeroSecondaryText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
    
    heroTrustIndicators: { flexDirection: 'row', gap: 24 },
    trustText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

    // Generic Sections
    sectionLight: { paddingVertical: 100, paddingHorizontal: '8%', width: '100%', position: 'relative', overflow: 'hidden' },
    darkSectionFull: { paddingVertical: 100, paddingHorizontal: '8%', width: '100%', backgroundColor: '#0F172A', position: 'relative', overflow: 'hidden' },
    sectionBgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.15 },
    sectionDarkOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)' },
    
    sectionContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, alignSelf: 'center', width: '100%', zIndex: 10 },
    columnMobile: { flexDirection: 'column', gap: 40, alignItems: 'stretch' },
    columnMobileReverse: { flexDirection: 'column-reverse', gap: 40, alignItems: 'stretch' },
    
    sectionTextCol: { flex: 1, maxWidth: 550 },
    sectionVisualCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    
    sectionHeadingDark: { fontSize: 36, fontWeight: '800', color: Colors.white, marginBottom: 20, lineHeight: 44 },
    sectionHeadingLight: { fontSize: 36, fontWeight: '800', color: '#111', marginBottom: 20, lineHeight: 44 },
    sectionBodyDark: { fontSize: 16, color: '#9CA3AF', lineHeight: 28, marginBottom: 16 },
    sectionBodyLight: { fontSize: 16, color: Colors.textSecondary, lineHeight: 28, marginBottom: 16 },
    
    btnSectionAction: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 12 },
    btnSectionActionText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
    btnSectionOutline: { borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 12 },
    btnSectionOutlineText: { color: Colors.text, fontSize: 15, fontWeight: '700' },

    // Visual elements
    floatingPreviewCard: { 
        backgroundColor: Colors.white, padding: 24, borderRadius: 12, width: '100%', maxWidth: 350, alignSelf: 'center', 
        elevation: 10,
        ...Platform.select({
            web: { boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
            ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
            android: { elevation: 10 }
        })
    },
    previewDot: { color: '#E2E8F0', fontSize: 10, marginRight: 4 },
    previewHeader: { flexDirection: 'row', marginBottom: 16 },
    previewTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 16 },
    previewRow: { flexDirection: 'row', marginBottom: 8 },
    previewLabel: { width: 60, fontSize: 12, color: '#64748B', fontWeight: '600' },
    previewValue: { flex: 1, fontSize: 12, color: '#111', fontWeight: '500' },
    previewBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 12 },

    profilesGrid: { width: '100%', maxWidth: 450, gap: 16 },
    miniProfileCard: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 16, borderRadius: 12, 
        elevation: 2,
        ...Platform.select({
            web: { boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 }
        })
    },
    miniAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
    miniInfo: { flex: 1 },
    miniName: { fontSize: 15, fontWeight: '700', color: '#111' },
    miniRole: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    miniRating: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },

    paymentBadges: { flexDirection: 'row', gap: 12, marginTop: 12 },
    paymentBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    paymentBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },

    securitySealBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 40, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sealCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    sealIcon: { fontSize: 40 },
    sealTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
    sealSubtitle: { color: '#9CA3AF', fontSize: 13 },

    supportCard: { 
        backgroundColor: Colors.white, padding: 40, borderRadius: 24, alignItems: 'center', 
        elevation: 5,
        ...Platform.select({
            web: { boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
            default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 30 }
        })
    },
    supportEmoji: { fontSize: 48, marginBottom: 20 },
    supportCardTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12 },
    supportCardText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

    sectionTitle: { fontSize: 32, fontWeight: '800', color: '#111', marginBottom: 12 },
    sectionDivider: { width: 60, height: 4, backgroundColor: Colors.primary, marginBottom: 20, borderRadius: 2 },
    sectionSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', maxWidth: 600, marginBottom: 60, lineHeight: 22 },

    grid: { flexDirection: 'row', gap: 24, width: '100%', justifyContent: 'center' },
    gridMobile: { flexDirection: 'column' },

    // Cards
    card: { 
        flex: 1, backgroundColor: Colors.white, padding: 32, borderRadius: 16, 
        elevation: 2,
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.03)' },
            default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10 }
        })
    },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    cardIcon: { fontSize: 24 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    cardText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

    // Security Section (Old - being replaced but keeping names if referenced)
    securitySection: { paddingVertical: 60, paddingHorizontal: '5%', alignItems: 'center', backgroundColor: '#FAFAFA' },
    securityCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4',
        padding: 40, borderRadius: 24, maxWidth: 1100, width: '100%',
        borderWidth: 1, borderColor: '#DCFCE7',
    },
    securityCardMobile: { flexDirection: 'column', padding: 24 },
    securityLeft: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    securityLeftMobile: { marginBottom: 32 },
    shieldRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    shieldInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    shieldIcon: { fontSize: 40 },
    checkBadge: { 
        position: 'absolute', bottom: 5, right: 5, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', 
        ...Platform.select({
            web: { boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
            default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }
        })
    },
    checkIcon: { color: Colors.primary, fontSize: 18, fontWeight: '900' },
    securityRight: { flex: 2, paddingLeft: 40 },
    securityRightMobile: { paddingLeft: 0 },
    securityTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 16 },
    securityText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 24 },
    securityButtons: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
    btnSecPrimary: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 },
    btnSecPrimaryText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
    btnSecOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 },
    btnSecOutlineText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

    // Testimonials
    testimoCard: { flex: 1, backgroundColor: Colors.white, padding: 32, borderRadius: 16 },
    testimoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    testimoAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    testimoName: { fontSize: 15, fontWeight: '700', color: Colors.text },
    testimoRole: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
    testimoQuote: { fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 22, marginBottom: 16 },
    stars: { fontSize: 12 },

    // Footer
    footer: { backgroundColor: '#111827', paddingTop: 60, paddingBottom: 24 },
    footerGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '8%', maxWidth: 1200, alignSelf: 'center', width: '100%', marginBottom: 60, gap: 40 },
    footerCol: { flex: 2, minWidth: 250 },
    footerColLinks: { flex: 1, minWidth: 120 },
    footerColMap: { flex: 1.5, minWidth: 200 },
    footerBrand: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    footerDesc: { color: '#D1D5DB', fontSize: 14, lineHeight: 22, marginBottom: 20, maxWidth: 280 },
    socialIcons: { flexDirection: 'row', gap: 16 },
    socialIcon: { fontSize: 18, opacity: 0.7 },
    footerTitle: { color: Colors.white, fontSize: 14, fontWeight: '700', marginBottom: 20 },
    footerLink: { color: '#D1D5DB', fontSize: 14, marginBottom: 12 },
    mapBox: { height: 100, backgroundColor: '#1F2937', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    mapIcon: { fontSize: 24, opacity: 0.5 },
    footerBottom: { borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 24, alignItems: 'center' },
    footerBottomText: { color: '#9CA3AF', fontSize: 12 },
});
