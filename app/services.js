import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants';
import { supabase } from '../services/supabase';

export default function ServicesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchTaxonomy();
    }, []);

    const fetchTaxonomy = async () => {
        try {
            setLoading(true);
            const { data: cats, error: err1 } = await supabase.from('categories').select('*').order('name');
            if (err1) throw err1;
            
            const { data: specs, error: err2 } = await supabase.from('specialties').select('*').order('name');
            if (err2) throw err2;

            setCategories(cats || []);
            setSpecialties(specs || []);
            if (cats && cats.length > 0) {
                setSelectedCategory(cats[0].id);
            }
        } catch (e) {
            console.error('Error fetching taxonomy:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = (serviceName) => {
        router.push({ pathname: '/(tabs)/search', params: { q: serviceName } });
    };

    const getIconForCategory = (catName) => {
        const map = {
            'Serviços domésticos': 'home-outline',
            'Cuidados e apoio': 'heart-outline',
            'Construção e reparos': 'hammer-outline',
            'Instalações e manutenção': 'construct-outline',
            'Tecnologia': 'laptop-outline',
            'Jardim e agricultura': 'leaf-outline',
            'Animais': 'paw-outline',
            'Veículos e equipamentos': 'car-outline',
            'Segurança': 'shield-checkmark-outline',
            'Serviços gerais': 'cube-outline',
            'Obras e infraestrutura': 'business-outline',
            'Trabalhos artesanais': 'color-palette-outline',
            'Serviços complementares': 'sparkles-outline',
            'Gestão e apoio': 'briefcase-outline',
            'Outros serviços úteis': 'construct-outline',
            'Design': 'brush-outline',
            'Educação': 'school-outline',
            'Beleza': 'cut-outline',
            'Eventos': 'musical-notes-outline',
            'Fotografia e Vídeo': 'camera-outline',
            'Consultoria': 'chatbubbles-outline',
            'Serviços Digitais': 'globe-outline',
        };
        return map[catName] || 'list-outline';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>A carregar serviços...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const filteredSpecialties = specialties.filter(s => s.category_id === selectedCategory);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Explorar Serviços</Text>
            </View>

            <View style={styles.content}>
                {/* Categorias Sidebar (Web) ou Scroll Horizontal (Mobile) */}
                <View style={styles.sidebar}>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal={Platform.OS !== 'web' && false} 
                    >
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat.id && styles.categoryItemActive
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Ionicons 
                                    name={getIconForCategory(cat.name)} 
                                    size={20} 
                                    color={selectedCategory === cat.id ? Colors.primary : Colors.textSecondary} 
                                />
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === cat.id && styles.categoryTextActive
                                ]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Lista de Especialidades */}
                <View style={styles.mainContent}>
                    <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
                    <FlatList
                        data={filteredSpecialties}
                        keyExtractor={item => item.id}
                        numColumns={Platform.OS === 'web' ? 2 : 1}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.serviceCard}
                                onPress={() => handleServiceSelect(item.name)}
                            >
                                <Text style={styles.serviceName}>{item.name}</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Nenhum serviço encontrado nesta categoria.</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backButton: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
    content: {
        flex: 1,
        flexDirection: Platform.OS === 'web' ? 'row' : 'row', // Side by side on mobile too, like a master-detail
        maxWidth: Platform.OS === 'web' ? 1200 : '100%',
        alignSelf: 'center',
        width: '100%',
    },
    sidebar: {
        width: Platform.OS === 'web' ? 300 : 120,
        backgroundColor: Colors.white,
        borderRightWidth: 1,
        borderRightColor: Colors.borderLight,
    },
    categoryItem: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        gap: Platform.OS === 'web' ? 12 : 4,
    },
    categoryItemActive: {
        backgroundColor: Colors.primary + '10',
        borderRightWidth: Platform.OS === 'web' ? 3 : 0,
        borderRightColor: Colors.primary,
        borderLeftWidth: Platform.OS !== 'web' ? 3 : 0,
        borderLeftColor: Colors.primary,
    },
    categoryText: {
        fontSize: Platform.OS === 'web' ? Fonts.sizes.md : 11,
        color: Colors.textSecondary,
        textAlign: Platform.OS === 'web' ? 'left' : 'center',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    mainContent: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    serviceCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        marginHorizontal: Platform.OS === 'web' ? Spacing.sm : 0,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    serviceName: {
        fontSize: Fonts.sizes.sm,
        color: Colors.text,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: Fonts.sizes.sm,
    },
});
