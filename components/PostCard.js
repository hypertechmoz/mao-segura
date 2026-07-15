import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../constants';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../utils/useAuthGuard';
import { formatTime } from '../utils/profileUtils';
import { sendPushNotification } from '../services/notificationService';
import { startOrGetConversation } from '../utils/chatHelper';

export default function PostCard({ post, connectionStatusProp, onDelete, onUpdate }) {
    const router = useRouter();
    const { user } = useAuthStore();
    const { requireAuth } = useAuthGuard();
    
    // Optimistic UI for likes
    const initialLiked = post.liked_by?.includes(user?.uid || user?.id);
    const initialLikesCount = post.likes_count || 0;
    
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Edit/Delete state
    const [showOptions, setShowOptions] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editContent, setEditContent] = useState(post?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const isOwnPost = String(post.user_id) === String(user?.uid || user?.id);

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

    const handleDelete = () => {
        setShowOptions(false);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        setDeleteError('');
        try {
            // Append .select() to verify if the row was actually deleted
            const { error, data } = await supabase.from('posts').delete().eq('id', post.id).select();
            if (error) throw error;
            
            // If data is empty, it means RLS blocked the deletion (0 rows affected)
            if (!data || data.length === 0) {
                throw new Error("Sem permissão RLS ('Delete') no Supabase.");
            }

            setDeleteModalVisible(false);
            if (onDelete) onDelete(post.id);
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('posts').update({ content: editContent.trim() }).eq('id', post.id);
            if (error) throw error;
            post.content = editContent.trim();
            setEditModalVisible(false);
            if (onUpdate) onUpdate(post.id, editContent.trim());
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setIsSaving(false);
        }
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
                            {post.author?.is_premium && <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />}
                            {post.author?.is_verified && <MaterialIcons name="verified" size={14} color="#25D366" style={{ marginLeft: 4 }} />}
                            {(user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase()) && (
                                <View style={styles.proximityBadge}>
                                    <Text style={styles.proximityText}>Perto de si</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.time}>{postDate} • {authorRole === 'WORKER' ? 'Profissional' : 'Empregador'}</Text>
                    </View>
                </TouchableOpacity>

                {isOwnPost && (
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity style={{ padding: 8 }} onPress={() => setShowOptions(!showOptions)}>
                            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        
                        {showOptions && (
                            <View style={styles.optionsMenu}>
                                <TouchableOpacity 
                                    style={styles.optionItem} 
                                    onPress={() => { setShowOptions(false); setEditModalVisible(true); }}
                                >
                                    <Ionicons name="pencil" size={16} color={Colors.text} style={{ marginRight: 8 }} />
                                    <Text style={styles.optionText}>Editar</Text>
                                </TouchableOpacity>
                                <View style={styles.optionDivider} />
                                <TouchableOpacity 
                                    style={styles.optionItem} 
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash" size={16} color={Colors.error} style={{ marginRight: 8 }} />
                                    <Text style={[styles.optionText, { color: Colors.error }]}>Apagar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
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

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Publicação</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            autoFocus
                            value={editContent}
                            onChangeText={setEditContent}
                        />
                        <TouchableOpacity 
                            style={[styles.modalSaveBtn, (!editContent.trim() || isSaving) && { opacity: 0.5 }]} 
                            disabled={!editContent.trim() || isSaving}
                            onPress={handleSaveEdit}
                        >
                            {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSaveText}>Guardar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => { setDeleteModalVisible(false); setDeleteError(''); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { maxWidth: 400 }]}>
                        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.error + '15', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md }}>
                                <Ionicons name="trash-outline" size={32} color={Colors.error} />
                            </View>
                            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: Spacing.xs }]}>Apagar Publicação</Text>
                            <Text style={{ textAlign: 'center', color: Colors.textSecondary, fontSize: Fonts.sizes.md, lineHeight: 22 }}>
                                Tem a certeza que deseja apagar esta publicação? Esta ação não pode ser desfeita.
                            </Text>
                            {deleteError ? (
                                <Text style={{ textAlign: 'center', color: Colors.error, fontSize: Fonts.sizes.sm, marginTop: 12, fontWeight: '600' }}>
                                    Erro: {deleteError}
                                </Text>
                            ) : null}
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                            <TouchableOpacity 
                                style={[styles.modalActionBtn, { flex: 1, backgroundColor: Colors.background }]} 
                                onPress={() => { setDeleteModalVisible(false); setDeleteError(''); }}
                                disabled={isDeleting}
                            >
                                <Text style={[styles.modalActionText, { color: Colors.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalActionBtn, { flex: 1, backgroundColor: Colors.error }]} 
                                onPress={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <ActivityIndicator color={Colors.white} /> : <Text style={[styles.modalActionText, { color: Colors.white }]}>Apagar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, zIndex: 10, elevation: 10 },
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
    
    // Menu Options
    optionsMenu: {
        position: 'absolute',
        top: 30,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 4,
        minWidth: 120,
        zIndex: 10,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        } : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
        }),
    },
    optionItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    optionText: { fontSize: Fonts.sizes.sm, color: Colors.text, fontWeight: '500' },
    optionDivider: { height: 1, backgroundColor: Colors.borderLight },

    // Edit Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', maxWidth: 500, backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    modalTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
    modalInput: { backgroundColor: Colors.background, borderRadius: 12, padding: Spacing.md, fontSize: Fonts.sizes.md, minHeight: 120, textAlignVertical: 'top', color: Colors.text, marginBottom: Spacing.lg },
    modalSaveBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
    modalSaveText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' },
    modalActionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalActionText: { fontSize: Fonts.sizes.md, fontWeight: '700' }
});
