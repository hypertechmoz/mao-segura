import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../constants';
import { formatTime } from '../utils/profileUtils';
import VerifiedBadge from './VerifiedBadge';

export default function JobCard({ job, onPress, userLocation, isApplied }) {
    const router = useRouter();
    const isNear = userLocation?.city && job.city && userLocation.city.toLowerCase() === job.city.toLowerCase();

    return (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/job/${job.id}`)} activeOpacity={0.7}>
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    style={styles.cardAuthorRow}
                    onPress={() => router.push(`/user/${job.employer_id}`)}
                >
                    <View style={styles.employerAvatar}>
                        {job.employer?.profile_photo ? (
                            <Image source={{ uri: job.employer.profile_photo }} style={styles.avatarImageSmall} />
                        ) : (
                            <Text style={styles.avatarText}>{job.employer?.name?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.employerName} numberOfLines={1}>{job.employer?.name || 'Cliente'}</Text>
                            {(job.employer?.is_premium || job.employer?.is_verified) && <VerifiedBadge size={14} style={{ marginLeft: 4 }} />}
                            <Text style={{ color: Colors.textLight, marginHorizontal: 4 }}>•</Text>
                            <Text style={styles.cardTime}>{formatTime(job.created_at)}</Text>
                        </View>
                        <Text style={styles.authorMetaText}>Publicado por cliente</Text>
                    </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <View style={styles.cardType}>
                        <Text style={styles.cardTypeText}>{job.type}</Text>
                    </View>
                    {isNear && (
                        <View style={styles.proximityBadge}>
                            <Text style={styles.proximityText}>Perto de si</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.cardTitle}>{job.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={3}>{job.description}</Text>
            </View>

            {job.image_url && (
                <Image source={{ uri: job.image_url }} style={[styles.jobImage, Platform.OS === 'web' && { objectFit: 'cover' }]} resizeMode="cover" />
            )}

            <View style={styles.footerContainer}>
                <View style={styles.cardFooter}>
                    <View style={styles.cardLocation}>
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.locationText}> {job.city || 'Moçambique'}{(job.bairro || job.province) ? `, ${job.bairro || job.province}` : ''}</Text>
                    </View>
                    <View style={styles.cardContract}>
                        <Text style={styles.contractText}>{job.contract_type === 'DAILY' ? 'Diarista' : job.contract_type === 'TEMPORARY' ? 'Temporário' : 'Permanente'}</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <View>
                        <Text style={styles.applicants}>{job.applications_count || 0} candidatos</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            isApplied === 'PENDING' ? { backgroundColor: Colors.borderLight } : { backgroundColor: Colors.primary }
                        ]}
                        onPress={() => {
                            if (isApplied && isApplied !== 'PENDING' && isApplied !== 'AUTHORIZED') {
                                router.push({ pathname: `/chat/${isApplied}`, params: { name: job.employer?.name, pending_job_id: job.id } });
                            } else if (isApplied === 'AUTHORIZED') {
                                onPress('MESSAGE', job);
                            } else if (!isApplied) {
                                onPress('APPLY', job);
                            }
                        }}
                        disabled={isApplied === 'PENDING'}
                    >
                        <Ionicons name={isApplied === 'PENDING' ? "time" : (isApplied ? "chatbubbles" : "document-text")} size={16} color={isApplied === 'PENDING' ? Colors.textSecondary : Colors.white} style={{ marginRight: 6 }} />
                        <Text style={{ color: isApplied === 'PENDING' ? Colors.textSecondary : Colors.white, fontWeight: '700', fontSize: 14 }}>
                            {isApplied === 'PENDING' ? 'Pendente' : (isApplied ? 'Mensagem' : 'Candidatar')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Platform.OS === 'web' ? 8 : 12,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...(Platform.OS === 'web' ? {
            borderWidth: 1,
            borderColor: '#E0DFDC',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
        }),
    },
    contentContainer: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    cardAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    employerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
    avatarImageSmall: { width: 56, height: 56, borderRadius: 28 },
    avatarText: { fontSize: 24, fontWeight: '700', color: Colors.primary },
    employerName: { fontSize: 18, color: Colors.text, fontWeight: '700' },
    cardTime: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
    authorMetaText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
    
    cardType: { backgroundColor: Colors.primaryBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    cardTypeText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600' },
    proximityBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    proximityText: { fontSize: 10, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },

    cardTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 6, lineHeight: 24 },
    cardDescription: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, lineHeight: 22 },
    
    jobImage: { width: '100%', height: 260, marginTop: Spacing.sm },
    
    footerContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        paddingTop: Spacing.sm,
    },
    cardFooter: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    cardLocation: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    cardContract: { backgroundColor: Colors.info + '12', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
    contractText: { fontSize: Fonts.sizes.xs, color: Colors.info, fontWeight: '600' },
    
    actionRow: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    applicants: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
    actionButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, flexDirection: 'row', alignItems: 'center' },
});
