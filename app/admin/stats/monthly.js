import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Colors, Spacing, Fonts } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MonthlyStats() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.replace('/(tabs)/home');
      return;
    }

    const fetchMonthlyStats = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('created_at');

        if (error) throw error;
        
        setTotalUsers(data.length);

        const countsByMonth = {};
        
        data.forEach(u => {
          if (!u.created_at) return;
          const d = new Date(u.created_at);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const key = `${year}-${month}`;
          countsByMonth[key] = (countsByMonth[key] || 0) + 1;
        });

        // Convert to array and sort ascending (oldest to newest for graph left-to-right)
        const sortedData = Object.keys(countsByMonth)
          .sort((a, b) => a.localeCompare(b))
          .map(key => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const shortMonth = date.toLocaleDateString('pt-PT', { month: 'short' });
            return {
              key,
              label: `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)} ${year.slice(-2)}`,
              count: countsByMonth[key]
            };
          });

        setMonthlyData(sortedData);
      } catch (err) {
        console.error('Error fetching monthly stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, [user, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
  const GRAPH_HEIGHT = 200;

  let growthPercentage = 0;
  let hasGrowthData = false;
  let isPositiveGrowth = true;
  
  if (monthlyData.length >= 2) {
    const currentMonth = monthlyData[monthlyData.length - 1].count;
    const previousMonth = monthlyData[monthlyData.length - 2].count;
    if (previousMonth > 0) {
      growthPercentage = Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
      isPositiveGrowth = growthPercentage >= 0;
      hasGrowthData = true;
    } else if (currentMonth > 0) {
      growthPercentage = 100;
      isPositiveGrowth = true;
      hasGrowthData = true;
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estatísticas Mensais</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Histórico de Utilizadores</Text>
        <Text style={styles.totalValue}>{totalUsers}</Text>
      </View>

      <View style={styles.graphCard}>
        <View style={styles.graphHeaderRow}>
          <View>
            <Text style={styles.graphTitle}>Crescimento de Utilizadores</Text>
            <Text style={styles.graphSubtitle}>Novos registos por mês</Text>
          </View>
          {hasGrowthData && (
            <View style={[styles.growthBadge, { backgroundColor: isPositiveGrowth ? '#10B98120' : '#EF444420' }]}>
              <Ionicons name={isPositiveGrowth ? "arrow-up" : "arrow-down"} size={16} color={isPositiveGrowth ? "#10B981" : "#EF4444"} />
              <Text style={[styles.growthText, { color: isPositiveGrowth ? "#10B981" : "#EF4444" }]}>
                {Math.abs(growthPercentage)}%
              </Text>
            </View>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.graphContainer}
        >
          {monthlyData.length > 0 ? (
            monthlyData.map((item, index) => {
              const isLast = index === monthlyData.length - 1;
              const barHeight = Math.max((item.count / maxCount) * GRAPH_HEIGHT, 10); // min height 10
              
              return (
                <View key={item.key} style={styles.barWrapper}>
                  <Text style={[styles.barCount, isLast && styles.barCountHighlight]}>{item.count}</Text>
                  
                  <View style={[styles.barBg, { height: GRAPH_HEIGHT }]}>
                    <View 
                      style={[
                        styles.barFill, 
                        { height: barHeight },
                        isLast && { backgroundColor: '#3B82F6' } // Highlight the current month
                      ]} 
                    />
                  </View>
                  
                  <Text style={[styles.barLabel, isLast && styles.barLabelHighlight]}>{item.label}</Text>
                </View>
              );
            })
          ) : (
            <View style={{ height: GRAPH_HEIGHT, justifyContent: 'center', width: '100%' }}>
              <Text style={styles.emptyText}>Nenhum dado encontrado.</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, ...(Platform.OS === 'web' ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  headerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text },
  
  totalCard: {
    backgroundColor: '#3B82F6', // Changed from Pink to Blue
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: Fonts.sizes.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  totalValue: { color: Colors.white, fontSize: 42, fontWeight: '900' },

  graphCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  graphTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  graphSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  graphHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  growthBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  growthText: { fontWeight: '700', fontSize: Fonts.sizes.sm, marginLeft: 2 },
  
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minWidth: '100%',
    paddingBottom: 10
  },
  barWrapper: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 50,
  },
  barCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8
  },
  barCountHighlight: {
    color: '#3B82F6'
  },
  barBg: {
    width: 32,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 12
  },
  barFill: {
    width: '100%',
    backgroundColor: '#cbd5e1', // Default grey for older months
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  barLabelHighlight: {
    color: '#3B82F6',
    fontWeight: '700'
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: Fonts.sizes.md
  }
});
