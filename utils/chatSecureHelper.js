import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { startOrGetConversation } from './chatHelper';

/**
 * Cria um pedido de conexão/contacto na base de dados.
 */
export async function sendConnectionRequest(user, targetId, metadata = {}) {
    if (!user?.uid || !targetId) throw new Error('Utilizador ou destinatário inválido.');
    if (user.uid === targetId) throw new Error('Não pode iniciar conversa consigo mesmo.');

    const isWorker = user.role === 'WORKER';
    
    // Check if request already exists
    const reqQuery = query(
        collection(db, 'connection_requests'),
        where('sender_id', '==', user.uid),
        where('receiver_id', '==', targetId),
        where('status', '==', 'PENDING')
    );
    const snap = await getDocs(reqQuery);
    
    if (!snap.empty) {
        return snap.docs[0].id; // Already pending
    }

    // Prepare data
    const requestData = {
        sender_id: user.uid,
        sender_role: user.role,
        sender_name: user.name || 'Utilizador',
        receiver_id: targetId,
        type: metadata.type || 'CONTACT', // CONTACT ou APPLY
        job_id: metadata.job_id || null,
        status: 'PENDING',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'connection_requests'), requestData);
    
    // Também podemos gravar uma notificação explícita ou usar a query em notifications.js
    // Mas para manter compatibilidade, vamos criar um doc na subcoleção de notifications (se aplicável)
    // No Mão Segura, as notificações são criadas por triggers ou localmente.
    
    return docRef.id;
}

/**
 * Aceita um pedido de conexão e abre a sala de chat.
 */
export async function acceptConnectionRequest(requestId, user, senderId) {
    // 1. Marcar como aceite
    const reqRef = doc(db, 'connection_requests', requestId);
    await updateDoc(reqRef, {
        status: 'ACCEPTED',
        updated_at: serverTimestamp()
    });

    // 2. Iniciar a conversa real
    // Neste caso, quem iniciou a conversa original foi o senderId.
    // Vamos buscar a role do sender
    const senderSnap = await getDoc(doc(db, 'users', senderId));
    const senderRole = senderSnap.exists() ? senderSnap.data().role : (user.role === 'WORKER' ? 'EMPLOYER' : 'WORKER');
    
    // Fake the user context to pretend the original sender called startOrGetConversation, 
    // but actually we just call it.
    // Notice startOrGetConversation signature: (user, targetId, metadata)
    // It assumes `user` is the initiator. So we pass sender info as initiator.
    const initiator = { uid: senderId, role: senderRole };
    
    const conversationId = await startOrGetConversation(initiator, user.uid, {
        last_message: 'O seu pedido de contacto foi aceite!'
    });

    // 3. Adicional: Criar a conexão mútua (se implementado)
    await addDoc(collection(db, 'connections'), {
        user1_id: user.uid,
        user2_id: senderId,
        created_at: serverTimestamp()
    });

    return conversationId;
}

export async function rejectConnectionRequest(requestId) {
    const reqRef = doc(db, 'connection_requests', requestId);
    await updateDoc(reqRef, {
        status: 'REJECTED',
        updated_at: serverTimestamp()
    });
}
