import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../utils/useAuthGuard';
import { useTaxonomy } from '../hooks/useTaxonomy';
import BrandWordmark from './BrandWordmark';
import { logoutAndRedirect } from '../utils/logout';

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

export default function WebNavbar({ isSmall, isMobile, unreadMessages, unreadNotifications, unreadConnectionRequests }) {
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const router = useRouter();
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showBusinessMenu, setShowBusinessMenu] = useState(false);
    const { t } = useTranslation();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { categories, specialties } = useTaxonomy();

    const SUGGESTIONS = useMemo(() => {
        const catNames = categories.map(c => c.name).filter(c => c !== 'Outro');
        const specNames = specialties.map(s => s.name).filter(j => j !== 'Outro');
        return [...new Set([...catNames, ...specNames])];
    }, [categories, specialties]);

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
        { label: t('tabs.home'), icon: 'home', route: '/(tabs)/home' },
        { label: 'Serviços', icon: 'grid', route: '/services' },
        { label: 'Minha Rede', icon: 'people', route: '/(tabs)/network' },
        ...(isSmall ? [{ label: t('tabs.search'), icon: 'search', route: '/(tabs)/search' }] : []),
        { label: t('tabs.jobs'), icon: 'briefcase', route: '/(tabs)/jobs' },
        { label: t('tabs.messages'), icon: 'chatbubble-ellipses', route: '/(tabs)/messages' },
        { label: t('tabs.notifications'), icon: 'notifications', route: '/(tabs)/notifications' },
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
                            <BrandWordmark
                                variant={isMobile ? 'compact' : 'default'}
                                layout="inline"
                                showIcon
                                iconOnly={isSmall}
                            />
                        </TouchableOpacity>
                        {!isSmall && (
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
                                    isActive={pathname?.endsWith(item.route.split('/').pop())}
                                    badge={item.route.includes('/messages') ? unreadMessages : (item.route.includes('/notifications') ? unreadNotifications : (item.route.includes('/network') ? unreadConnectionRequests : 0))}
                                    onPress={() => {
                                        if (item.route.includes('/messages') || item.route.includes('/notifications')) {
                                            if (!requireAuth()) {
                                                closeAllMenus();
                                                return;
                                            }
                                        }
                                        router.push(item.route);
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
                                        onPress={async () => {
                                            closeAllMenus();
                                            await logoutAndRedirect(router);
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

const styles = StyleSheet.create({
    webMenuOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        cursor: 'default',
    },
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
    webNavLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 20 },
    webLogoContainer: { marginRight: 16, flexDirection: 'row', alignItems: 'center' },
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
        minWidth: 70,
        position: 'relative',
        cursor: 'pointer',
    },
    webNavIconInner: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    webNavIconLabel: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '500',
    },
    webNavIconLabelActive: {
        color: Colors.text,
    },
    webNavBadge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: Colors.white,
    },
    webNavBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    webNavActiveBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.text,
    },
    webNavRight: { flexDirection: 'row', alignItems: 'center' },
    webProfileBtn: { padding: 4 },
    webProfileAvatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    webProfileAvatarImage: { width: '100%', height: '100%' },
    webProfileAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
    webProfileDropdown: {
        position: 'absolute',
        top: 60,
        right: 0,
        width: 260,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1002,
    },
    profileDropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    dropdownAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    dropdownAvatarImage: { width: '100%', height: '100%' },
    dropdownAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 20 },
    dropdownName: { fontSize: 16, fontWeight: '700', color: Colors.text },
    dropdownRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    dropdownViewProfile: {
        marginHorizontal: 16,
        marginBottom: 8,
        paddingVertical: 6,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: 'center',
    },
    dropdownViewProfileText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
    dropdownDivider: { height: 1, backgroundColor: '#E0DFDC', marginVertical: 8 },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dropdownItemText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
});
