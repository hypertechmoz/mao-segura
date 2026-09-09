import { Platform } from 'react-native';

/** Redirect URL for Supabase signup / email verification links */
export function getEmailRedirectTo() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return `${window.location.origin}/auth/verify-email`;
    }
    return 'maosegura://auth/verify-email';
}

export const KWICK_APP_URL =
    Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'https://morstar-kwick.web.app';
