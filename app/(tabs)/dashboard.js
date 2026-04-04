import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Fonts } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

function StatCard({ title, value, trend, trendIcon, icon, color }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{title}</Text>
                <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
            </View>
            <Text style={styles.statNumber}>{value}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {trendIcon && <Ionicons name={trendIcon} size={14} color={color} />}
                <Text style={[styles.statTrend, { color: color }]}>{trend}</Text>
            </View>
        </View>
    );
}

export default function Dashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const isWeb = Platform.OS === 'web';

    if (user?.role !== 'EMPLOYER') {
        return (
            <View style={styles.centered}>
                <Ionicons name="bar-chart-outline" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>Estatísticas indisponíveis</Text>
                <Text style={styles.emptySub}>Esta área é reservada para contas de empregadores.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard de Negócios</Text>
                <Text style={styles.subtitle}>Acompanhe o desempenho das suas vagas e candidatos.</Text>
            </View>

            <View style={styles.statsGrid}>
                <StatCard 
                    title="Vagas Ativas" 
                    value="08" 
                    trend="+2 novas este mês" 
                    trendIcon="trending-up"
                    icon="briefcase" 
                    color="#2E7D32" 
                />
                <StatCard 
                    title="Novos Candidatos" 
                    value="42" 
                    trend="+12 nas últimas 24h" 
                    trendIcon="trending-up"
                    icon="people" 
                    color="#1976D2" 
                />
                <StatCard 
                    title="Entrevistas" 
                    value="05" 
                    trend="Agendadas para esta semana" 
                    trendIcon="calendar"
                    icon="calendar" 
                    color="#7B1FA2" 
                />
            </View>

            {/* Placeholder for charts or lists */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Candidatos Recomendados</Text>
                <View style={styles.placeholderCard}>
                    <Ionicons name="sparkles" size={24} color={Colors.primary} />
                    <Text style={styles.placeholderText}>O nosso sistema de IA está a analisar o mercado...</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F2EE' },
    content: {
        padding: Spacing.lg,
        maxWidth: 1128,
        alignSelf: 'center',
        width: '100%',
    },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: Colors.text },
    subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    
    statsGrid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0DFDC',
        minWidth: Platform.OS === 'web' ? 250 : '100%',
    },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    statTitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    statIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 4 },
    statTrend: { fontSize: 12, fontWeight: '500' },
    
    section: { marginTop: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    placeholderCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#C7C5C1',
    },
    placeholderText: { fontSize: 14, color: Colors.textSecondary, marginTop: 12, textAlign: 'center' },
    
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 16 },
    emptySub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
