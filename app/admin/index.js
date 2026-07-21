import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.replace('/(tabs)/home');
      return;
    }

    const loadStats = async () => {
      try {
        const [
            usersSnap,
            activeJobsSnap,
            closedJobsSnap,
            pendingReportsSnap,
            pendingTestimonialsSnap
        ] = await Promise.all([
            supabase.from('users').select('id, role, created_at, province, name, profile_photo').order('created_at', { ascending: false }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'CLOSED'),
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
            supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
        ]);
        
        const allUsers = usersSnap.data || [];
        const workers = allUsers.filter(u => u.role === 'WORKER').length;
        const employers = allUsers.filter(u => u.role === 'EMPLOYER').length;
        
        // Calculate New this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newThisMonth = allUsers.filter(u => {
            const d = new Date(u.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Calculate Top Province
        const provinceCount = {};
        let topProv = 'Nenhuma';
        let maxCount = 0;
        allUsers.forEach(u => {
            if (u.province) {
                provinceCount[u.province] = (provinceCount[u.province] || 0) + 1;
                if (provinceCount[u.province] > maxCount) {
                    maxCount = provinceCount[u.province];
                    topProv = u.province;
                }
            }
        });

        setRecentUsers(allUsers);
        
        setStats({
            totalUsers: allUsers.length,
            workers,
            employers,
            newThisMonth,
            topProvince: topProv,
            activeJobs: activeJobsSnap.count || 0,
            closedJobs: closedJobsSnap.count || 0,
            pendingReports: pendingReportsSnap.count || 0,
            pendingTestimonials: pendingTestimonialsSnap.count || 0
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

  const displayedUsers = showAllUsers ? recentUsers : recentUsers.slice(0, 5);

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

      <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
      <View style={styles.grid}>
        
        <TouchableOpacity 
          style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}
          onPress={() => router.push('/admin/stats/monthly')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Novos este Mês</Text>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>+{stats?.newThisMonth || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { borderLeftColor: '#00BCD4' }]}
          onPress={() => router.push('/admin/stats/provinces')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#00BCD420' }]}>
            <Ionicons name="map" size={20} color="#00BCD4" />
          </View>
          <Text style={styles.statLabel}>Província Principal</Text>
          <Text style={[styles.statValue, { color: '#00BCD4', fontSize: Fonts.sizes.lg }]} numberOfLines={1}>{stats?.topProvince}</Text>
        </TouchableOpacity>

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
      <View style={styles.menuGrid}>
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

      <View style={styles.recentSectionHeader}>
        <Text style={styles.sectionTitle}>Últimos Utilizadores Registados</Text>
        <TouchableOpacity onPress={() => setShowAllUsers(!showAllUsers)}>
            <Text style={styles.expandText}>{showAllUsers ? 'Recolher' : 'Ver Todos'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recentUsersCard}>
        {displayedUsers.map((u, i) => (
            <View key={u.id} style={[styles.recentUserRow, i === displayedUsers.length -1 && { borderBottomWidth: 0 }]}>
                {u.profile_photo ? (
                    <Image source={{ uri: u.profile_photo }} style={styles.recentAvatar} />
                ) : (
                    <View style={styles.recentAvatarPlaceholder}>
                        <Text style={styles.recentAvatarText}>{u.name?.[0]}</Text>
                    </View>
                )}
                <View style={styles.recentUserInfo}>
                    <Text style={styles.recentUserName}>{u.name}</Text>
                    <Text style={styles.recentUserRole}>{u.role === 'WORKER' ? 'Profissional' : 'Cliente'}</Text>
                </View>
                <View style={styles.recentUserTime}>
                    <Text style={styles.timeText}>{new Date(u.created_at).toLocaleDateString()}</Text>
                    <Text style={styles.timeSubtext}>{new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </View>
        ))}
        {recentUsers.length === 0 && (
            <Text style={styles.emptyText}>Nenhum utilizador encontrado.</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center', width: '100%' } : {}) },
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
    flexBasis: Platform.OS === 'web' ? '32%' : '48%',
    flexGrow: 1,
    backgroundColor: Colors.white, 
    padding: Spacing.md, 
    borderRadius: 16, 
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },
  statValue: { fontSize: Fonts.sizes.xl, fontWeight: '800', marginTop: 2 },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  menuItem: { 
    flexBasis: Platform.OS === 'web' ? '32%' : '100%',
    flexGrow: 1,
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
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },

  recentSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  expandText: { color: Colors.primary, fontWeight: '600', fontSize: 13, marginRight: 8 },
  recentUsersCard: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  recentUserRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  recentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  recentAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recentAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  recentUserInfo: { flex: 1 },
  recentUserName: { fontWeight: '700', color: Colors.text, fontSize: 14 },
  recentUserRole: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  recentUserTime: { alignItems: 'flex-end' },
  timeText: { fontWeight: '600', color: Colors.textSecondary, fontSize: 13 },
  timeSubtext: { color: Colors.textLight, fontSize: 11, marginTop: 2 },
  emptyText: { textAlign: 'center', color: Colors.textLight, padding: 20 }
});
