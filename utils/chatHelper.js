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

    // Verificar se já existe conversa ignorando a posição worker/employer (previne duplicados)
    const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(employer_id.eq.${uid},worker_id.eq.${targetId}),and(employer_id.eq.${targetId},worker_id.eq.${uid})`)
        .maybeSingle();

    if (existing) {
        // Se houver novo contexto (post_id ou job_id), atualizamos a conversa
        if (metadata.post_id || metadata.job_id) {
            await supabase
                .from('chat_conversations')
                .update({ 
                    post_id: metadata.post_id || null, 
                    job_id: metadata.job_id || null 
                })
                .eq('id', existing.id);
        }
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
            post_id: metadata.post_id || null,
            job_id: metadata.job_id || null
        });

    if (msgError) console.warn('Error creating initial message:', msgError);

    return newConv.id;
}
