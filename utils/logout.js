import { useAuthStore } from '../store/authStore';

/** Logout safely */
export async function logoutAndRedirect(router) {
    try {
        await useAuthStore.getState().logout();
        // Fallback redirection in case root layout doesn't catch it quickly enough
        setTimeout(() => {
            router?.replace?.('/auth/login');
        }, 100);
    } catch (e) {
        console.warn('Error during logout:', e);
    }
}
