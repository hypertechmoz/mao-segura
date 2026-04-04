import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'RESOLVED' });
      loadReports();
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
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => <Text style={styles.empty}>Sem denúncias pendentes.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === 'RESOLVED' && styles.cardResolved]}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name={item.status === 'PENDING' ? 'ellipse' : 'checkmark-circle'} size={12} color={item.status === 'PENDING' ? Colors.warning : '#4CAF50'} />
                <Text style={styles.status}>{item.status === 'PENDING' ? 'Pendente' : 'Resolvida'}</Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.reason}>"{item.reason}"</Text>
            <View style={styles.parties}>
              <Text style={styles.partyText}>Denunciante: {item.reporter?.name}</Text>
              <Text style={styles.partyText}>Denunciado: {item.reported?.name}</Text>
            </View>
            {item.status === 'PENDING' && (
              <TouchableOpacity style={styles.btnResolve} onPress={() => handleResolve(item.id)}>
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
  list: { padding: Spacing.md },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40 },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  cardResolved: { opacity: 0.7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  status: { fontSize: Fonts.sizes.xs, fontWeight: '700' },
  date: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
  reason: { fontSize: Fonts.sizes.md, color: Colors.text, fontStyle: 'italic', marginBottom: 8 },
  parties: { backgroundColor: Colors.background, padding: 8, borderRadius: 8, marginBottom: 12 },
  partyText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
  btnResolve: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnResolveText: { color: Colors.white, fontWeight: '700' },
});
