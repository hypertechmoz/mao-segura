import { supabase } from '../services/supabase';

/**
 * Inicia ou recupera uma conversa existente entre dois utilizadores.
 * Centraliza a lógica que estava duplicada em home.js, profile.js, PostCard.js e job/[id].js.
 *
 * @param {Object} user - O utilizador autenticado (com uid e role)
 * @param {string} targetId - UID do outro utilizador
 * @param {Object} [metadata] - Dados extras (job_id, post_id, last_message)
 * @returns {Promise<string>} - O ID da conversa (existente ou nova)
 */
export async function startOrGetConversation(user, targetId, metadata = {}) {
    const uid = user?.uid || user?.id;
    if (!uid || !targetId) throw new Error('Utilizador ou destinatário inválido.');
    if (uid === targetId) throw new Error('Não pode iniciar conversa consigo mesmo.');

    const isWorker = user.role === 'WORKER';
    const fieldSelf = isWorker ? 'worker_id' : 'employer_id';
    const fieldOther = isWorker ? 'employer_id' : 'worker_id';

    // Verificar se já existe conversa
    const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq(fieldSelf, uid)
        .eq(fieldOther, targetId)
        .maybeSingle();

    if (existing) {
        return existing.id;
    }

    // Criar nova conversa com autorização pendente
    const convData = {
        employer_id: isWorker ? targetId : uid,
        worker_id: isWorker ? uid : targetId,
        last_message: metadata.last_message || 'Pedido de contacto enviado',
        is_authorized: false,
        initiated_by: uid,
        job_id: metadata.job_id || null,
        post_id: metadata.post_id || null,
        unread_count: {
            [targetId]: 1,
            [uid]: 0
        },
        participants: [uid, targetId]
    };

    const { data: newConv, error: insertError } = await supabase
        .from('chat_conversations')
        .insert(convData)
        .select()
        .single();

    if (insertError) throw insertError;

    // Add initial system/intro message
    const { error: msgError } = await supabase
        .from('messages')
        .insert({
            conversation_id: newConv.id,
            content: convData.last_message,
            sender_id: uid,
            receiver_id: targetId,
            // In the new schema, type might be inferred or we can add a column if needed
            // For now, content is enough.
        });

    if (msgError) console.warn('Error creating initial message:', msgError);

    return newConv.id;
}
