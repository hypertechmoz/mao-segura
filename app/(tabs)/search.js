import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, Fonts, PROFESSION_CATEGORIES, PROVINCES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import PostCard from '../../components/PostCard';

export default function Search() {
    const router = useRouter();
    const { q } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('VAGAS'); // 'VAGAS' or 'COMUNIDADE'
    const [searchQuery, setSearchQuery] = useState(q || '');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (q) {
            setSearchQuery(q);
            performSearch(q, false);
        }
    }, [q]);

    // Reset search state when query is cleared
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearched(false);
            setResults([]);
        }
    }, [searchQuery, activeTab]);

    const performSearch = async (searchTerm, isType = false) => {
        try {
            setLoading(true);
            setSearched(true);
            
            let query;
            const table = activeTab === 'VAGAS' ? 'jobs' : 'posts';

            if (activeTab === 'VAGAS') {
                query = supabase.from('jobs').select('*, employer:users!employer_id(*)').eq('status', 'ACTIVE');
                if (!user?.is_premium && user?.province) {
                    query = query.eq('province', user.province);
                }
                if (isType) {
                    query = query.eq('type', searchTerm);
                } else if (searchTerm) {
                    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
                }
            } else {
                query = supabase.from('posts').select('*, user:users!inner(*)');
                if (!user?.is_premium && user?.province) {
                    query = query.eq('user.province', user.province);
                }
                if (searchTerm) {
                    query = query.ilike('content', `%${searchTerm}%`);
                }
            }
            
            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        if (!searchQuery.trim()) {
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        performSearch(searchQuery.trim(), false);
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        performSearch(searchQuery.trim(), false);
    };

    const handleFilter = (type) => {
        setSearchQuery(type);
        performSearch(type, true);
    };

    return (
        <View style={styles.container}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'VAGAS' && styles.tabBtnActive]} 
                    onPress={() => setActiveTab('VAGAS')}
                >
                    <Text style={[styles.tabBtnText, activeTab === 'VAGAS' && styles.tabBtnTextActive]}>Vagas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'COMUNIDADE' && styles.tabBtnActive]} 
                    onPress={() => setActiveTab('COMUNIDADE')}
                >
                    <Text style={[styles.tabBtnText, activeTab === 'COMUNIDADE' && styles.tabBtnTextActive]}>Comunidade</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={activeTab === 'VAGAS' ? "Procurar vagas..." : "Procurar na comunidade..."}
                    placeholderTextColor={Colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {!searched && (
                <View style={styles.categories}>
                    <Text style={styles.categoryTitle}>Categorias populares</Text>
                    <View style={styles.chips}>
                        {PROFESSION_CATEGORIES.slice(0, 10).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={styles.chip}
                                onPress={() => handleFilter(type)}
                            >
                                <Text style={styles.chipText}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : searched && (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                    renderItem={({ item }) => (
                        activeTab === 'VAGAS' ? (
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => router.push(`/job/${item.id}`)}
                            >
                                <Text style={styles.resultTitle}>{item.title}</Text>
                                <Text style={styles.resultMeta}>
                                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                                    <Text>{` ${item.city} · ${item.contract_type === 'DAILY' ? 'Diarista' : item.contract_type === 'TEMPORARY' ? 'Temporário' : 'Permanente'}`}</Text>
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <PostCard post={item} />
                        )
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Ionicons name="search-outline" size={48} color={Colors.textLight} style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: Spacing.xxl }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md, ...(Platform.OS === 'web' ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {}) },
    searchBar: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
    searchInput: {
        flex: 1, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: Spacing.md,
        paddingVertical: 12, fontSize: Fonts.sizes.md, color: Colors.text,
        borderWidth: 1, borderColor: Colors.borderLight,
    },
    searchButton: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    searchIcon: { fontSize: 20 },
    categories: { marginTop: Spacing.sm },
    categoryTitle: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        backgroundColor: Colors.white, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
        borderWidth: 1, borderColor: Colors.border,
    },
    chipText: { fontSize: Fonts.sizes.sm, color: Colors.text },
    resultCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.sm,
    },
    resultTitle: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    resultMeta: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
    tabContainer: { flexDirection: 'row', marginBottom: Spacing.md, gap: 10 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: Colors.primary },
    tabBtnText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },
    tabBtnTextActive: { color: Colors.primary },
});
