import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../../constants';

export default function Select({
    label,
    options = [], // { label: '...', value: '...' }
    value,
    onSelect,
    placeholder = 'Selecione uma opção',
    error,
    style,
    disabled = false
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (opt) => {
        onSelect && onSelect(opt.value);
        setModalVisible(false);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <TouchableOpacity 
                style={[
                    styles.selector,
                    error && styles.selectorError,
                    disabled && styles.selectorDisabled
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectorText,
                    !selectedOption && styles.placeholderText
                ]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label || 'Selecione'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.optionItem,
                                        item.value === value && styles.optionItemSelected
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        item.value === value && styles.optionTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.listContainer}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: Spacing.md,
        minHeight: 48,
    },
    selectorError: {
        borderColor: Colors.error,
    },
    selectorDisabled: {
        opacity: 0.6,
        backgroundColor: Colors.borderLight,
    },
    selectorText: {
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        flex: 1,
    },
    placeholderText: {
        color: Colors.textLight,
    },
    errorText: {
        color: Colors.error,
        fontSize: Fonts.sizes.xs,
        marginTop: Spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        maxHeight: '80%',
        ...Shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    listContainer: {
        paddingBottom: Spacing.xxl,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    optionItemSelected: {
        backgroundColor: Colors.primaryBg,
    },
    optionText: {
        fontSize: Fonts.sizes.md,
        color: Colors.text,
    },
    optionTextSelected: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
