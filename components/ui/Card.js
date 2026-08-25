import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../constants';

export default function Card({
    children,
    style,
    onPress,
    variant = 'elevated', // elevated, outline, filled
    padding = 'md', // none, sm, md, lg
}) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'outline':
                return {
                    backgroundColor: Colors.white,
                    borderWidth: 1,
                    borderColor: Colors.borderLight,
                };
            case 'filled':
                return {
                    backgroundColor: Colors.background,
                    borderWidth: 0,
                };
            case 'elevated':
            default:
                return {
                    backgroundColor: Colors.white,
                    ...Shadows.sm,
                };
        }
    };

    const getPaddingStyles = () => {
        switch (padding) {
            case 'none': return { padding: 0 };
            case 'sm': return { padding: Spacing.sm };
            case 'lg': return { padding: Spacing.lg };
            case 'md':
            default: return { padding: Spacing.md };
        }
    };

    const ContainerComponent = onPress ? TouchableOpacity : View;

    return (
        <ContainerComponent
            style={[
                styles.base,
                getVariantStyles(),
                getPaddingStyles(),
                style
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </ContainerComponent>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: Radius.lg,
        overflow: 'hidden', // to ensure content respects border radius
    },
});
