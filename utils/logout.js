import { useAuthStore } from '../store/authStore';

/** Navigate to login first, then clear session (avoids crash on tabs while user becomes null). */
export async function logoutAndRedirect(router) {
    try {
        router?.replace?.('/auth/login');
    } catch (e) {
        console.warn('Navigation during logout:', e);
    }
    await useAuthStore.getState().logout();
}
