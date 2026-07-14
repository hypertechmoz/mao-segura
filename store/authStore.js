import { create } from 'zustand';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'mao_segura_user_session';
let hasInitializedAuthStore = false;
let authStateSubscription = null;
let authInitializePromise = null;

const normalizeStoredUser = (storedUser) => {
    if (!storedUser || typeof storedUser !== 'object') return storedUser;

    const normalizedUser = { ...storedUser };

    if (normalizedUser.uid) {
        normalizedUser.id = normalizedUser.uid;
    }

    return normalizedUser;
};

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthActionLoading: false,
    isOnboarded: false,

    setOnboarded: () => set({ isOnboarded: true }),

    initialize: async () => {
        if (authInitializePromise) {
            return authInitializePromise;
        }

        if (hasInitializedAuthStore) {
            set({ isLoading: false });
            return;
        }

        set({ isLoading: true });

        authInitializePromise = (async () => {
            try {
                const saved = await AsyncStorage.getItem(PERSISTENCE_KEY);
                if (saved) {
                    const cachedUser = normalizeStoredUser(JSON.parse(saved));
                    set({ user: cachedUser, session: { user: cachedUser }, isLoading: false });
                }
            } catch (e) {
                console.error('Error reading persistence:', e);
            }

            // Get initial session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                await AsyncStorage.removeItem(PERSISTENCE_KEY);
                set({ user: null, session: null, isLoading: false });
                hasInitializedAuthStore = true;
                return;
            }

            if (session) {
                await get().refreshUser(session.user);
            } else {
                set({ isLoading: false });
            }

            authStateSubscription?.unsubscribe?.();
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (session) {
                    await get().refreshUser(session.user);
                } else {
                    set({ user: null, session: null, isLoading: false });
                    await AsyncStorage.removeItem(PERSISTENCE_KEY);
                }
            });
            authStateSubscription = subscription;
            hasInitializedAuthStore = true;
        })().finally(() => {
            authInitializePromise = null;
        });

        return authInitializePromise;
    },

    refreshUser: async (supabaseUser = null) => {
        try {
            const user = supabaseUser || (await supabase.auth.getUser()).data.user;
            if (!user) {
                set({ isLoading: false });
                return;
            }

            const uid = user.id;

            // 1. Fetch base metadata from Users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', uid)
                .maybeSingle(); // maybeSingle handles "not found" without error 406/404

            if (userError) {
                console.warn('Profile fetch warning:', userError.message);
                // Don't throw, just set loading false. The user record might not be ready yet.
                set({ isLoading: false });
                return;
            }

            if (!userData) {
                set({ isLoading: false });
                return;
            }

            // 2. Fetch role-specific profile data
            const role = userData.role;
            let profileData = {};
            let profileRecord = null;
            if (role) {
                const profileTable = role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                const { data: pData, error: pError } = await supabase
                    .from(profileTable)
                    .select('*')
                    .eq('user_id', uid)
                    .maybeSingle();

                if (!pError && pData) {
                    profileRecord = pData;
                    const { id: _profileId, user_id: _profileUserId, ...profileFields } = pData;
                    profileData = profileFields;
                }
            }

            const enrichedUser = {
                uid: uid,
                id: uid,
                email: user.email,
                emailVerified: !!user.email_confirmed_at,
                ...userData,
                ...profileData,
                profileId: profileRecord?.id || null,
                workerProfile: role === 'WORKER' ? profileRecord : null,
                employerProfile: role === 'EMPLOYER' ? profileRecord : null,
            };

            enrichedUser.name = userData.name || 'Utilizador';
            enrichedUser.firstName = enrichedUser.name.split(' ')[0];

            await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(enrichedUser));

            set({
                user: enrichedUser,
                session: { user: enrichedUser },
                isLoading: false
            });
        } catch (error) {
            console.error('Refresh user error:', error);
            set({ isLoading: false });
        }
    },

    register: async (email, password, userData) => {
        set({ isAuthActionLoading: true });
        try {
            const { name, role, phone, province, city, bairro } = userData;
            const normalizedPhone = phone?.trim() ? phone.trim() : null;
            const metadata = {
                name,
                role: role || 'WORKER',
                province,
                city,
                bairro,
            };

            if (normalizedPhone) {
                metadata.phone = normalizedPhone;
            }

            // SignUp with metadata - the database trigger handle_new_user() 
            // will automatically create the public.users and profile records.
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (authError) throw authError;

            // The session might not be active yet if email confirmation is required.
            // If it is active, refreshUser will load the data from public.users.
            if (authData.session) {
                await get().refreshUser(authData.user);
            }

            return { user: authData.user, session: authData.session };
        } catch (error) {
            console.error('Registration error:', error);
            if (error?.message?.includes('users_phone_key') || error?.message?.includes('duplicate key value violates unique constraint')) {
                throw new Error('Este número de telefone já está associado a outra conta.');
            }
            if (error?.message?.includes('Database error saving new user')) {
                throw new Error('Não foi possível criar a conta. Se preencheu telefone, confirme que ele ainda não está em uso.');
            }
            throw error;
        } finally {
            set({ isAuthActionLoading: false });
        }
    },

    loginWithPassword: async (email, password) => {
        set({ isAuthActionLoading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            await get().refreshUser(data.user);
            return { user: get().user };
        } catch (error) {
            if (error.message === 'Invalid login credentials') {
                throw new Error('Email ou senha incorretos.');
            }
            throw error;
        } finally {
            set({ isAuthActionLoading: false });
        }
    },

    requestPasswordReset: async (email) => {
        set({ isAuthActionLoading: true });
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        } finally {
            set({ isAuthActionLoading: false });
        }
    },

    logout: async () => {
        set({ user: null, session: null, isLoading: false, isAuthActionLoading: false });
        try {
            await AsyncStorage.removeItem(PERSISTENCE_KEY);
            // Sign out locally only to prevent hanging the auth queue on slow networks
            await supabase.auth.signOut({ scope: 'local' });
        } catch (error) { // DO NOT throw error; allow the local logout to succeed even if backend signout fails
        } finally {
            set({ isLoading: false, isAuthActionLoading: false });
        }
    },

    checkEmailVerification: async () => {
        try {
            // Use getSession instead of getUser to avoid 403 Forbidden
            // getSession() will refresh the local state and we can check the user from there
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session?.user) return false;

            const user = session.user;

            if (user?.email_confirmed_at) {
                // If confirmed, refresh our enriched profile
                await get().refreshUser(user);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Verification check error:', e);
            return false;
        }
    },

    resendVerificationEmail: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada");
        await supabase.auth.resend({
            type: 'signup',
            email: user.email,
        });
    },

    deleteAccount: async (password) => {
        if (!password) throw new Error("A senha é obrigatória para eliminar a conta.");

        set({ isAuthActionLoading: true });
        try {
            const { user } = get();
            if (!user?.email) throw new Error("Utilizador não autenticado.");

            // 1. Verify password by attempting a re-login
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password,
            });

            if (signInError) {
                throw new Error("Senha incorreta. Não foi possível eliminar a conta.");
            }

            // 2. Call the RPC to delete the user
            const { error: deleteError } = await supabase.rpc('delete_own_user');
            if (deleteError) throw deleteError;

            // 3. Clear local session
            await AsyncStorage.removeItem(PERSISTENCE_KEY);
            set({ user: null, session: null });

            return true;
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        } finally {
            set({ isAuthActionLoading: false });
        }
    },

    signInWithGoogle: async () => {
        set({ isAuthActionLoading: true });
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'maosegura://home',
                    skipBrowserRedirect: false,
                }
            });
            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        } finally {
            set({ isAuthActionLoading: false });
        }
    },

    setUser: (user) => set({ user }),
}));
