import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      const q = query(collection(db, 'reports'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      
      const data = [];
      for (const d of snap.docs) {
          const report = { id: d.id, ...d.data() };
          if (report.reporter_id) {
              const rSnap = await getDoc(doc(db, 'users', report.reporter_id));
              if(rSnap.exists()) report.reporter = { name: rSnap.data().name };
          }
          if (report.reported_id) {
              const rrSnap = await getDoc(doc(db, 'users', report.reported_id));
              if(rrSnap.exists()) report.reported = { name: rrSnap.data().name };
          }
          data.push(report);
      }
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'RESOLVED' });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
      Alert.alert('Sucesso', 'Denúncia marcada como resolvida.');
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadReports(); }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Sem denúncias pendentes.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === 'RESOLVED' && styles.cardResolved]}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'PENDING' ? Colors.warning + '20' : Colors.success + '20' }]}>
                <Ionicons name={item.status === 'PENDING' ? 'alert-circle' : 'checkmark-circle'} size={14} color={item.status === 'PENDING' ? Colors.warning : Colors.success} />
                <Text style={[styles.statusText, { color: item.status === 'PENDING' ? Colors.warning : Colors.success }]}>
                  {item.status === 'PENDING' ? 'Pendente' : 'Resolvida'}
                </Text>
              </View>
              <Text style={styles.date}>{item.created_at?.toDate ? new Date(item.created_at.toDate()).toLocaleDateString() : 'Recent'}</Text>
            </View>

            <Text style={styles.reason}>"{item.reason}"</Text>
            
            <View style={styles.partiesContainer}>
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>Denunciante:</Text>
                <Text style={styles.partyName}>{item.reporter?.name || 'Desconhecido'}</Text>
              </View>
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>Denunciado:</Text>
                <Text style={styles.partyName}>{item.reported?.name || 'Desconhecido'}</Text>
              </View>
            </View>

            {item.status === 'PENDING' && (
              <TouchableOpacity style={styles.btnResolve} onPress={() => handleResolve(item.id)}>
                <Ionicons name="checkmark" size={18} color={Colors.white} />
                <Text style={styles.btnResolveText}>Marcar como Resolvida</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, paddingBottom: 40 },
  
  card: { 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    padding: Spacing.md, 
    marginBottom: Spacing.md, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 
  },
  cardResolved: { opacity: 0.7 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  date: { fontSize: 12, color: Colors.textLight },
  
  reason: { fontSize: Fonts.sizes.md, color: Colors.text, fontStyle: 'italic', marginBottom: 16, lineHeight: 22 },
  
  partiesContainer: { backgroundColor: Colors.background, padding: 12, borderRadius: 12, marginBottom: 16, gap: 4 },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  partyLabel: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
  partyName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
  
  btnResolve: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: Colors.primary, 
    paddingVertical: 12, 
    borderRadius: 12 
  },
  btnResolveText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textLight, marginTop: 12, fontSize: Fonts.sizes.md }
});
