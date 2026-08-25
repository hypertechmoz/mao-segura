import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Badge({
    label,
    variant = 'primary', // primary, secondary, success, warning, error, premium, outline
    icon,
    style,
    textStyle,
    size = 'medium' // small, medium
}) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    container: { backgroundColor: Colors.borderLight },
                    text: { color: Colors.textSecondary },
                    iconColor: Colors.textSecondary,
                };
            case 'success':
                return {
                    container: { backgroundColor: Colors.successBg },
                    text: { color: Colors.success },
                    iconColor: Colors.success,
                };
            case 'warning':
                return {
                    container: { backgroundColor: Colors.warning + '20' }, // 20% opacity
                    text: { color: Colors.warning },
                    iconColor: Colors.warning,
                };
            case 'error':
                return {
                    container: { backgroundColor: Colors.error + '10' },
                    text: { color: Colors.error },
                    iconColor: Colors.error,
                };
            case 'premium':
                return {
                    container: { backgroundColor: Colors.premium + '20' },
                    text: { color: Colors.premium },
                    iconColor: Colors.premium,
                };
            case 'outline':
                return {
                    container: { 
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: Colors.border 
                    },
                    text: { color: Colors.textSecondary },
                    iconColor: Colors.textSecondary,
                };
            case 'primary':
            default:
                return {
                    container: { backgroundColor: Colors.primaryBg },
                    text: { color: Colors.primary },
                    iconColor: Colors.primary,
                };
        }
    };

    const getSizeStyles = () => {
        if (size === 'small') {
            return {
                container: { paddingHorizontal: 6, paddingVertical: 2 },
                text: { fontSize: 10 },
                iconSize: 10,
            };
        }
        return {
            container: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
            text: { fontSize: Fonts.sizes.xs },
            iconSize: 12,
        };
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <View style={[styles.base, variantStyles.container, sizeStyles.container, style]}>
            {icon && (
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={sizeStyles.iconSize} color={variantStyles.iconColor} />
                </View>
            )}
            <Text style={[styles.baseText, variantStyles.text, sizeStyles.text, textStyle]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: Radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    baseText: {
        fontWeight: '600',
    },
    iconContainer: {
        marginRight: 4,
    },
});
