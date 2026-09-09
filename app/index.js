import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, ActivityIndicator, useWindowDimensions, Animated, Linking } from 'react-native';
import { supabase } from '../services/supabase';
import { useRouter, Redirect } from 'expo-router';
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
            if (Platform.OS !== 'web') return;
            try {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('*, author:users!user_id(profile_photo)')
                    .in('status', ['APPROVED', 'APPROVED_HOME', 'APPROVED_BOTH'])
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (error) throw error;

                const formattedData = data?.map(item => ({
                    ...item,
                    user_photo: item.author?.profile_photo || null
                }));

                setDynamicTestimonials(formattedData || []);
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

    // Slider effect
    useEffect(() => {
        if (Platform.OS === 'web' && !user) {
            const interval = setInterval(() => {
                setCurrentImageIdx((prev) => (prev + 1) % sliderImages.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [user]);

    if (isLoading) {
        return (
            <View style={styles.splashContainer}>
                {/* Central Platform Graphic & Surrounding Users/Services (VidMate Style) */}
                <View style={styles.splashVidmateCenterBox}>
                    <View style={styles.splashCubeGlow} />

                    {/* Floating Service & User Badges around Kwick */}
                    <View style={[styles.splashFloatBadge, styles.badgeTopLeft]}>
                        <Ionicons name="code-slash" size={16} color={Colors.primary} />
                        <Text style={styles.splashBadgeText}>TI & Dev</Text>
                    </View>
                    <View style={[styles.splashFloatBadge, styles.badgeTopRight]}>
                        <Ionicons name="color-palette" size={16} color="#EC4899" />
                        <Text style={styles.splashBadgeText}>Design</Text>
                    </View>
                    <View style={[styles.splashFloatBadge, styles.badgeBottomLeft]}>
                        <Ionicons name="construct" size={16} color="#F59E0B" />
                        <Text style={styles.splashBadgeText}>Serviços</Text>
                    </View>
                    <View style={[styles.splashFloatBadge, styles.badgeBottomRight]}>
                        <Ionicons name="school" size={16} color="#10B981" />
                        <Text style={styles.splashBadgeText}>Formação</Text>
                    </View>

                    {/* Center Kwick Box */}
                    <View style={styles.splashCenterCube}>
                        <BrandWordmark variant="default" layout="inline" showIcon />
                    </View>
                </View>

                {/* Slogan Text (VidMate style slogan) */}
                <View style={styles.splashTextContainer}>
                    <Text style={styles.splashSloganTitle}>Conecta & Contrata</Text>
                    <Text style={styles.splashSloganSubtitle}>
                        A plataforma que une milhares de clientes e profissionais em todo o país.
                    </Text>
                </View>

                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 24 }} />
            </View>
        );
    }

    if (user) {
        if (user.role === 'PENDING') {
            return <Redirect href="/auth/choose-profile" />;
        }
        return <Redirect href="/(tabs)/home" />;
    }

    if (Platform.OS !== 'web') {
        if (!isOnboarded) {
            return <Redirect href="/onboarding" />;
        } else {
            return <Redirect href="/auth/choose-type" />;
        }
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
                        <TouchableOpacity onPress={() => router.push('/info/about')}>
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
                            Encontre. Contrate. Trabalhe. <Text style={{ color: '#10B981' }}>Em um único aplicativo.</Text>
                        </Text>
                        <Text style={styles.heroSubtitleOver}>
                            A maior plataforma de serviços de Moçambique.
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
                {/* ====== SECTION: GRID OF FEATURES ====== */}
                <View style={[styles.darkSectionFull, { backgroundColor: '#003B24', paddingVertical: 80 }]}>
                    <Text style={[styles.sectionHeadingDark, { textAlign: 'center', fontSize: 40 }]}>
                        Tudo o que <Text style={{ color: '#10B981' }}>precisa</Text>
                    </Text>
                    <Text style={[styles.sectionBodyDark, { textAlign: 'center', alignSelf: 'center', maxWidth: 600, color: '#A7F3D0', marginBottom: 60, fontSize: 18 }]}>
                        Um único aplicativo para procurar, contratar profissionais e encontrar trabalho. Esqueça os problemas de confiança.
                    </Text>
                    
                    <View style={[styles.featuresGrid, isMobileWeb && { gridTemplateColumns: '1fr' }]}>
                        {/* CARD 1 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Ionicons name="star" size={24} color="#10B981" /></View>
                            <Text style={styles.featureTitle}>Profissionais qualificados</Text>
                            <Text style={styles.featureText}>Encontre trabalhadores verificados e experientes para qualquer tarefa doméstica e empresarial.</Text>
                        </View>
                        {/* CARD 2 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Ionicons name="chatbubbles" size={24} color="#3B82F6" /></View>
                            <Text style={styles.featureTitle}>Mensagens Integradas</Text>
                            <Text style={styles.featureText}>Comunique-se diretamente com clientes e profissionais de forma rápida e segura no aplicativo.</Text>
                        </View>
                        {/* CARD 3 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Ionicons name="briefcase" size={24} color="#F59E0B" /></View>
                            <Text style={styles.featureTitle}>Mais de 500 Serviços</Text>
                            <Text style={styles.featureText}>Para clientes e profissionais: encontre desde jardinagem até TI num só lugar.</Text>
                        </View>
                        {/* CARD 4 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Ionicons name="shield-checkmark" size={24} color="#10B981" /></View>
                            <Text style={styles.featureTitle}>Total segurança</Text>
                            <Text style={styles.featureText}>Verificação de documentos, identidade e suporte garantido em caso de conflitos.</Text>
                        </View>
                        {/* CARD 5 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Text style={{ color: '#06B6D4', fontSize: 20, fontWeight: '900' }}>W</Text></View>
                            <Text style={styles.featureTitle}>M-Pesa & e-Mola</Text>
                            <Text style={styles.featureText}>Envie e receba dinheiro pelas plataformas mais populares, tudo integrado.</Text>
                        </View>
                        {/* CARD 6 */}
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}><Ionicons name="star-half" size={24} color="#F59E0B" /></View>
                            <Text style={styles.featureTitle}>Recomendações</Text>
                            <Text style={styles.featureText}>Avaliações reais que dão confiança tanto a quem contrata como a quem trabalha.</Text>
                        </View>
                    </View>
                </View>

                {/* ====== SECTION 1: ENCONTRE TRABALHO ====== */}
                <View style={[styles.darkSectionFull, { backgroundColor: '#0F172A' }]}>
                    <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobile]}>
                        <View style={styles.sectionTextCol}>
                            <Text style={styles.sectionHeadingDark}>Encontre trabalho em minutos</Text>
                            <Text style={styles.sectionBodyDark}>
                                É simples e gratuito! Centenas de clientes estão à procura de profissionais qualificados. Crie o seu perfil, defina as suas habilidades e comece a receber propostas.
                            </Text>
                            <Text style={styles.sectionBodyDark}>
                                Desde reparações elétricas a remodelações e TI, o Kwick ajuda-o a conseguir a oportunidade certa para si.
                            </Text>
                            <TouchableOpacity style={styles.btnSectionAction} onPress={() => router.push({ pathname: '/auth/register', params: { role: 'WORKER' } })}>
                                <Text style={styles.btnSectionActionText}>Encontrar Trabalho</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.sectionVisualCol}>
                            <View style={[styles.floatingPreviewCard, { backgroundColor: '#1E293B' }]}>
                                <View style={styles.previewHeader}>
                                    <Text style={styles.previewDot}>●</Text>
                                    <Text style={styles.previewDot}>●</Text>
                                </View>
                                <Text style={[styles.previewTitle, { color: Colors.white }]}>O seu Perfil Profissional</Text>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Vagas:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Eletricista / Canalizador</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Local:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Maputo / Matola</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Disponib.:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Imediata</Text>
                                </View>
                                <View style={[styles.previewBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981' }}>PERFIL VERIFICADO</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ====== SECTION 2: PUBLIQUE A SUA VAGA ====== */}
                <View style={[styles.darkSectionFull, { backgroundColor: '#1C3134' }]}>
                    <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobileReverse]}>
                        <View style={styles.sectionVisualCol}>
                            <View style={[styles.floatingPreviewCard, { backgroundColor: '#1E293B' }]}>
                                <View style={styles.previewHeader}>
                                    <Text style={styles.previewDot}>●</Text>
                                    <Text style={styles.previewDot}>●</Text>
                                </View>
                                <Text style={[styles.previewTitle, { color: Colors.white }]}>Nova Vaga de Trabalho</Text>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Tipo:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Pintor / Pedreiro</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Local:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Sommerschield, Maputo</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Turnos:</Text>
                                    <Text style={[styles.previewValue, { color: '#F1F5F9' }]}>Projeto Completo</Text>
                                </View>
                                <View style={[styles.previewBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>RECOMENDADO</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sectionTextCol}>
                            <Text style={styles.sectionHeadingDark}>Publique a sua vaga em minutos</Text>
                            <Text style={styles.sectionBodyDark}>
                                É simples e gratuito! Milhares de profissionais qualificados estão à espera de oportunidades. Descreva as suas necessidades, defina o seu orçamento e comece a receber propostas em poucos minutos.
                            </Text>
                            <Text style={styles.sectionBodyDark}>
                                Desde limpezas profundas a instalações técnicas, o Kwick ajuda-o a encontrar a pessoa certa para o seu projeto.
                            </Text>
                            <TouchableOpacity style={styles.btnSectionAction} onPress={() => router.push({ pathname: '/auth/register', params: { role: 'EMPLOYER' } })}>
                                <Text style={styles.btnSectionActionText}>Publicar Vaga Grátis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ====== SECTION 3: ESCOLHA O PROFISSIONAL E SUPORTE ====== */}
                <View style={styles.sectionLight}>
                    <View style={[styles.sectionContentRow, isMobileWeb && styles.columnMobile, { marginBottom: 120 }]}>
                        <View style={styles.sectionVisualCol}>
                            <View style={styles.profilesGrid}>
                                <View style={styles.miniProfileCard}>
                                    <View style={[styles.miniAvatar, { backgroundColor: '#DBEAFE' }]}><Ionicons name="person" size={24} color="#3B82F6" /></View>
                                    <View style={styles.miniInfo}>
                                        <Text style={styles.miniName}>João Silva</Text>
                                        <Text style={styles.miniRole}>Eletricista</Text>
                                        <Text style={styles.miniRating}>★ 4.9 (24 avaliações)</Text>
                                    </View>
                                </View>
                                <View style={[styles.miniProfileCard, { marginLeft: 20 }]}>
                                    <View style={[styles.miniAvatar, { backgroundColor: '#FCE7F3' }]}><Ionicons name="person" size={24} color="#EC4899" /></View>
                                    <View style={styles.miniInfo}>
                                        <Text style={styles.miniName}>Ana Rita</Text>
                                        <Text style={styles.miniRole}>Designer Gráfica</Text>
                                        <Text style={styles.miniRating}>★ 4.8 (19 avaliações)</Text>
                                    </View>
                                </View>
                                <View style={styles.miniProfileCard}>
                                    <View style={[styles.miniAvatar, { backgroundColor: '#FEF3C7' }]}><Ionicons name="person" size={24} color="#F59E0B" /></View>
                                    <View style={styles.miniInfo}>
                                        <Text style={styles.miniName}>Marcos Paulo</Text>
                                        <Text style={styles.miniRole}>Pedreiro Especialista</Text>
                                        <Text style={styles.miniRating}>★ 5.0 (42 avaliações)</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sectionTextCol}>
                            <Text style={styles.sectionHeadingLight}>Escolha o profissional ideal</Text>
                            <Text style={styles.sectionBodyLight}>
                                Nenhum trabalho é demasiado pequeno. Temos milhares de profissionais para serviços de qualquer dimensão, em dezenas de especialidades.
                            </Text>
                            <Text style={styles.sectionBodyLight}>
                                Consulte perfis detalhados, verifique referências reais e analise o histórico de trabalhos concluídos antes de tomar uma decisão.
                            </Text>
                            <TouchableOpacity style={[styles.btnSectionOutline, { borderColor: Colors.primary }]} onPress={() => router.push('/auth/login')}>
                                <Text style={[styles.btnSectionOutlineText, { color: Colors.primary }]}>Ver Profissionais Verificados</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View ref={supportSectionRef} style={[styles.sectionContentRow, isMobileWeb && styles.columnMobileReverse]}>
                        <View style={styles.sectionTextCol}>
                            <Text style={styles.sectionHeadingLight}>Estamos aqui para ajudar</Text>
                            <Text style={styles.sectionBodyLight}>
                                O seu tempo é precioso. Deixe que a nossa equipa de mediadores e especialistas o ajude a poupar tempo na seleção de talentos.
                            </Text>
                            <Text style={styles.sectionBodyLight}>
                                Desde a verificação de documentos até ao apoio em caso de conflitos, o Kwick é o seu parceiro para ligar oferta e procura de trabalho.
                            </Text>
                            <TouchableOpacity style={[styles.btnSectionOutline, { borderColor: '#111' }]} onPress={() => router.push('/info/help')}>
                                <Text style={[styles.btnSectionOutlineText, { color: '#111' }]}>Falar com Suporte</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.sectionVisualCol}>
                            <View style={[styles.supportCard, { backgroundColor: '#1E293B' }]}>
                                <Ionicons name="headset" size={48} color="#10B981" style={{ marginBottom: 20 }} />
                                <Text style={[styles.supportCardTitle, { color: Colors.white }]}>Suporte Local 24/7</Text>
                                <Text style={[styles.supportCardText, { color: '#9CA3AF' }]}>
                                    Estamos aqui para ajudar com qualquer dúvida ou mediação necessária.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ====== SECTION: COMO FUNCIONA ====== */}
                <View ref={howItWorksRef} style={[styles.darkSectionFull, { backgroundColor: '#0F2C1F', paddingVertical: 100 }]}>
                    <Text style={[styles.sectionHeadingDark, { textAlign: 'center', fontSize: 40 }]}>
                        Como <Text style={{ color: '#F97316' }}>funciona</Text> ?
                    </Text>
                    <Text style={[styles.sectionBodyDark, { textAlign: 'center', alignSelf: 'center', maxWidth: 600, color: '#A7F3D0', marginBottom: 80, fontSize: 18 }]}>
                        Em 3 passos simples, você estará pronto para usar o Kwick.
                    </Text>

                    <View style={[styles.stepsContainer, isMobileWeb && { flexDirection: 'column', gap: 60 }]}>
                        {/* Step 1 */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepCircle}><Text style={styles.stepNumber}>1</Text></View>
                            <Ionicons name="phone-portrait-outline" size={24} color="#A7F3D0" style={{ marginBottom: 16 }} />
                            <Text style={styles.stepTitle}>Inscrever-se</Text>
                            <Text style={styles.stepText}>Crie sua conta em 30 segundos e obtenha seu perfil verificado.</Text>
                        </View>
                        {/* Step 2 */}
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, { backgroundColor: '#84CC16', borderColor: 'rgba(132, 204, 22, 0.2)', borderWidth: 8 }]}><Text style={styles.stepNumberActive}>2</Text></View>
                            <Ionicons name="search-outline" size={24} color="#A7F3D0" style={{ marginBottom: 16 }} />
                            <Text style={styles.stepTitle}>Explorar Serviços e Vagas</Text>
                            <Text style={styles.stepText}>Encontre profissionais qualificados ou publique vagas e serviços num único clique.</Text>
                        </View>
                        {/* Step 3 */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
                            <Ionicons name="briefcase-outline" size={24} color="#A7F3D0" style={{ marginBottom: 16 }} />
                            <Text style={styles.stepTitle}>Contratar e Avaliar</Text>
                            <Text style={styles.stepText}>Converse com clientes e profissionais, contrate com segurança e dê recomendações.</Text>
                        </View>
                    </View>
                </View>

                {/* ====== SECTION: TESTIMONIALS ====== */}
                <View ref={testimonialsRef} style={[styles.sectionLight, { backgroundColor: '#FAFAFA' }]}>
                    <Text style={[styles.sectionHeadingLight, { textAlign: 'center', marginBottom: 60 }]}>
                        O que dizem os nossos utilizadores
                    </Text>
                    {loadingTestimonials ? (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    ) : dynamicTestimonials.length > 0 ? (
                        <View style={[styles.grid, isMobileWeb && styles.gridMobile, { flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1200, alignSelf: 'center' }]}>
                            {dynamicTestimonials.slice(0, 3).map((item, idx) => (
                                <View key={idx} style={[styles.testimoCard, { minWidth: 300, maxWidth: 350 }]}>
                                    <View style={styles.testimoHeader}>
                                        <View style={styles.testimoAvatar}>
                                            <Ionicons name="person" size={20} color="#9CA3AF" />
                                        </View>
                                        <View>
                                            <Text style={styles.testimoName}>{item.author?.name || 'Utilizador Kwick'}</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Ionicons key={i} name="star" size={14} color={i < (item.rating || 5) ? '#F59E0B' : '#E5E7EB'} />
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.testimoQuote}>"{item.content}"</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.sectionBodyLight, { textAlign: 'center' }]}>Ainda não há depoimentos publicados.</Text>
                    )}
                </View>

                {/* ====== SECTION: DOWNLOAD ====== */}
                <View style={[styles.sectionLight, { backgroundColor: '#FAFAFA' }]}>
                    <View style={styles.downloadCard}>
                        <Text style={styles.downloadTitle}>
                            Junte-se ao <Text style={{ color: '#84CC16' }}>Kwick</Text> agora
                        </Text>
                        <Text style={styles.downloadText}>
                            Baixe o aplicativo gratuitamente e comece a procurar serviços, contratar profissionais e trabalhar hoje mesmo.
                        </Text>
                        <View style={[styles.downloadButtons, isMobileWeb && { flexDirection: 'column' }]}>
                            <TouchableOpacity style={styles.downloadBtn}>
                                <Ionicons name="logo-google-playstore" size={24} color="#FFF" />
                                <View>
                                    <Text style={styles.downloadBtnLabel}>Adquira já!</Text>
                                    <Text style={styles.downloadBtnValue}>Google Play</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.downloadBtn}>
                                <Ionicons name="logo-apple" size={24} color="#FFF" />
                                <View>
                                    <Text style={styles.downloadBtnLabel}>Em breve no</Text>
                                    <Text style={styles.downloadBtnValue}>iPhone</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.downloadBtn} onPress={() => router.push('/auth/login')}>
                                <Ionicons name="globe-outline" size={24} color="#FFF" />
                                <View>
                                    <Text style={styles.downloadBtnLabel}>Usar em</Text>
                                    <Text style={styles.downloadBtnValue}>Aplicativo Web</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
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
                            <TouchableOpacity onPress={() => router.push('/info/careers')}><Text style={styles.footerLink}>{t('lander.footer_careers')}</Text></TouchableOpacity>
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
                        <Text style={styles.footerBottomText}>© {new Date().getFullYear()} Kwick. Todos os direitos reservados ao <Text onPress={() => Linking.openURL('https://studio-do-scott-ps2k.vercel.app/')} style={{ color: Colors.primary }}>Studio do Scott</Text>.</Text>
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
        backgroundColor: '#10B981', // bright green for better visibility
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8,
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
            ios: { shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 10 },
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

    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, width: '100%', maxWidth: 1200, alignSelf: 'center' },
    featureCard: {
        backgroundColor: '#0F2C1F', 
        padding: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#194A34',
        alignItems: 'flex-start',
        width: Platform.OS === 'web' ? 'calc(33.333% - 16px)' : '100%',
        minWidth: 280,
    },
    featureIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#A7F3D0',
        lineHeight: 24,
    },

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

    // Steps (Como funciona)
    stepsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 1000, width: '100%', alignSelf: 'center', marginTop: 40 },
    stepItem: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
    stepCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, zIndex: 2 },
    stepNumber: { fontSize: 24, fontWeight: '800', color: '#64748B' },
    stepNumberActive: { fontSize: 24, fontWeight: '900', color: '#0F2C1F' },
    stepTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 12, textAlign: 'center' },
    stepText: { fontSize: 15, color: '#A7F3D0', textAlign: 'center', lineHeight: 24 },
    stepLine: { position: 'absolute', top: 32, left: '16%', right: '16%', height: 2, backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 1 },

    // Download Section
    downloadCard: { backgroundColor: '#003B24', padding: 60, borderRadius: 32, alignItems: 'center', maxWidth: 1000, width: '100%', alignSelf: 'center' },
    downloadTitle: { fontSize: 40, fontWeight: '900', color: Colors.white, marginBottom: 24, textAlign: 'center' },
    downloadText: { fontSize: 18, color: '#A7F3D0', textAlign: 'center', maxWidth: 600, marginBottom: 48, lineHeight: 28 },
    downloadButtons: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 12 },
    downloadBtnLabel: { fontSize: 11, color: '#A7F3D0', textTransform: 'uppercase', fontWeight: '700' },
    downloadBtnValue: { fontSize: 18, color: Colors.white, fontWeight: '800' },

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
    footer: { backgroundColor: '#003B24', paddingTop: 60, paddingBottom: 24 },
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

    // Splash Screen (VidMate Style)
    splashContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 24 },
    splashVidmateCenterBox: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', position: 'relative', marginVertical: 32 },
    splashCubeGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: Colors.primary + '15' },
    splashFloatBadge: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
    badgeTopLeft: { top: 10, left: 0 },
    badgeTopRight: { top: 10, right: 0 },
    badgeBottomLeft: { bottom: 10, left: 0 },
    badgeBottomRight: { bottom: 10, right: 0 },
    splashBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.text },
    splashCenterCube: { width: 140, height: 70, backgroundColor: Colors.white, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, borderWidth: 1, borderColor: Colors.primary + '20' },
    splashTextContainer: { alignItems: 'center', paddingHorizontal: 32, marginTop: 12 },
    splashSloganTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 8 },
    splashSloganSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
});
