import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

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
    if (!user?.uid || !targetId) throw new Error('Utilizador ou destinatário inválido.');
    if (user.uid === targetId) throw new Error('Não pode iniciar conversa consigo mesmo.');

    const isWorker = user.role === 'WORKER';
    const fieldSelf = isWorker ? 'worker_id' : 'employer_id';
    const fieldOther = isWorker ? 'employer_id' : 'worker_id';

    // Verificar se já existe conversa
    const q = query(
        collection(db, 'chat_conversations'),
        where(fieldSelf, '==', user.uid),
        where(fieldOther, '==', targetId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
        return snap.docs[0].id;
    }

    // Criar nova conversa com autorização pendente
    const convData = {
        employer_id: isWorker ? targetId : user.uid,
        worker_id: isWorker ? user.uid : targetId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        last_message: metadata.last_message || 'Pedido de contacto enviado',
        is_authorized: false,
        initiated_by: user.uid,
        job_id: metadata.job_id || null,
        post_id: metadata.post_id || null,
        unread_count: {
            [targetId]: 1, // The recipient has 1 unread message
            [user.uid]: 0
        }
    };

    const newRef = await addDoc(collection(db, 'chat_conversations'), convData);

    // Add initial system/intro message
    await addDoc(collection(db, 'chat_conversations', newRef.id, 'messages'), {
        text: convData.last_message,
        sender_id: user.uid,
        created_at: serverTimestamp(),
        type: 'SYSTEM'
    });

    return newRef.id;
}
