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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.welcome}>Bem-vindo,</Text>
          <Text style={styles.title}>{user?.name || 'Administrador'}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>Total de Utilizadores</Text>
          <Text style={styles.totalValue}>{stats?.totalUsers || 0}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Estatísticas</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.statCard, { borderLeftColor: '#4CAF50' }]} 
          onPress={() => router.push('/admin/users')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#4CAF5020' }]}>
            <Ionicons name="hammer" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.statLabel}>Profissionais</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats?.workers || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { borderLeftColor: '#2196F3' }]} 
          onPress={() => router.push('/admin/users')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#2196F320' }]}>
            <Ionicons name="business" size={20} color="#2196F3" />
          </View>
          <Text style={styles.statLabel}>Clientes</Text>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats?.employers || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF980020' }]}>
            <Ionicons name="flash" size={20} color="#FF9800" />
          </View>
          <Text style={styles.statLabel}>Vagas Ativas</Text>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats?.activeJobs || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.statCard, { borderLeftColor: Colors.error }]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.error + '20' }]}>
            <Ionicons name="warning" size={20} color={Colors.error} />
          </View>
          <Text style={styles.statLabel}>Denúncias</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>{stats?.pendingReports || 0}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Painel de Controlo</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/users')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="people" size={24} color={Colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Gerir Utilizadores</Text>
            <Text style={styles.menuDesc}>Ver, banir ou verificar contas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/reports')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '15' }]}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Denúncias Pendentes</Text>
            <Text style={styles.menuDesc}>Analisar denúncias de posts ou perfis</Text>
          </View>
          {stats?.pendingReports > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{stats.pendingReports}</Text></View>}
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/testimonials')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.info + '15' }]}>
            <Ionicons name="star" size={24} color={Colors.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Gerir Depoimentos</Text>
            <Text style={styles.menuDesc}>Aprovar novos depoimentos na home</Text>
          </View>
          {stats?.pendingTestimonials > 0 && <View style={[styles.badge, { backgroundColor: Colors.info }]}><Text style={styles.badgeText}>{stats.pendingTestimonials}</Text></View>}
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, ...(Platform.OS === 'web' ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  welcome: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: 2 },
  title: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text },
  totalBadge: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, color: Colors.textLight, textTransform: 'uppercase', fontWeight: '700' },
  totalValue: { fontSize: Fonts.sizes.xxl, fontWeight: '900', color: Colors.primary },

  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, marginLeft: 4 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  statCard: { 
    width: '48%', 
    backgroundColor: Colors.white, 
    padding: Spacing.md, 
    borderRadius: 16, 
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
  statValue: { fontSize: Fonts.sizes.xl, fontWeight: '800', marginTop: 2 },

  menu: { gap: 12 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.white, 
    padding: Spacing.md, 
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1
  },
  menuIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  menuDesc: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
  
  badge: { backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' }
});
