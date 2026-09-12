import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../../constants';

export default function Modal({
    visible,
    onClose,
    title,
    children,
    footer,
    animationType = 'slide',
    transparent = true,
    showCloseButton = true,
    fullScreen = false
}) {
    return (
        <RNModal
            visible={visible}
            animationType={animationType}
            transparent={transparent}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={[styles.contentContainer, fullScreen && styles.fullScreenContainer]}>
                        
                        {(title || showCloseButton) && (
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                {showCloseButton && (
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                                        <Ionicons name="close" size={24} color={Colors.text} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        
                        <ScrollView contentContainerStyle={styles.body} bounces={false}>
                            {children}
                        </ScrollView>

                        {footer && (
                            <View style={styles.footer}>
                                {footer}
                            </View>
                        )}
                        
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end', // Default to bottom sheet style
    },
    safeArea: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        maxHeight: '90%',
        ...Shadows.lg,
    },
    fullScreenContainer: {
        flex: 1,
        maxHeight: '100%',
        borderRadius: 0,
        paddingTop: Platform.OS === 'android' ? Spacing.xl : 0, // safe area fallback
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    title: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
    },
    closeButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.md,
    },
    body: {
        padding: Spacing.lg,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.white,
    }
});
