import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../constants';
import { useRouter } from 'expo-router';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../utils/useAuthGuard';
import { startOrGetConversation } from '../utils/chatHelper';
import { formatTime } from '../utils/profileUtils';

export default function PostCard({ post }) {
    const router = useRouter();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    
    // Optimistic UI for likes
    const initialLiked = post.liked_by?.includes(user?.uid);
    const initialLikesCount = post.liked_by?.length || 0;
    
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [hasActioned, setHasActioned] = useState(false);
    const [checkingAction, setCheckingAction] = useState(false);

    useEffect(() => {
        if (!user || user.uid === post.user_id) return;
        
        const checkAction = async () => {
            setCheckingAction(true);
            try {
                const fieldSelf = user.role === 'WORKER' ? 'worker_id' : 'employer_id';
                const fieldOther = user.role === 'WORKER' ? 'employer_id' : 'worker_id';
                
                // For Posts, we check if there's any conversation between these two
                // Optional: strictly check post_id, but usually one contact per user/post pair is enough
                const q = query(
                    collection(db, 'chat_conversations'),
                    where(fieldSelf, '==', user.uid),
                    where(fieldOther, '==', post.user_id)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setHasActioned(true);
                }
            } catch (err) {
                console.warn('Check action error:', err);
            } finally {
                setCheckingAction(false);
            }
        };
        checkAction();
    }, [user?.uid, post.id]);

    const handleLike = async () => {
        if (!requireAuth()) return;
        
        // Optimistic UI update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            const postRef = doc(db, 'posts', post.id);
            if (isLiked) {
                await updateDoc(postRef, {
                    liked_by: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(postRef, {
                    liked_by: arrayUnion(user.uid)
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert changes on error
            setIsLiked(isLiked);
            setLikesCount(initialLikesCount);
        }
    };

    const handleContact = async () => {
        if (!requireAuth()) return;
        if (user.uid === post.user_id || hasActioned) return;

        try {
            const { sendConnectionRequest } = await import('../utils/chatSecureHelper');
            await sendConnectionRequest(user, post.user_id, {
                type: post.user_role === 'EMPLOYER' ? 'APPLY' : 'CONTACT',
                job_id: post.id || null
            });
            setHasActioned(true);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const handleComment = () => {
        router.push(`/post/${post.id}/comments`);
    };

    const postDate = formatTime(post.created_at);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => router.push(`/user/${post.user_id}`)}
                >
                    <View style={styles.avatar}>
                        {post.author_photo ? (
                            <Image source={{ uri: post.author_photo }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        ) : (
                            <Text style={styles.avatarText}>{post.author_name?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View style={styles.headerText}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.authorName}>{post.author_name}</Text>
                            {(user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase()) && (
                                <View style={styles.proximityBadge}>
                                    <Text style={styles.proximityText}>Perto de si</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.time}>{postDate} • {post.user_role === 'WORKER' ? 'Profissional' : 'Empregador'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Conteudo clicavel */}
            <TouchableOpacity activeOpacity={0.7} onPress={handleComment}>
                {post.content ? <Text style={styles.content}>{post.content}</Text> : null}
                
                {(post.work_type || post.availability) && (
                    <View style={styles.tagsContainer}>
                        {post.work_type && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{post.work_type}</Text>
                            </View>
                        )}
                        {post.availability && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{post.availability}</Text>
                            </View>
                        )}
                    </View>
                )}

                {(post.city || post.province) && (
                    <View style={styles.locationSummaryFeed}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.locationSummaryTextFeed}>
                            {post.city}{post.province ? `, ${post.province}` : ''} {post.bairro ? `• ${post.bairro}` : ''}
                        </Text>
                    </View>
                )}

                {post.image_url && (
                    <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />
                )}
            </TouchableOpacity>

            {/* Ações */}
            <View style={styles.actions}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                        <Ionicons name={isLiked ? "thumbs-up" : "thumbs-up-outline"} size={22} color={isLiked ? Colors.primary : Colors.textLight} />
                        <Text style={[styles.actionText, isLiked && { color: Colors.primary }]}>{likesCount}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionBtn} onPress={handleComment}>
                        <Ionicons name="chatbox-outline" size={20} color={Colors.textLight} />
                        <Text style={styles.actionText}>{post.comments_count || 0}</Text>
                    </TouchableOpacity>
                </View>

                {String(post.user_id) !== String(user?.uid) && (
                    <TouchableOpacity 
                        style={[
                            styles.miniActionBtn,
                            hasActioned && styles.actionedBtn
                        ]} 
                        onPress={handleContact}
                        disabled={hasActioned}
                    >
                        <Ionicons 
                            name={hasActioned ? "checkmark-circle" : (post.user_role === 'EMPLOYER' ? "document-text" : "chatbubble-ellipses")} 
                            size={16} 
                            color={hasActioned ? Colors.textLight : (post.user_role === 'EMPLOYER' ? Colors.primary : Colors.primary)} 
                            style={{ marginRight: 6 }} 
                        />
                        <Text style={[
                            styles.miniActionText,
                            hasActioned && { color: Colors.textLight }
                        ]}>
                            {hasActioned 
                                ? (post.user_role === 'EMPLOYER' ? 'Candidatado' : 'Contactado')
                                : (post.user_role === 'EMPLOYER' ? 'Candidatar' : 'Contactar')
                            }
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Platform.OS === 'web' ? 8 : 16,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...(Platform.OS === 'web' ? {
            borderWidth: 1, borderColor: '#E0DFDC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        }),
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
    headerText: { flex: 1 },
    authorName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    time: { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
    proximityBadge: { backgroundColor: Colors.primary + '25', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
    proximityText: { fontSize: 11, color: Colors.primary, fontWeight: '800', textTransform: 'uppercase' },
    
    content: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 24, marginTop: Spacing.xs, marginBottom: Spacing.sm },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
    tag: { backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
    tagText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '600' },
    image: { width: '100%', height: 250, borderRadius: 12, marginBottom: Spacing.sm, backgroundColor: Colors.background },
    
    actions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm, marginTop: Spacing.xs },
    actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.lg, paddingVertical: 4 },
    actionText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginLeft: 6, fontWeight: '500' },

    miniActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary + '20',
    },
    actionedBtn: {
        backgroundColor: Colors.borderLight,
        borderColor: Colors.border,
    },
    miniActionText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    locationSummaryFeed: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: 4,
        opacity: 0.8,
    },
    locationSummaryTextFeed: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
});
