import { Tabs, Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, TextInput, StyleSheet, Platform, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Colors, Fonts, Spacing } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import React, { useState, useMemo, useEffect } from 'react';
import { useAuthGuard } from '../../utils/useAuthGuard';
import { useTranslation } from 'react-i18next';
import { logoutAndRedirect } from '../../utils/logout';
import BrandWordmark from '../../components/BrandWordmark';

import { Ionicons } from '@expo/vector-icons';
import { useUnreadCount } from '../../utils/useUnreadCount';
import { useTaxonomy } from '../../hooks/useTaxonomy';

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




import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isSmallScreen = width < 768;
    const isMobileWeb = width < 480;

    const { unreadMessages, unreadNotifications, unreadConnectionRequests } = useUnreadCount();

    if (Platform.OS === 'web' && !isSmallScreen) {
        return (
            <View style={styles.webLayout}>
                <View style={styles.webContent}>
                    <Slot />
                </View>
            </View>
        );
    }

    const bottomPadding = Math.max(insets.bottom, 12);
    const fabBottomOffset = bottomPadding + 68;

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarHideOnKeyboard: Platform.OS === 'android',
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: bottomPadding,
                        left: 16,
                        right: 16,
                        elevation: 12,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 32,
                        height: 58,
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        paddingBottom: 0,
                    },
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textLight,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: t('tabs.home'),
                        headerShown: Platform.OS === 'web' && !isSmallScreen, // Hide on mobile for custom animated header
                        tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.home')} icon="home" focused={focused} />,
                    }}
                />

                <Tabs.Screen
                    name="network"
                    options={{
                        title: 'Minha Rede',
                        headerShown: Platform.OS === 'web' && !isSmallScreen,
                        tabBarIcon: ({ focused }) => <TabIcon label="Rede" icon="people" focused={focused} badge={unreadConnectionRequests} />,
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
                        headerShown: Platform.OS === 'web' && !isSmallScreen, // Hide on mobile
                        tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.jobs')} icon="briefcase" focused={focused} />,
                    }}
                />

                <Tabs.Screen
                    name="messages"
                    options={{
                        title: t('tabs.messages'),
                        headerShown: Platform.OS === 'web' && !isSmallScreen, // Hide on mobile
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
                    name="dashboard"
                    options={{
                        href: null,
                    }}
                />

                <Tabs.Screen
                    name="notifications"
                    options={{
                        title: t('tabs.notifications'),
                        headerShown: Platform.OS === 'web' && !isSmallScreen, // Hide on mobile
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
                        headerShown: Platform.OS === 'web' && !isSmallScreen, // Hide on mobile
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

            {/* Floating Action Button (+) - Telegram Style */}
            <TouchableOpacity
                style={[styles.floatingFab, { bottom: fabBottomOffset }]}
                onPress={() => {
                    if (requireAuth()) {
                        router.push(user?.role === 'EMPLOYER' ? '/job/create' : '/post/create');
                    }
                }}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={30} color={Colors.white} />
            </TouchableOpacity>
        </View>
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
        backgroundColor: Colors.primary,
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

    // FAB Create Button - Telegram Floating Style
    floatingFab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        zIndex: 999,
    },
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
    webLayout: { flex: 1, backgroundColor: Colors.background },
    webContent: { flex: 1, width: '100%', maxWidth: 1200, alignSelf: 'center', backgroundColor: Colors.background },

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
        backgroundColor: Colors.primary,
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
    dropdownDivider: { height: 1, backgroundColor: Colors.background, marginVertical: 4 },
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
    dropdownDivider: { height: 1, backgroundColor: Colors.background, marginVertical: 4 },
    webMenuOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 1000,
    },

    // Floating Action Button (+) Telegram Style
    floatingFab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
});
