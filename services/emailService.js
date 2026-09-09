import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { KWICK_APP_URL } from '../utils/authRedirect';

const welcomeSentKey = (userId) => `kwick_welcome_email_${userId}`;

export async function sendKwickTransactionalEmail(type, { email, name }) {
    if (!email) return { ok: false, skipped: true };

    try {
        const { data, error } = await supabase.functions.invoke('send-kwick-email', {
            body: {
                type,
                email,
                name: name || 'Utilizador',
                appUrl: KWICK_APP_URL,
            },
        });

        if (error) {
            console.warn('[emailService]', type, error.message || error);
            return { ok: false, error };
        }

        return { ok: true, data };
    } catch (err) {
        console.warn('[emailService]', type, err);
        return { ok: false, error: err };
    }
}

/** Sends welcome email once per user after email verification. */
export async function sendWelcomeEmailOnce(user) {
    const userId = user?.id || user?.uid;
    const email = user?.email;
    if (!userId || !email || !user?.emailVerified) return;

    const key = welcomeSentKey(userId);
    const already = await AsyncStorage.getItem(key);
    if (already === '1') return;

    const result = await sendKwickTransactionalEmail('welcome', {
        email,
        name: user.name || user.firstName,
    });

    if (result.ok) {
        await AsyncStorage.setItem(key, '1');
    }
}
