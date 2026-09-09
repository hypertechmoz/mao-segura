import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants';

export default function AppDownloadPrompt() {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isSmallScreen = width < 768; // Typically mobile/tablet portrait
    const [isVisible, setIsVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(100)); // Start below screen

    useEffect(() => {
        // Only show if on web, screen is small, and not explicitly dismissed
        if (isWeb && isSmallScreen) {
            try {
                const hasDismissed = window.localStorage.getItem('kwick_dismiss_app_prompt');
                if (!hasDismissed) {
                    setIsVisible(true);
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }
            } catch (e) {
                // Ignore localStorage errors
            }
        } else {
            setIsVisible(false);
        }
    }, [isWeb, isSmallScreen, width]);

    const handleDismiss = () => {
        Animated.timing(slideAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
            if (isWeb) {
                try {
                    window.localStorage.setItem('kwick_dismiss_app_prompt', 'true');
                } catch(e) {}
            }
        });
    };

    const handleDownload = () => {
        // Here you would redirect to the App Store or Play Store
        // Example: window.location.href = 'https://play.google.com/store/apps/details?id=com.kwick.app';
        alert("Link para a loja de aplicações em breve!");
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="logo-google-playstore" size={24} color={Colors.white} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Instalar a App Kwick</Text>
                    <Text style={styles.subtitle}>Experiência mais rápida e fluída no seu telemóvel.</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleDownload}>
                    <Text style={styles.buttonText}>Baixar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
                    <Ionicons name="close" size={20} color={Colors.textLight} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingBottom: 20, // safe area spacing
        paddingTop: 12,
        paddingHorizontal: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    button: {
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    buttonText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: Fonts.sizes.sm,
    },
    closeBtn: {
        padding: 4,
    }
});
