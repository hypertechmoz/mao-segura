import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, PROVINCES } from '../constants';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function CitySelector({ isWeb }) {
    const { user, exploredCity, setExploredCity } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const activeCity = exploredCity || user?.city || user?.province || 'Localização';

    const handleSelect = (prov) => {
        if (!user?.is_premium && user?.province !== prov && user?.city !== prov) {
            setModalVisible(false);
            router.push('/settings/premium');
            return;
        }
        setExploredCity(prov);
        setModalVisible(false);
    };

    return (
        <View>
            <TouchableOpacity 
                style={[styles.container, isWeb && styles.webContainer]} 
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name={!exploredCity ? "location-sharp" : "location-outline"} size={isWeb ? 14 : 16} color={Colors.primary} />
                <Text style={[styles.text, isWeb && styles.webText]} numberOfLines={1}>
                    {!exploredCity ? 'Perto de mim' : activeCity}
                </Text>
                <Ionicons name="chevron-down" size={isWeb ? 12 : 14} color={Colors.textLight} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Explorar Local</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        {!user?.is_premium && (
                            <View style={styles.premiumWarning}>
                                <Ionicons name="star" size={16} color={Colors.premium} style={{ marginRight: 6 }} />
                                <Text style={styles.premiumWarningText}>
                                    Apenas contas Premium podem explorar outras cidades.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.cityItem, !exploredCity && styles.cityItemActive]}
                            onPress={() => {
                                setExploredCity(null);
                                setModalVisible(false);
                            }}
                        >
                            <Ionicons name="location-sharp" size={18} color={!exploredCity ? Colors.primary : Colors.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.cityText, !exploredCity && styles.cityTextActive, { flex: 1 }]}>
                                Perto de mim (Localização atual)
                            </Text>
                            {!exploredCity && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                        </TouchableOpacity>

                        <FlatList
                            data={PROVINCES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const isActive = item === activeCity;
                                const isLocked = !user?.is_premium && item !== (user?.city || user?.province);

                                return (
                                    <TouchableOpacity
                                        style={[styles.cityItem, isActive && styles.cityItemActive]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={[
                                            styles.cityText,
                                            isActive && styles.cityTextActive,
                                            isLocked && styles.cityTextLocked
                                        ]}>
                                            {item}
                                        </Text>
                                        {isLocked && <Ionicons name="lock-closed" size={16} color={Colors.textLight} />}
                                        {isActive && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        maxWidth: 120,
    },
    webContainer: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        marginLeft: 0,
        marginTop: 4,
        maxWidth: '100%',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        marginHorizontal: 4,
        flexShrink: 1,
    },
    webText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        maxHeight: '80%',
        padding: 20,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
            default: {
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            }
        })
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    premiumWarning: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    premiumWarningText: {
        fontSize: 12,
        color: Colors.premium,
        flex: 1,
        fontWeight: '600',
    },
    cityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    cityItemActive: {
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderBottomWidth: 0,
    },
    cityText: {
        fontSize: 16,
        color: Colors.text,
    },
    cityTextActive: {
        fontWeight: '700',
        color: Colors.primary,
    },
    cityTextLocked: {
        color: Colors.textLight,
    }
});
