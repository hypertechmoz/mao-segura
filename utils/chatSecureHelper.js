import { supabase } from '../services/supabase';
import { startOrGetConversation } from './chatHelper';

/**
 * Cria um pedido de conexão/contacto na base de dados.
 */
export async function sendConnectionRequest(user, targetId, metadata = {}) {
    const uid = user?.uid || user?.id;
    if (!uid || !targetId) throw new Error('Utilizador ou destinatário inválido.');
    if (uid === targetId) throw new Error('Não pode iniciar conversa consigo mesmo.');

    // Check if request already exists
    const { data: existing } = await supabase
        .from('connection_requests')
        .select('id')
        .eq('sender_id', uid)
        .eq('receiver_id', targetId)
        .eq('status', 'PENDING')
        .maybeSingle();
    
    if (existing) {
        return existing.id;
    }

    // Prepare data
    const requestData = {
        sender_id: uid,
        sender_role: user.role,
        sender_name: user.name || 'Utilizador',
        receiver_id: targetId,
        type: metadata.type || 'CONTACT',
        job_id: metadata.job_id || null,
        status: 'PENDING'
    };

    const { data: newReq, error } = await supabase
        .from('connection_requests')
        .insert(requestData)
        .select()
        .single();
    
    if (error) throw error;
    return newReq.id;
}

/**
 * Aceita um pedido de conexão e abre a sala de chat.
 */
export async function acceptConnectionRequest(requestId, user, senderId) {
    const uid = user?.uid || user?.id;

    // Check request type
    const { data: requestData } = await supabase
        .from('connection_requests')
        .select('type')
        .eq('id', requestId)
        .single();

    // 1. Marcar como aceite
    await supabase.from('connection_requests').update({
        status: 'ACCEPTED',
        updated_at: new Date().toISOString()
    }).eq('id', requestId);

    // 2. Iniciar a conversa real com o utilizador autenticado como remetente inicial
    const conversationOwner = {
        uid,
        id: uid,
        role: user.role,
        name: user.name,
    };

    const conversationId = await startOrGetConversation(conversationOwner, senderId, {
        last_message: 'O seu pedido de contacto foi aceite!'
    });

    // 2.5 Ensure the conversation is authorized
    await supabase.from('chat_conversations').update({
        is_authorized: true,
        updated_at: new Date().toISOString()
    }).eq('id', conversationId);

    // 3. Adicional: Criar a conexão mútua
    if (requestData?.type === 'CONNECTION') {
        await supabase.from('connections').insert({
            user1_id: uid,
            user2_id: senderId
        });
    }

    // 4. Criar notificação para quem enviou o pedido
    try {
        await supabase.from('notifications').insert({
            user_id: senderId,
            sender_id: uid,
            title: 'Ligação Aceite! 🤝',
            description: `${user.name || 'Alguém'} aceitou o seu pedido de contacto. Já podem conversar no chat.`,
            type: 'CONNECTION_ACCEPTED',
            is_read: false,
            route: `/chat/${conversationId}`
        });
    } catch (e) {
        console.warn('Erro ao criar notificação de conexão aceite:', e);
    }

    return conversationId;
}

export async function rejectConnectionRequest(requestId) {
    await supabase.from('connection_requests').update({
        status: 'REJECTED',
        updated_at: new Date().toISOString()
    }).eq('id', requestId);
}
