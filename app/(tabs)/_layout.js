import { Tabs, Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, TextInput, StyleSheet, Platform, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Colors, Fonts, Spacing, PROFESSION_CATEGORIES, JOB_TYPES } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import React, { useState, useMemo, useEffect } from 'react';
import { useAuthGuard } from '../../utils/useAuthGuard';
import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function TabIcon({ icon, focused, badge }) {
    return (
        <View style={styles.tabItem}>
            <View style={{ position: 'relative' }}>
                <Ionicons name={focused ? icon : `${icon}-outline`} size={26} color={focused ? Colors.primary : Colors.textLight} />
                {badge > 0 && (
                    <View style={styles.mobileBadge}>
                        <Text style={styles.mobileBadgeText}>{badge > 9 ? '9+' : badge}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function WebNavIcon({ icon, label, route, isActive, onPress, badge, isSmall }) {
    if (!icon) return null;

    return (
        <TouchableOpacity onPress={onPress} style={[styles.webNavIconBox, isSmall && { minWidth: 50, paddingHorizontal: 10 }]}>
            <View style={styles.webNavIconInner}>
                <Ionicons name={isActive ? icon : `${icon}-outline`} size={isSmall ? 20 : 26} color={isActive ? Colors.text : '#666666'} />
                {badge > 0 && (
                    <View style={styles.webNavBadge}>
                        <Text style={styles.webNavBadgeText}>{badge > 9 ? '9+' : badge}</Text>
                    </View>
                )}
            </View>
            {!isSmall && <Text style={[styles.webNavIconLabel, { fontSize: 11, marginTop: 2 }, isActive && styles.webNavIconLabelActive]}>{label}</Text>}
            {isActive && <View style={styles.webNavActiveBar} />}
        </TouchableOpacity>
    );
}

function WebNavbar({ isSmall, isMobile, unreadMessages, unreadNotifications }) {
    const { user, logout } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const router = useRouter();
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showBusinessMenu, setShowBusinessMenu] = useState(false);
    const { t } = useTranslation();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const SUGGESTIONS = useMemo(() => {
        const categories = PROFESSION_CATEGORIES.filter(c => c !== 'Outro');
        const jobs = JOB_TYPES.filter(j => j !== 'Outro');
        return [...new Set([...categories, ...jobs])];
    }, []);

    const filteredSuggestions = searchQuery.trim().length > 0
        ? SUGGESTIONS.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
        : [];

    const handleSearchSubmit = (term) => {
        setShowSuggestions(false);
        if (!term) return;
        router.push(`/search?q=${encodeURIComponent(term)}`);
        setSearchQuery('');
    };

    const closeAllMenus = () => {
        setShowProfileMenu(false);
        setShowBusinessMenu(false);
        setShowSuggestions(false);
    };

    const navItems = [
        { label: t('tabs.home'), icon: 'home', route: '/home' },
        { label: 'Minha Rede', icon: 'people', route: '/network' },
        { label: t('tabs.search'), icon: 'search', route: '/search' },
        { label: t('tabs.jobs'), icon: 'briefcase', route: '/jobs' },
        { label: t('tabs.messages'), icon: 'chatbubble-ellipses', route: '/messages' },
        { label: t('tabs.notifications'), icon: 'notifications', route: '/notifications' },
    ];

    return (
        <View style={{ zIndex: 1001 }}>
            {/* Click Outside Overlay */}
            {(showProfileMenu || showBusinessMenu || showSuggestions) && (
                <TouchableOpacity
                    style={styles.webMenuOverlay}
                    activeOpacity={1}
                    onPress={closeAllMenus}
                />
            )}

            <View style={styles.webNavbar}>
                <View style={styles.webNavInner}>
                    {/* Left: Logo + Search */}
                    <View style={styles.webNavLeft}>
                        <TouchableOpacity onPress={() => { router.push('/(tabs)/home'); closeAllMenus(); }} style={styles.webLogoContainer}>
                            <Image source={require('../../assets/images/logo.png')} style={styles.webLogo} resizeMode="contain" />
                            {!isMobile && <Text style={styles.webBrandText}>Mão Segura</Text>}
                        </TouchableOpacity>
                        {!isMobile && (
                            <View style={[styles.webSearchBox, { zIndex: 9999 }]}>
                                <Ionicons name="search" size={18} color="#C7C7C7" style={styles.webSearchIcon} />
                                <TextInput
                                    style={styles.webSearchInput}
                                    placeholder="Pesquisar..."
                                    placeholderTextColor="#C7C7C7"
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        setShowSuggestions(text.length > 0);
                                    }}
                                    onSubmitEditing={() => handleSearchSubmit(searchQuery)}
                                    onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                                />
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <View style={styles.searchSuggestions}>
                                        {filteredSuggestions.map((sug, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    setSearchQuery(sug);
                                                    handleSearchSubmit(sug);
                                                }}
                                            >
                                                <Ionicons name="search-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                                                <Text style={styles.suggestionText}>{sug}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Center & Right: Nav items and Profile grouped */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
                        <View style={[styles.webNavCenter, { overflow: 'visible', gap: isMobile ? 0 : 8 }]}>
                            {navItems.map(item => (
                                <WebNavIcon
                                    key={item.route}
                                    icon={item.icon}
                                    label={item.label}
                                    isSmall={isSmall}
                                    isActive={pathname?.endsWith(item.route)}
                                    badge={item.route === '/messages' ? unreadMessages : (item.route === '/notifications' ? unreadNotifications : 0)}
                                    onPress={() => {
                                        if (['/messages', '/notifications'].includes(item.route)) {
                                            if (!requireAuth()) {
                                                closeAllMenus();
                                                return;
                                            }
                                        }
                                        router.push(`/(tabs)${item.route}`);
                                        closeAllMenus();
                                    }}
                                />
                            ))}
                        </View>

                    <View style={styles.navDivider} />

                    {/* Right: Profile Button */}
                    <View style={[styles.webNavRight, { overflow: 'visible' }]}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!requireAuth()) {
                                    closeAllMenus();
                                    return;
                                }
                                const next = !showProfileMenu;
                                closeAllMenus();
                                setShowProfileMenu(next);
                            }}
                            style={styles.webProfileBtn}
                        >
                            <View style={styles.webProfileAvatar}>
                                {user?.profile_photo ? (
                                    <Image source={{ uri: user.profile_photo }} style={styles.webProfileAvatarImage} />
                                ) : (
                                    <Text style={styles.webProfileAvatarText}>{user?.name?.[0] || '?'}</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {showProfileMenu && (
                            <View style={styles.webProfileDropdown}>
                                <View style={styles.profileDropdownHeader}>
                                    <View style={styles.dropdownAvatar}>
                                        {user?.profile_photo ? (
                                            <Image source={{ uri: user.profile_photo }} style={styles.dropdownAvatarImage} />
                                        ) : (
                                            <Text style={styles.dropdownAvatarText}>{user?.name?.[0] || '?'}</Text>
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.dropdownName}>{user?.name}</Text>
                                        <Text style={styles.dropdownRole}>
                                            {user?.role === 'WORKER'
                                                ? `${user?.profession_category || 'Trabalhador'}`
                                                : 'Empregador'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.dropdownViewProfile}
                                    onPress={() => { closeAllMenus(); router.push('/(tabs)/profile'); }}
                                >
                                    <Text style={styles.dropdownViewProfileText}>{t('common.view_profile')}</Text>
                                </TouchableOpacity>
                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => { closeAllMenus(); router.push('/settings/edit-profile'); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="create-outline" size={16} color={Colors.text} />
                                        <Text style={styles.dropdownItemText}>{t('common.edit_profile')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => { closeAllMenus(); router.push('/settings/premium'); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="star" size={16} color={Colors.premium} />
                                        <Text style={styles.dropdownItemText}>{t('common.premium')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => { closeAllMenus(); router.push('/info/help'); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="help-circle-outline" size={16} color={Colors.text} />
                                        <Text style={styles.dropdownItemText}>{t('common.help')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => { closeAllMenus(); router.push('/info/terms'); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="document-text-outline" size={16} color={Colors.text} />
                                        <Text style={styles.dropdownItemText}>{t('common.terms')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        closeAllMenus();
                                        logout();
                                        router.replace('/');
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="log-out-outline" size={16} color={Colors.error} />
                                        <Text style={[styles.dropdownItemText, { color: Colors.error }]}>{t('common.logout')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
                </View>
            </View>
        </View>
    );
}


export default function TabLayout() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 768;
    const isMobileWeb = width < 480;

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        if (!user) {
            setUnreadMessages(0);
            setUnreadNotifications(0);
            return;
        }

        // Message unread listener
        const fieldMatch = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
        const qMsg = query(collection(db, 'chat_conversations'), where(fieldMatch, '==', user.uid));
        
        const unsubMsg = onSnapshot(qMsg, (snap) => {
            let total = 0;
            snap.forEach(d => {
                const data = d.data();
                if (data.unread_count && data.unread_count[user.uid]) {
                    total += data.unread_count[user.uid];
                }
            });
            setUnreadMessages(total);
        }, (err) => {
            console.log('Chat listener permission error (non-critical):', err.code);
            setUnreadMessages(0);
        });

        // Notification unread listener
        const qNotif = query(collection(db, 'notifications'), where('user_id', '==', user.uid), where('read', '==', false));
        const unsubNotif = onSnapshot(qNotif, (snap) => {
            setUnreadNotifications(snap.size);
        });

        return () => {
            unsubMsg();
            unsubNotif();
        };
    }, [user?.uid]);

    if (Platform.OS === 'web') {
        return (
            <View style={styles.webLayout}>
                <WebNavbar isSmall={isSmallScreen} isMobile={isMobileWeb} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
                <View style={styles.webContent}>
                    <Slot />
                </View>
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: '#F4F2EE',
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: t('tabs.home'),
                    headerShown: Platform.OS === 'web', // Hide on mobile for custom animated header
                    tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.home')} icon="home" focused={focused} />,
                }}
            />

            <Tabs.Screen
                name="network"
                options={{
                    title: 'Minha Rede',
                    headerShown: Platform.OS === 'web',
                    tabBarIcon: ({ focused }) => <TabIcon label="Rede" icon="people" focused={focused} />,
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title: t('tabs.search'),
                    href: null, // Hide from bottom tabs
                    tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.search')} icon="search" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="jobs"
                options={{
                    title: t('tabs.jobs'),
                    headerShown: Platform.OS === 'web', // Hide on mobile
                    tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.jobs')} icon="briefcase" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <TouchableOpacity
                            style={styles.fabTab}
                            onPress={() => {
                                if (requireAuth()) {
                                    router.push(user?.role === 'EMPLOYER' ? '/job/create' : '/post/create');
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.fabButton}>
                                <Ionicons name="add" size={28} color={Colors.white} />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        if (requireAuth()) {
                            router.push(user?.role === 'EMPLOYER' ? '/job/create' : '/post/create');
                        }
                    },
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: t('tabs.messages'),
                    headerShown: Platform.OS === 'web', // Hide on mobile
                    tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.messages')} icon="chatbubble-ellipses" focused={focused} badge={unreadMessages} />,
                }}
                listeners={{
                    tabPress: (e) => {
                        if (!user) {
                            e.preventDefault();
                            requireAuth();
                        }
                    },
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: t('tabs.notifications'),
                    headerShown: Platform.OS === 'web', // Hide on mobile
                    href: null, // Removed from bottom tabs
                }}
                listeners={{
                    tabPress: (e) => {
                        if (!user) {
                            e.preventDefault();
                            requireAuth();
                        }
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tabs.profile'),
                    headerShown: Platform.OS === 'web', // Hide on mobile
                    tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.profile')} icon="person" focused={focused} />,
                }}
                listeners={{
                    tabPress: (e) => {
                        if (!user) {
                            e.preventDefault();
                            requireAuth();
                        }
                    },
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    // Mobile tab styles
    tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
    tabItemActive: {},
    emoji: { fontSize: 22, marginBottom: 2 },
    tabLabel: { fontSize: 10, color: Colors.textLight, fontWeight: '500' },
    tabLabelActive: { color: Colors.primary, fontWeight: '700' },

    mobileBadge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    mobileBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },

    // FAB Create Button in Tab Bar
    fabTab: { alignItems: 'center', justifyContent: 'center', marginTop: -20 },
    fabButton: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
    },

    // === Web Layout ===
    webLayout: { flex: 1, backgroundColor: '#F4F2EE' },
    webContent: { flex: 1, width: '100%', backgroundColor: '#F4F2EE' },

    // === Web Navbar (LinkedIn-style) ===
    webNavbar: {
        backgroundColor: Colors.white,
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: '#E0DFDC',
        zIndex: 1001,
        position: 'sticky',
        top: 0,
        overflow: 'visible',
    },
    webNavInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1300,
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        height: '100%',
    },

    // Left: Logo + Search
    webNavLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 20 },
    webLogoContainer: { marginRight: 16, flexDirection: 'row', alignItems: 'center' },
    webLogo: { width: 44, height: 44, marginRight: 10, borderRadius: 10 },
    webBrandText: { fontSize: 24, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
    webSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 12,
        height: 42,
        flex: 1,
        maxWidth: 550,
        borderWidth: 1,
        borderColor: '#E0DFDC',
    },
    webSearchIcon: { marginRight: 8, marginLeft: 6 },
    webSearchInput: {
        flex: 1, backgroundColor: 'transparent', height: '100%',
        borderWidth: 0, outlineStyle: 'none', color: Colors.text, fontSize: 13,
    },
    // Search dropdown
    searchSuggestions: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 1000,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    suggestionText: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '500',
    },
    navDivider: {
        width: 1, height: 40, backgroundColor: '#E0DFDC', marginHorizontal: 10
    },

    // Center: Nav icons
    webNavCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        overflow: 'visible',
    },
    webNavIconBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 0,
        height: 70,
        minWidth: 64,
        position: 'relative',
    },
    webNavIconInner: { position: 'relative', marginBottom: 4 },
    webNavIconEmoji: { fontSize: 24 },
    webNavBadge: {
        position: 'absolute', top: -6, right: -10,
        backgroundColor: Colors.error,
        borderRadius: 9, minWidth: 18, height: 18,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4,
    },
    webNavBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
    webNavIconLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 0 },
    webNavIconLabelActive: { color: Colors.primary, fontWeight: '600' },
    webNavActiveBar: {
        position: 'absolute',
        bottom: 0, left: 10, right: 10,
        height: 3,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },

    // Right: Profile
    webNavRight: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
    webProfileBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 20,
    },
    webProfileAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 6,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    webProfileAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
    webProfileAvatarImage: { width: 36, height: 36, borderRadius: 18 },
    webProfileName: { fontSize: 14, fontWeight: '500', color: Colors.text, maxWidth: 90 },
    webProfileCaret: { fontSize: 10, color: Colors.textLight, marginLeft: 4 },

    // Profile dropdown
    webProfileDropdown: {
        position: 'absolute',
        top: 64,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 10,
        width: 260,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        paddingVertical: 8,
        zIndex: 2000,
    },
    profileDropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownAvatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    dropdownAvatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
    dropdownAvatarImage: { width: 48, height: 48, borderRadius: 24 },
    dropdownName: { fontSize: 15, fontWeight: '700', color: Colors.text },
    dropdownRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    dropdownViewProfile: {
        marginHorizontal: 16, marginBottom: 8,
        borderWidth: 1, borderColor: Colors.primary,
        borderRadius: 20, paddingVertical: 6,
        alignItems: 'center',
    },
    dropdownViewProfileText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
    dropdownDivider: { height: 1, backgroundColor: '#F4F2EE', marginVertical: 4 },
    dropdownItem: { paddingHorizontal: 16, paddingVertical: 10 },
    dropdownItemText: { fontSize: 14, color: Colors.text },

    // Dropdown (Business/Apps)
    businessDropdown: {
        position: 'absolute',
        top: 72,
        backgroundColor: Colors.white,
        borderRadius: 8,
        width: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        paddingVertical: 8,
        zIndex: 2000,
    },
    businessDropdownHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F2EE',
        marginBottom: 4,
    },
    dropdownTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    dropdownIcon: { marginRight: 12, width: 22 },
    dropdownItemTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
    dropdownItemSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    dropdownDivider: { height: 1, backgroundColor: '#F4F2EE', marginVertical: 4 },
    webMenuOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
});
