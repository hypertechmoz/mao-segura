import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Colors, Spacing, Fonts } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../../components/PostCard';
import { sendPushNotification } from '../../../services/notificationService';

export default function Comments() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        if (!id) return;
        
        const fetchPostAndComments = async () => {
            // Fetch original post
            const { data: postData } = await supabase
                .from('posts')
                .select('*, author:user_id(*)')
                .eq('id', id)
                .single();
            if (postData) setPost(postData);

            // Fetch comments
            const { data: commentsData } = await supabase
                .from('comments')
                .select('*, author:user_id(id, name, profile_photo)')
                .eq('post_id', id)
                .order('created_at', { ascending: true });
            
            if (commentsData) {
                setComments(commentsData);
            }
            setLoading(false);
        };

        fetchPostAndComments();

        // Listen for comments
        const channel = supabase.channel(`post-comments-${id}-${Date.now()}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` }, () => fetchPostAndComments())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;
        const uid = user.uid || user.id;
        setSubmitting(true);
        
        try {
            await supabase.from('comments').insert({
                post_id: id,
                user_id: uid,
                content: newComment.trim(),
                parent_id: replyingTo?.id || null
            });

            // Update comment count on post
            await supabase.rpc('increment_comments_count', { post_id_param: id });

            // Notifications
            try {
                if (post && post.user_id !== uid) {
                    await supabase.from('notifications').insert({
                        user_id: post.user_id,
                        sender_id: uid,
                        title: 'Novo Comentário! 💬',
                        description: `${user.name || 'Alguém'} comentou na sua publicação.`,
                        type: 'POST_COMMENT',
                        is_read: false,
                        route: `/post/${id}/comments`
                    });

                    // Push
                    const { data: author } = await supabase
                        .from('users')
                        .select('pushToken')
                        .eq('id', post.user_id)
                        .single();
                    if (author?.pushToken) {
                        await sendPushNotification(
                            author.pushToken,
                            'Novo Comentário! 💬',
                            `${user.name || 'Alguém'} comentou na sua publicação.`
                        );
                    }
                }

                if (replyingTo && replyingTo.user_id !== uid && replyingTo.user_id !== post?.user_id) {
                    await supabase.from('notifications').insert({
                        user_id: replyingTo.user_id,
                        sender_id: uid,
                        title: 'Responderam ao seu comentário! ↩️',
                        description: `${user.name || 'Alguém'} respondeu ao seu comentário.`,
                        type: 'COMMENT_REPLY',
                        is_read: false,
                        route: `/post/${id}/comments`
                    });

                    // Push
                    const { data: replier } = await supabase
                        .from('users')
                        .select('pushToken')
                        .eq('id', replyingTo.user_id)
                        .single();
                    if (replier?.pushToken) {
                        await sendPushNotification(
                            replier.pushToken,
                            'Responderam ao seu comentário! ↩️',
                            `${user.name || 'Alguém'} respondeu ao seu comentário.`
                        );
                    }
                }
            } catch (err) {
                console.warn('Erro ao notificar comentário:', err);
            }

            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error posting comment: ', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderCommentItem = (item, isReply = false) => {
        const date = item.created_at 
            ? new Date(item.created_at).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) 
            : 'Agora';

        const author = item.author || {};

        return (
            <View style={[styles.commentRow, isReply && styles.replyRow]}>
                <View style={[styles.avatar, isReply ? { width: 28, height: 28, borderRadius: 14 } : { width: 34, height: 34, borderRadius: 17 }]}>
                    {author.profile_photo ? (
                        <Image source={{ uri: author.profile_photo }} style={isReply ? styles.avatarImageSmaller : styles.avatarImageSmall} />
                    ) : (
                        <Text style={[styles.avatarText, { fontSize: isReply ? 12 : 14 }]}>{author.name?.[0] || '?'}</Text>
                    )}
                </View>
                <View style={[styles.commentBubble, isReply && styles.replyBubble]}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.authorName}>{author.name}</Text>
                        <Text style={styles.commentTime}>{date}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    
                    {!isReply && (
                        <TouchableOpacity 
                            style={styles.replyButton} 
                            onPress={() => {
                                setReplyingTo(item);
                                setNewComment(`@${author.name} `);
                            }}
                        >
                            <Text style={styles.replyButtonText}>Responder</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderComment = ({ item }) => {
        const itemReplies = comments.filter(c => c.parent_id === item.id);
        
        if (item.parent_id) return null; // We render replies manually under parents

        return (
            <View>
                {renderCommentItem(item)}
                {itemReplies.map(reply => (
                    <View key={reply.id}>
                        {renderCommentItem(reply, true)}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comentários</Text>
                <View style={{ width: 30 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={comments}
                    keyExtractor={(c) => c.id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={() => (
                        <View style={{ marginBottom: Spacing.md }}>
                            {post && <PostCard 
                                post={post} 
                                onDelete={() => {
                                    if (router.canGoBack()) router.back();
                                    else router.replace('/(tabs)/home');
                                }}
                            />}
                            <View style={styles.divider} />
                        </View>
                    )}
                    renderItem={renderComment}
                    ListEmptyComponent={() => (
                        <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.border} style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyText}>Sem comentários ainda.</Text>
                            <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Seja o primeiro a comentar!</Text>
                        </View>
                    )}
                />
            )}

            {replyingTo && (
                <View style={styles.replyingBar}>
                    <Text style={styles.replyingText}>Respondendo a <Text style={{fontWeight:'700'}}>{replyingTo.author_name}</Text></Text>
                    <TouchableOpacity onPress={() => { setReplyingTo(null); setNewComment(''); }}>
                        <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Escreva um comentário..."
                    placeholderTextColor={Colors.textLight}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]} 
                    onPress={handleSendComment}
                    disabled={!newComment.trim() || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <Ionicons name="send" size={18} color={Colors.white} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 15, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    backButton: { padding: 4 },
    headerTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
    
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
    commentTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
    emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xl },
    
    commentRow: { flexDirection: 'row', marginBottom: Spacing.md },
    avatar: { backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
    avatarImageSmall: { width: 34, height: 34, borderRadius: 17 },
    avatarImageSmaller: { width: 28, height: 28, borderRadius: 14 },
    avatarText: { fontWeight: '700', color: Colors.primary },
    commentBubble: { flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EDEDED' },
    replyBubble: { backgroundColor: '#F9F9F9' },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    authorName: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text },
    commentTime: { fontSize: Fonts.sizes.xs, color: Colors.textLight },
    commentText: { fontSize: Fonts.sizes.sm, color: Colors.text, lineHeight: 20 },
    
    replyRow: { marginLeft: 44, marginTop: -Spacing.xs },
    replyButton: { marginTop: 8, alignSelf: 'flex-start' },
    replyButtonText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    
    replyingBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.primaryBg, borderTopWidth: 1, borderTopColor: Colors.primary + '20' },
    replyingText: { fontSize: 12, color: Colors.primary },
    
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingBottom: Platform.OS === 'ios' ? 30 : 12 },
    input: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: Fonts.sizes.sm, color: Colors.text, maxHeight: 100, minHeight: 44 },
    sendBtn: { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    sendBtnDisabled: { backgroundColor: Colors.borderLight }
});
