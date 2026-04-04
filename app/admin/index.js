import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic protection - should be enforced properly in middleware
    if (user?.role !== 'ADMIN') {
      router.replace('/(tabs)/home');
      return;
    }

    const loadStats = async () => {
      try {
        const [
            totalUsersSnap,
            workersSnap,
            employersSnap,
            activeJobsSnap,
            closedJobsSnap,
            pendingReportsSnap,
            pendingTestimonialsSnap
        ] = await Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(query(collection(db, 'users'), where('role', '==', 'WORKER'))),
            getCountFromServer(query(collection(db, 'users'), where('role', '==', 'EMPLOYER'))),
            getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'ACTIVE'))),
            getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'CLOSED'))),
            getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'PENDING'))),
            getCountFromServer(query(collection(db, 'testimonials'), where('status', '==', 'PENDING')))
        ]);
 
        setStats({
            totalUsers: totalUsersSnap.data().count,
            workers: workersSnap.data().count,
            employers: employersSnap.data().count,
            activeJobs: activeJobsSnap.data().count,
            closedJobs: closedJobsSnap.data().count,
            pendingReports: pendingReportsSnap.data().count,
            pendingTestimonials: pendingTestimonialsSnap.data().count
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user, router]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bem-vindo, {user?.name}</Text>
      <Text style={styles.subtitle}>Estatísticas gerais da plataforma</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Users</Text>
          <Text style={styles.cardValue}>{stats?.totalUsers || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workers / Employers</Text>
          <Text style={styles.cardValue}>{stats?.workers || 0} / {stats?.employers || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vagas Ativas / Fechadas</Text>
          <Text style={styles.cardValue}>{stats?.activeJobs || 0} / {stats?.closedJobs || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Denúncias Pendentes</Text>
          <Text style={styles.cardValue}>{stats?.pendingReports || 0}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Gestão</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/users')}>
          <Ionicons name="people" size={22} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.menuText}>Gerir Utilizadores</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/reports')}>
          <Ionicons name="warning" size={22} color={Colors.warning} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.menuText}>Gerir Denúncias</Text>
          {stats?.pendingReports > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{stats.pendingReports}</Text></View>}
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/testimonials')}>
          <Ionicons name="chatbox-ellipses" size={22} color={Colors.info} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.menuText}>Gerir Depoimentos</Text>
          {stats?.pendingTestimonials > 0 && <View style={[styles.badge, { backgroundColor: Colors.info }]}><Text style={styles.badgeText}>{stats.pendingTestimonials}</Text></View>}
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  card: { width: '48%', backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
  cardTitle: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  cardValue: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.primary },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  menu: { gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
  menuEmoji: { fontSize: 24, marginRight: Spacing.sm },
  menuText: { flex: 1, fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text },
  badge: { backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  badgeText: { color: Colors.white, fontSize: Fonts.sizes.xs, fontWeight: '700' },
  menuArrow: { fontSize: 20, color: Colors.textLight }
});
