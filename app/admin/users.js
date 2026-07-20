import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, Fonts } from '../../constants';
import VerifiedBadge from '../../components/VerifiedBadge';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(null); // null = Dashboard, 'ALL' | 'WORKER' | 'EMPLOYER' = List
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actionText: '', isDestructive: false, onConfirm: null, isAlert: false });

  const showModal = (title, message, actionText, isDestructive, onConfirm, isAlert = false) => {
    setModalConfig({ title, message, actionText, isDestructive, onConfirm, isAlert });
    setModalVisible(true);
  };

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

  const executeBan = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
    } catch (err) {
      showModal('Erro', err.message, 'OK', true, null, true);
    }
  };

  const handleBan = async (id, currentStatus) => {
    const actionText = currentStatus ? 'banir' : 'desbanir';
    showModal(
      currentStatus ? 'Banir Utilizador' : 'Desbanir Utilizador',
      `Tem a certeza que deseja ${actionText} este utilizador?`,
      'Confirmar',
      currentStatus,
      () => executeBan(id, currentStatus)
    );
  };

  const executeDelete = async (id) => {
    try {
      const { error } = await supabase.rpc('delete_user_and_data', { user_id_to_delete: id });
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
      showModal('Sucesso', 'Utilizador apagado com sucesso.', 'OK', false, null, true);
    } catch (err) {
      showModal('Erro ao apagar', err.message || 'Verifique se executou o script SQL no Supabase.', 'OK', true, null, true);
    }
  };

  const handleDelete = async (id, userName) => {
    showModal(
      'Apagar Utilizador',
      `Tem a certeza absoluta que deseja apagar o utilizador ${userName}? Esta ação irá apagar todos os dados associados e NÃO pode ser desfeita!`,
      'Apagar',
      true,
      () => executeDelete(id)
    );
  };

  const handleVerify = async (id, role) => {
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', id);
      
      if (userError) throw userError;

      // Update specific profile if applicable
      if (role === 'WORKER') {
        await supabase.from('worker_profiles').update({ verification_status: 'APPROVED' }).eq('user_id', id);
      } else if (role === 'EMPLOYER') {
        await supabase.from('employer_profiles').update({ verification_status: 'APPROVED' }).eq('user_id', id);
      }

      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: true } : u));
      
      showModal('Sucesso', 'Utilizador verificado com sucesso.', 'OK', false, null, true);
    } catch (err) {
      showModal('Erro', err.message, 'OK', true, null, true);
    }
  };

  const handleTogglePremium = async (id, currentStatus) => {
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ is_premium: !currentStatus })
        .eq('id', id);
      
      if (userError) throw userError;

      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_premium: !currentStatus } : u));
      
      showModal('Sucesso', !currentStatus ? 'Konekt Mais ativado com sucesso.' : 'Konekt Mais removido com sucesso.', 'OK', false, null, true);
    } catch (err) {
      showModal('Erro', err.message, 'OK', true, null, true);
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
                  {(item.is_premium || item.is_verified) && <VerifiedBadge size={16} style={{ marginLeft: 4 }} />}
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
              {!item.is_verified && (
                <TouchableOpacity style={[styles.actionBtn, styles.btnVerify]} onPress={() => handleVerify(item.id, item.role)}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
                  <Text style={styles.btnTextWhite}>Verificar (Selo)</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: item.is_premium ? '#f44336' : '#FFD700' }]} 
                onPress={() => handleTogglePremium(item.id, item.is_premium)}
              >
                <Ionicons name={item.is_premium ? "close-circle-outline" : "star"} size={14} color={item.is_premium ? Colors.white : '#333'} />
                <Text style={[styles.btnTextWhite, { color: item.is_premium ? Colors.white : '#333' }]}>
                  {item.is_premium ? 'Remover Mais' : 'Dar Mais'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, item.is_active !== false ? styles.btnBan : styles.btnUnban]}
                onPress={() => handleBan(item.id, item.is_active !== false)}
              >
                <Ionicons name={item.is_active !== false ? "ban" : "refresh"} size={14} color={item.is_active !== false ? Colors.error : Colors.info} />
                <Text style={[styles.btnText, { color: item.is_active !== false ? Colors.error : Colors.info }]}>
                  {item.is_active !== false ? 'Banir' : 'Reativar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnDelete]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Ionicons name="trash" size={14} color={Colors.error} />
                <Text style={[styles.btnText, { color: Colors.error }]}>
                  Apagar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal Customizado de Confirmação */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Ionicons 
                    name={modalConfig.isDestructive ? "warning" : "information-circle"} 
                    size={28} 
                    color={modalConfig.isDestructive ? Colors.error : Colors.primary} 
                  />
                  <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                </View>
                
                <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                
                <View style={styles.modalActions}>
                  {!modalConfig.isAlert && (
                    <TouchableOpacity 
                      style={[styles.modalBtn, styles.modalBtnCancel]} 
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: modalConfig.isDestructive && !modalConfig.isAlert ? Colors.error : Colors.primary }]} 
                    onPress={() => {
                      setModalVisible(false);
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                    }}
                  >
                    <Text style={styles.modalBtnConfirmText}>{modalConfig.actionText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  btnDelete: { backgroundColor: Colors.error + '15' },
  btnText: { fontSize: 13, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textLight, marginTop: 12, fontSize: Fonts.sizes.md, fontWeight: '600' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  modalMessage: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnCancel: { backgroundColor: Colors.borderLight },
  modalBtnCancelText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  modalBtnConfirmText: { color: Colors.white, fontSize: 15, fontWeight: '800' }
});
