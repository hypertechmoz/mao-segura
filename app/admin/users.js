import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleBan = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', id), { is_active: !currentStatus });
      loadUsers();
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleVerify = async (id) => {
    try {
      await updateDoc(doc(db, 'users', id), { is_verified: true });
      
      // Also update verification_status on worker profile if it exists
      await setDoc(doc(db, 'worker_profiles', id), { verification_status: 'APPROVED' }, { merge: true });
      
      loadUsers();
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadUsers(); }}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.isVerified && <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />}
              </View>
              <Text style={styles.meta}>{item.role} · {item.phone}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.meta}>{item.city}, {item.province}</Text>
              </View>
              <Text style={styles.status}>
                Estado: <Text style={{ color: item.isActive ? Colors.success : Colors.error }}>{item.isActive ? 'Ativo' : 'Banido'}</Text>
              </Text>
            </View>
            <View style={styles.actions}>
              {!item.isVerified && (
                <TouchableOpacity style={[styles.btn, styles.btnVerify]} onPress={() => handleVerify(item.id)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark" size={14} color={Colors.primary} />
                    <Text style={styles.btnVerifyText}>Aprovar</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btn, item.isActive ? styles.btnBan : styles.btnUnban]}
                onPress={() => handleBan(item.id, item.isActive)}
              >
                <Text style={item.isActive ? styles.btnBanText : styles.btnUnbanText}>
                  {item.isActive ? 'Banir' : 'Desbanir'}
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
  list: { padding: Spacing.md },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  info: { marginBottom: Spacing.sm },
  name: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  meta: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  status: { fontSize: Fonts.sizes.xs, fontWeight: '600', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnVerify: { backgroundColor: Colors.success + '20' },
  btnVerifyText: { color: Colors.success, fontWeight: '600' },
  btnBan: { backgroundColor: Colors.error + '20' },
  btnBanText: { color: Colors.error, fontWeight: '600' },
  btnUnban: { backgroundColor: Colors.info + '20' },
  btnUnbanText: { color: Colors.info, fontWeight: '600' },
});
