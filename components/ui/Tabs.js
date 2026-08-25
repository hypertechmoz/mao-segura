import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../../constants';

export default function Tabs({
    tabs = [], // [{ key: 'tab1', title: 'Tab 1' }]
    activeTab,
    onChange,
    scrollable = false,
    style,
    tabContainerStyle,
    activeTabStyle,
    inactiveTabStyle,
}) {
    const renderTab = (tab) => {
        const isActive = activeTab === tab.key;

        return (
            <TouchableOpacity
                key={tab.key}
                style={[
                    styles.tab,
                    !scrollable && styles.tabFlex,
                    isActive ? [styles.activeTab, activeTabStyle] : [styles.inactiveTab, inactiveTabStyle]
                ]}
                onPress={() => onChange && onChange(tab.key)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.tabText,
                    isActive ? styles.activeTabText : styles.inactiveTabText
                ]}>
                    {tab.title}
                </Text>
            </TouchableOpacity>
        );
    };

    if (scrollable) {
        return (
            <View style={[styles.container, style]}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, tabContainerStyle]}
                >
                    {tabs.map(renderTab)}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, styles.rowContent, tabContainerStyle, style]}>
            {tabs.map(renderTab)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        marginBottom: Spacing.md,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    tab: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabFlex: {
        flex: 1,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    inactiveTab: {
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.primary,
    },
    inactiveTabText: {
        color: Colors.textSecondary,
    },
});
