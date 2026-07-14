import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../constants';

export default function WorkerCard({ worker, onPress, userLocation, isContacted }) {
    const router = useRouter();
    const isNear = userLocation?.city && worker.city && userLocation.city.toLowerCase() === worker.city.toLowerCase();

    return (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/user/${worker.id}`)} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.cardType}>
                        <Text style={styles.cardTypeText}>{worker.work_types?.[0] || worker.profession_category || 'Profissional'}</Text>
                    </View>
                    {isNear && (
                        <View style={styles.proximityBadge}>
                            <Text style={styles.proximityText}>Perto de si</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardTime}>
                    {worker.bairro || worker.province || ''}
                </Text>
            </View>
            <View style={styles.workerMain}>
                <View style={[styles.employerAvatar, { width: 44, height: 44, borderRadius: 22 }]}>
                    {worker.profile_photo ? (
                        <Image source={{ uri: worker.profile_photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                    ) : (
                        <Text style={[styles.avatarText, { fontSize: 18 }]}>{worker.name?.[0] || '?'}</Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{worker.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                        {worker.skills?.length > 0 ? worker.skills.join(', ') : (worker.profession_category || 'Profissional')}
                    </Text>
                </View>
            </View>
            <View style={[styles.cardFooter, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, marginTop: 12 }]}>
                <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                    <View style={styles.cardLocation}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} /><Text style={styles.locationText}>{worker.city}, {worker.bairro}</Text>
                    </View>
                    {worker.rating_avg > 0 && (
                        <View style={styles.cardRating}>
                            <Ionicons name="star" size={12} color="#FFB800" />
                            <Text style={styles.cardRatingText}>{worker.rating_avg.toFixed(1)}</Text>
                            <Text style={styles.cardCompletedText}>({worker.completed_contracts || 0})</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
                        isContacted === 'PENDING' ? { backgroundColor: Colors.borderLight, borderWidth: 0 } : { borderWidth: 1, borderColor: Colors.primary }
                    ]}
                    onPress={() => {
                        if (isContacted && isContacted !== 'PENDING') {
                            router.push({ pathname: `/chat/${isContacted}`, params: { name: worker.name } });
                        } else if (!isContacted) {
                            onPress('CONTACT', worker);
                        }
                    }}
                    disabled={isContacted === 'PENDING'}
                >
                    <Ionicons name={isContacted === 'PENDING' ? "time" : (isContacted ? "chatbubbles" : "chatbubble-ellipses")} size={14} color={isContacted === 'PENDING' ? Colors.textSecondary : Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={{ color: isContacted === 'PENDING' ? Colors.textSecondary : Colors.primary, fontWeight: '700', fontSize: 12 }}>
                        {isContacted === 'PENDING' ? 'Pendente' : (isContacted ? 'Mensagem' : 'Contactar')}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Platform.OS === 'web' ? 8 : 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...(Platform.OS === 'web' ? {
            borderWidth: 1,
            borderColor: '#E0DFDC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardType: { backgroundColor: Colors.primaryBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    cardTypeText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600' },
    cardTime: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    cardTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    cardDescription: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    cardLocation: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
    employerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
    avatarText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    workerMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
    cardRatingText: { fontSize: 12, fontWeight: '700', color: Colors.text },
    cardCompletedText: { fontSize: 11, color: Colors.textLight },
    proximityBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    proximityText: { fontSize: 10, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
});
