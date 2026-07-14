import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../constants';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../utils/useAuthGuard';
import { formatTime } from '../utils/profileUtils';
import { sendPushNotification } from '../services/notificationService';
import { startOrGetConversation } from '../utils/chatHelper';

export default function PostCard({ post, connectionStatusProp }) {
    const router = useRouter();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    
    // Optimistic UI for likes
    const initialLiked = post.liked_by?.includes(user?.uid || user?.id);
    const initialLikesCount = post.likes_count || 0;
    
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isExpanded, setIsExpanded] = useState(false);

    // Derived connection status to avoid N+1 queries
    const isConnected = connectionStatusProp && connectionStatusProp !== 'PENDING' && connectionStatusProp !== 'AUTHORIZED';
    const connectionStatus = isConnected ? 'CONNECTED' : connectionStatusProp;
    const conversationId = isConnected ? connectionStatusProp : null;

    // useEffect for connection checking was removed to prevent N+1 queries. Status is passed from parent via connectionStatusProp.

    const handleLike = async () => {
        if (!requireAuth()) return;
        const uid = user?.uid || user?.id;
        
        // Optimistic UI update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            const { error } = await supabase.rpc('toggle_post_like', { 
                p_id: post.id, 
                u_id: uid 
            });

            if (error) throw error;

            // Enviar notificação se não for o próprio autor
            if (uid !== post.user_id && !isLiked) {
                try {
                    await supabase.from('notifications').insert({
                        user_id: post.user_id,
                        sender_id: uid,
                        type: 'POST_LIKE',
                        content: `${user.name || 'Alguém'} gostou da sua publicação.`,
                        is_read: false,
                    });

                    // Tentar Push Notification
                    const { data: authorData } = await supabase
                        .from('users')
                        .select('pushToken')
                        .eq('id', post.user_id)
                        .single();

                    if (authorData?.pushToken) {
                        await sendPushNotification(
                            authorData.pushToken,
                            'Novo Gosto! 👍',
                            `${user.name || 'Alguém'} gostou da sua publicação.`
                        );
                    }
                } catch (err) {
                    console.warn('Erro ao notificar gosto:', err);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setIsLiked(isLiked);
            setLikesCount(likesCount);
        }
    };

    const handleContact = async () => {
        if (!requireAuth()) return;
        const uid = user?.uid || user?.id;
        if (uid === post.user_id) return;

        if (connectionStatus === 'CONNECTED' && conversationId) {
            router.push(`/chat/${conversationId}`);
            return;
        }

        if (connectionStatus === 'PENDING') return;

        try {
            const convId = await startOrGetConversation(user, post.user_id, { 
                post_id: post.id, 
                last_message: `Gostaria de falar sobre a sua publicação.` 
            });
            
            router.push(`/chat/${convId}`);
        } catch (error) {
            console.error('Error starting contact:', error);
        }
    };

    const handleComment = () => {
        router.push(`/post/${post.id}/comments`);
    };

    const postDate = formatTime(post.created_at);
    const authorRole = post.user_role || post.author?.role;
    const authorName = post.author?.name || post.author_name || 'Utilizador';
    const authorPhoto = post.author?.profile_photo || post.author_photo;

    const MAX_LENGTH = 150;
    const contentText = post.content || '';
    const shouldTruncate = contentText.length > MAX_LENGTH;
    const displayContent = isExpanded || !shouldTruncate ? contentText : `${contentText.slice(0, MAX_LENGTH)}...`;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => router.push(`/user/${post.user_id}`)}
                >
                    <View style={styles.avatar}>
                        {authorPhoto ? (
                            <Image source={{ uri: authorPhoto }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        ) : (
                            <Text style={styles.avatarText}>{authorName?.[0] || '?'}</Text>
                        )}
                    </View>
                    <View style={styles.headerText}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.authorName}>{authorName}</Text>
                            {(user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase()) && (
                                <View style={styles.proximityBadge}>
                                    <Text style={styles.proximityText}>Perto de si</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.time}>{postDate} • {authorRole === 'WORKER' ? 'Profissional' : 'Empregador'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={handleComment}>
                {contentText ? (
                    <View>
                        <Text style={styles.content}>
                            {displayContent}
                            {shouldTruncate && !isExpanded && (
                                <Text style={styles.verMais} onPress={(e) => { e.stopPropagation(); setIsExpanded(true); }}>
                                    {' '}Ver mais...
                                </Text>
                            )}
                        </Text>
                    </View>
                ) : null}
                
                {post.image_url && (
                    <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />
                )}
            </TouchableOpacity>

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

                {String(post.user_id) !== String(user?.uid || user?.id) && (
                    <TouchableOpacity 
                        style={[
                            styles.miniActionBtn,
                            connectionStatus === 'PENDING' && styles.actionedBtn,
                            connectionStatus === 'CONNECTED' && { backgroundColor: Colors.primary, borderColor: Colors.primary }
                        ]} 
                        onPress={handleContact}
                        disabled={connectionStatus === 'PENDING'}
                    >
                        <Ionicons 
                            name={connectionStatus === 'CONNECTED' ? "chatbubble-ellipses" : (connectionStatus === 'PENDING' ? "time" : (authorRole === 'EMPLOYER' ? "document-text" : "chatbubble-ellipses"))} 
                            size={16} 
                            color={connectionStatus === 'CONNECTED' ? Colors.white : (connectionStatus === 'PENDING' ? Colors.textLight : Colors.primary)} 
                            style={{ marginRight: 6 }} 
                        />
                        <Text style={[
                            styles.miniActionText,
                            connectionStatus === 'PENDING' && { color: Colors.textLight },
                            connectionStatus === 'CONNECTED' && { color: Colors.white }
                        ]}>
                            {connectionStatus === 'CONNECTED' 
                                ? 'Mensagem'
                                : (connectionStatus === 'PENDING' 
                                    ? 'Pendente' 
                                    : (authorRole === 'EMPLOYER' ? 'Candidatar' : 'Contactar'))
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
    verMais: { color: Colors.primary, fontWeight: '700' },
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
});
