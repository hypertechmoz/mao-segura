import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, WORKER, EMPLOYER

  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

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
              await updateDoc(doc(db, 'users', id), { isActive: !currentStatus });
              setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
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
      await updateDoc(doc(db, 'users', id), { isVerified: true });
      await setDoc(doc(db, 'worker_profiles', id), { verification_status: 'APPROVED' }, { merge: true });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u));
      Alert.alert('Sucesso', 'Utilizador verificado com sucesso.');
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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

        <View style={styles.tabs}>
          {['ALL', 'WORKER', 'EMPLOYER'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'ALL' ? 'Todos' : tab === 'WORKER' ? 'Profissionais' : 'Clientes'}
              </Text>
            </TouchableOpacity>
          ))}
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
                  {item.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                </View>
                <Text style={styles.meta}>{item.phone || 'Sem telefone'}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: item.role === 'WORKER' ? '#4CAF5015' : '#2196F315' }]}>
                <Text style={[styles.roleText, { color: item.role === 'WORKER' ? '#4CAF50' : '#2196F3' }]}>
                  {item.role === 'WORKER' ? 'Profissional' : 'Cliente'}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                <Text style={styles.detailText}>{item.city || 'Desconhecido'}, {item.province || '??'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={item.isActive !== false ? Colors.success : Colors.error} />
                <Text style={[styles.detailText, { color: item.isActive !== false ? Colors.success : Colors.error, fontWeight: '600' }]}>
                  {item.isActive !== false ? 'Conta Ativa' : 'Conta Banida'}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              {!item.isVerified && item.role === 'WORKER' && (
                <TouchableOpacity style={[styles.actionBtn, styles.btnVerify]} onPress={() => handleVerify(item.id)}>
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                  <Text style={styles.btnTextWhite}>Verificar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, item.isActive !== false ? styles.btnBan : styles.btnUnban]}
                onPress={() => handleBan(item.id, item.isActive !== false)}
              >
                <Ionicons name={item.isActive !== false ? "ban" : "refresh"} size={14} color={item.isActive !== false ? Colors.error : Colors.info} />
                <Text style={[styles.btnText, { color: item.isActive !== false ? Colors.error : Colors.info }]}>
                  {item.isActive !== false ? 'Banir' : 'Reativar'}
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
  
  header: { backgroundColor: Colors.white, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 8,
    marginBottom: Spacing.md
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: Colors.text, padding: 0 },
  
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.white },

  list: { padding: Spacing.md, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  cardBody: { flexDirection: 'row', gap: 16, marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: Colors.textSecondary },

  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  btnVerify: { backgroundColor: Colors.primary },
  btnTextWhite: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  btnBan: { backgroundColor: Colors.error + '10' },
  btnUnban: { backgroundColor: Colors.info + '10' },
  btnText: { fontSize: 12, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textLight, marginTop: 12, fontSize: Fonts.sizes.md }
});
