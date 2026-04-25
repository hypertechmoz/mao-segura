import { create } from 'zustand';

export const useAlertStore = create((set) => ({
    alerts: [],
    showAlert: (title, message, type = 'success') => {
        const id = Date.now().toString();
        set((state) => ({ alerts: [...state.alerts, { id, title, message, type }] }));
        setTimeout(() => {
            set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
        }, 4000);
    },
    removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }))
}));
