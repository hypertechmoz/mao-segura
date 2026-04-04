import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../../services/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../../store/authStore';
import { Colors, Spacing, Fonts } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../../components/PostCard';

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
        
        // Fetch original post
        getDoc(doc(db, 'posts', id)).then(docSnap => {
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() });
            }
        });

        // Listen for comments
        const q = query(
            collection(db, 'comments'),
            where('post_id', '==', id),
            orderBy('created_at', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;
        setSubmitting(true);
        
        try {
            await addDoc(collection(db, 'comments'), {
                post_id: id,
                user_id: user.uid,
                author_name: user.name || 'Usuário',
                author_photo: user.profile_photo || null,
                text: newComment.trim(),
                parent_id: replyingTo?.id || null,
                created_at: serverTimestamp(),
            });

            // Update comment count on post
            await updateDoc(doc(db, 'posts', id), {
                comments_count: increment(1)
            });

            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error posting comment: ', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderCommentItem = (item, isReply = false) => {
        const date = item.created_at?.seconds 
            ? new Date(item.created_at.seconds * 1000).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) 
            : 'Agora';

        return (
            <View style={[styles.commentRow, isReply && styles.replyRow]}>
                <View style={[styles.avatar, isReply ? { width: 28, height: 28, borderRadius: 14 } : { width: 34, height: 34, borderRadius: 17 }]}>
                    {item.author_photo ? (
                        <Image source={{ uri: item.author_photo }} style={isReply ? styles.avatarImageSmaller : styles.avatarImageSmall} />
                    ) : (
                        <Text style={[styles.avatarText, { fontSize: isReply ? 12 : 14 }]}>{item.author_name?.[0] || '?'}</Text>
                    )}
                </View>
                <View style={[styles.commentBubble, isReply && styles.replyBubble]}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.authorName}>{item.author_name}</Text>
                        <Text style={styles.commentTime}>{date}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                    
                    {!isReply && (
                        <TouchableOpacity 
                            style={styles.replyButton} 
                            onPress={() => {
                                setReplyingTo(item);
                                setNewComment(`@${item.author_name} `);
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                            {post && <PostCard post={post} />}
                            <View style={styles.divider} />
                        </View>
                    )}
                    renderItem={renderComment}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyText}>Sem comentários ainda. Seja o primeiro a comentar!</Text>
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
