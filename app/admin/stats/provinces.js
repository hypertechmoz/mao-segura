import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Colors, Spacing, Fonts } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function ProvinceStats() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [provinceData, setProvinceData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.replace('/(tabs)/home');
      return;
    }

    const fetchProvinceStats = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('province');

        if (error) throw error;
        
        setTotalUsers(data.length);

        const countsByProvince = {};
        
        data.forEach(u => {
          const prov = u.province || 'Não especificada';
          countsByProvince[prov] = (countsByProvince[prov] || 0) + 1;
        });

        // Convert to array and sort descending by count
        const sortedData = Object.keys(countsByProvince)
          .map(key => ({
            label: key,
            count: countsByProvince[key]
          }))
          .sort((a, b) => b.count - a.count); // highest first

        setProvinceData(sortedData);
      } catch (err) {
        console.error('Error fetching province stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceStats();
  }, [user, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Find the maximum count to calculate progress bar widths
  const maxCount = provinceData.length > 0 ? provinceData[0].count : 1;
  const CHART_COLORS = ['#00BCD4', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#3F51B5', '#E91E63', '#009688', '#8BC34A', '#FFEB3B', '#FF5722'];


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Distribuição por Províncias</Text>
      </View>

      <View style={styles.totalCard}>
        <Ionicons name="map" size={32} color="rgba(255,255,255,0.8)" style={styles.cardIcon} />
        <Text style={styles.totalLabel}>Total de Utilizadores Mapeados</Text>
        <Text style={styles.totalValue}>{totalUsers}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.graphTitle}>Distribuição Nacional</Text>
        <Text style={styles.graphSubtitle}>Percentagem de utilizadores por província</Text>

        {provinceData.length > 0 ? (
          <View>
            {/* Stacked Bar Graph */}
            <View style={styles.stackedBarContainer}>
              {provinceData.map((item, index) => (
                <View 
                  key={`bar-${item.label}`} 
                  style={[
                    styles.stackedBarSegment, 
                    { 
                      width: `${(item.count / totalUsers) * 100}%`, 
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] 
                    }
                  ]} 
                />
              ))}
            </View>

            {/* Legend with little colored squares */}
            <View style={styles.legendContainer}>
              {provinceData.map((item, index) => {
                const percentage = Math.round((item.count / totalUsers) * 100);
                return (
                  <View key={`legend-${item.label}`} style={styles.legendItem}>
                    <View style={[styles.legendSquare, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
                      <Text style={styles.legendCount}>{item.count} ({percentage}%)</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum dado encontrado.</Text>
        )}
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
    backgroundColor: '#00BCD4',
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden'
  },
  cardIcon: { position: 'absolute', right: 20, top: 20, opacity: 0.5 },
  totalLabel: { color: 'rgba(255,255,255,0.9)', fontSize: Fonts.sizes.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  totalValue: { color: Colors.white, fontSize: 42, fontWeight: '900' },

  listContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  graphTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  graphSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  
  stackedBarContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.background,
  },
  stackedBarSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Allows 2 items per row
    marginBottom: Spacing.md,
  },
  legendSquare: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  legendCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    paddingVertical: Spacing.xl,
    fontSize: Fonts.sizes.md
  }
});
