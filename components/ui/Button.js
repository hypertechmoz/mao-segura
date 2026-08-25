import React from 'react';
import { 
    TouchableOpacity, 
    Text, 
    ActivityIndicator, 
    StyleSheet, 
    View
} from 'react-native';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../../constants';

export default function Button({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost, danger, premium
    size = 'medium',     // small, medium, large
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    activeOpacity = 0.8,
    ...props
}) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    button: { backgroundColor: Colors.background },
                    text: { color: Colors.text },
                    loader: Colors.text,
                };
            case 'outline':
                return {
                    button: { 
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: Colors.border 
                    },
                    text: { color: Colors.text },
                    loader: Colors.text,
                };
            case 'ghost':
                return {
                    button: { backgroundColor: 'transparent' },
                    text: { color: Colors.primary },
                    loader: Colors.primary,
                };
            case 'danger':
                return {
                    button: { backgroundColor: Colors.error },
                    text: { color: Colors.white },
                    loader: Colors.white,
                };
            case 'premium':
                return {
                    button: { 
                        backgroundColor: Colors.premium,
                        ...Shadows.md
                    },
                    text: { color: Colors.white },
                    loader: Colors.white,
                };
            case 'primary':
            default:
                return {
                    button: { 
                        backgroundColor: Colors.primary,
                        ...Shadows.md 
                    },
                    text: { color: Colors.white },
                    loader: Colors.white,
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    button: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
                    text: { fontSize: Fonts.sizes.sm },
                };
            case 'large':
                return {
                    button: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
                    text: { fontSize: Fonts.sizes.lg },
                };
            case 'medium':
            default:
                return {
                    button: { paddingVertical: 14, paddingHorizontal: Spacing.lg },
                    text: { fontSize: Fonts.sizes.md },
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                variantStyles.button,
                sizeStyles.button,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={activeOpacity}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variantStyles.loader} />
            ) : (
                <View style={styles.contentRow}>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    
                    {title && (
                        <Text style={[
                            styles.baseText,
                            variantStyles.text,
                            sizeStyles.text,
                            textStyle,
                        ]}>
                            {title}
                        </Text>
                    )}

                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    baseText: {
        fontWeight: '700',
        fontFamily: Fonts.bold,
        textAlign: 'center',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: Spacing.sm,
    },
    iconRight: {
        marginLeft: Spacing.sm,
    },
    disabled: {
        opacity: 0.6,
    },
});
