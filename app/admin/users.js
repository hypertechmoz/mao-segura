import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, ScrollView } from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(null); // null = Dashboard, 'ALL' | 'WORKER' | 'EMPLOYER' = List

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const stats = useMemo(() => {
    const workers = users.filter(u => u.role === 'WORKER').length;
    const employers = users.filter(u => u.role === 'EMPLOYER').length;
    return {
      total: users.length,
      workers,
      employers
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesTab = activeTab === 'ALL' || u.role === activeTab;
      const matchesSearch = searchQuery === '' || 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  const handleBan = async (id, currentStatus) => {
    Alert.alert(
      currentStatus ? 'Banir Utilizador' : 'Desbanir Utilizador',
      `Tem a certeza que deseja ${currentStatus ? 'banir' : 'desbanir'} este utilizador?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ is_active: !currentStatus })
                .eq('id', id);
              
              if (error) throw error;
              setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
            } catch (err) {
              Alert.alert('Erro', err.message);
            }
          }
        }
      ]
    );
  };

  const handleVerify = async (id) => {
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', id);
      
      if (userError) throw userError;

      // Also update worker profile if it exists
      await supabase
        .from('worker_profiles')
        .update({ verification_status: 'APPROVED' })
        .eq('id', id);

      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: true } : u));
      Alert.alert('Sucesso', 'Utilizador verificado com sucesso.');
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  // === DASHBOARD VIEW ===
  if (activeTab === null) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.dashboardContainer}>
        <Text style={styles.dashboardTitle}>Painel de Categorias</Text>
        <Text style={styles.dashboardSubtitle}>Selecione o grupo que deseja analisar</Text>

        <View style={styles.cardsGrid}>
          <TouchableOpacity 
            style={[styles.dashCard, { backgroundColor: Colors.primary }]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('ALL')}
          >
            <View style={styles.dashCardTop}>
              <View style={styles.dashCardIconWrap}>
                <Ionicons name="people" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.dashCardNumber}>{stats.total}</Text>
            </View>
            <Text style={styles.dashCardTitle}>Todos</Text>
            <Text style={styles.dashCardSub}>Contas registadas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dashCard, { backgroundColor: '#4CAF50' }]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('WORKER')}
          >
            <View style={styles.dashCardTop}>
              <View style={[styles.dashCardIconWrap, { backgroundColor: Colors.white }]}>
                <Ionicons name="hammer" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.dashCardNumber}>{stats.workers}</Text>
            </View>
            <Text style={styles.dashCardTitle}>Profissionais</Text>
            <Text style={styles.dashCardSub}>Trabalhadores</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dashCard, { backgroundColor: '#2196F3' }]} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('EMPLOYER')}
          >
            <View style={styles.dashCardTop}>
              <View style={[styles.dashCardIconWrap, { backgroundColor: Colors.white }]}>
                <Ionicons name="business" size={32} color="#2196F3" />
              </View>
              <Text style={styles.dashCardNumber}>{stats.employers}</Text>
            </View>
            <Text style={styles.dashCardTitle}>Clientes</Text>
            <Text style={styles.dashCardSub}>Empregadores</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // === LIST VIEW ===
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.listHeaderRow}>
          <TouchableOpacity style={styles.btnBackToDash} onPress={() => { setActiveTab(null); setSearchQuery(''); }}>
            <Ionicons name="grid" size={20} color={Colors.primary} />
            <Text style={styles.btnBackToDashText}>Mudar Categoria</Text>
          </TouchableOpacity>
          <Text style={styles.listHeaderTitle}>
            {activeTab === 'ALL' ? 'Todos os Utilizadores' : activeTab === 'WORKER' ? 'Profissionais' : 'Clientes'}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome, telefone ou cidade..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadUsers(); }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Nenhum utilizador encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.is_verified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                </View>
                <Text style={styles.meta}>{item.phone || 'Sem telefone'}</Text>
              </View>
              <View style={[styles.roleBadge, { 
                backgroundColor: item.role === 'ADMIN' ? '#9C27B015' : (item.role === 'WORKER' ? '#4CAF5015' : '#2196F315') 
              }]}>
                <Text style={[styles.roleText, { 
                  color: item.role === 'ADMIN' ? '#9C27B0' : (item.role === 'WORKER' ? '#4CAF50' : '#2196F3') 
                }]}>
                  {item.role === 'ADMIN' ? 'Administrador' : (item.role === 'WORKER' ? 'Profissional' : 'Cliente')}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                <Text style={styles.detailText}>{item.city || 'Desconhecido'}, {item.province || '??'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={item.is_active !== false ? Colors.success : Colors.error} />
                <Text style={[styles.detailText, { color: item.is_active !== false ? Colors.success : Colors.error, fontWeight: '600' }]}>
                  {item.is_active !== false ? 'Conta Ativa' : 'Conta Banida'}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              {!item.is_verified && item.role === 'WORKER' && (
                <TouchableOpacity style={[styles.actionBtn, styles.btnVerify]} onPress={() => handleVerify(item.id)}>
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                  <Text style={styles.btnTextWhite}>Verificar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, item.is_active !== false ? styles.btnBan : styles.btnUnban]}
                onPress={() => handleBan(item.id, item.is_active !== false)}
              >
                <Ionicons name={item.is_active !== false ? "ban" : "refresh"} size={14} color={item.is_active !== false ? Colors.error : Colors.info} />
                <Text style={[styles.btnText, { color: item.is_active !== false ? Colors.error : Colors.info }]}>
                  {item.is_active !== false ? 'Banir' : 'Reativar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Dashboard Styles
  dashboardContainer: { padding: Spacing.xl, ...(Platform.OS === 'web' ? { maxWidth: 1000, alignSelf: 'center', width: '100%' } : {}) },
  dashboardTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  dashboardSubtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 30 },
  
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dashCard: { 
    flex: 1,
    minWidth: 280,
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 
  },
  dashCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dashCardIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  dashCardNumber: { fontSize: 40, fontWeight: '900', color: Colors.white },
  dashCardTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  dashCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  // List Styles
  header: { backgroundColor: Colors.white, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  btnBackToDash: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  btnBackToDashText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  listHeaderTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: Colors.text, padding: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },

  list: { padding: Spacing.md, paddingBottom: 40, ...(Platform.OS === 'web' ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}) },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  
  roleBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  cardBody: { flexDirection: 'row', gap: 20, marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  btnVerify: { backgroundColor: Colors.primary },
  btnTextWhite: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  btnBan: { backgroundColor: Colors.error + '15' },
  btnUnban: { backgroundColor: Colors.info + '15' },
  btnText: { fontSize: 13, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textLight, marginTop: 12, fontSize: Fonts.sizes.md, fontWeight: '600' }
});
