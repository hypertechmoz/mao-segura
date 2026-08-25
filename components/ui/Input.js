import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../constants';

export default function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    secureTextEntry,
    style,
    inputStyle,
    containerStyle,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry !== undefined;
    const currentSecureState = isPassword ? !isPasswordVisible : false;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputFocused,
                error && styles.inputError,
                style
            ]}>
                {leftIcon && (
                    <View style={styles.leftIconContainer}>
                        {leftIcon}
                    </View>
                )}
                
                <TextInput
                    style={[styles.input, inputStyle]}
                    placeholderTextColor={Colors.textLight}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus && props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur && props.onBlur(e);
                    }}
                    secureTextEntry={currentSecureState}
                    {...props}
                />

                {(rightIcon || isPassword) && (
                    <TouchableOpacity 
                        style={styles.rightIconContainer}
                        onPress={isPassword ? () => setIsPasswordVisible(!isPasswordVisible) : onRightIconPress}
                        disabled={!isPassword && !onRightIconPress}
                        activeOpacity={0.7}
                    >
                        {isPassword ? (
                            <Ionicons 
                                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                size={20} 
                                color={Colors.textLight} 
                            />
                        ) : (
                            rightIcon
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: Spacing.md,
        minHeight: 48,
    },
    inputFocused: {
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    inputError: {
        borderColor: Colors.error,
        backgroundColor: Colors.white,
    },
    input: {
        flex: 1,
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        paddingVertical: 12,
    },
    leftIconContainer: {
        marginRight: Spacing.sm,
    },
    rightIconContainer: {
        marginLeft: Spacing.sm,
    },
    errorText: {
        color: Colors.error,
        fontSize: Fonts.sizes.xs,
        marginTop: Spacing.xs,
    },
});
