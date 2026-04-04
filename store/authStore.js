import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import {
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// On mobile/native, we use AsyncStorage instead of window.localStorage
const PERSISTENCE_KEY = 'mao_segura_user_session';

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    isLoading: true, // Start as loading until initialized
    isOnboarded: false,

    setOnboarded: () => set({ isOnboarded: true }),

    // Initialize session listener on app start
    initialize: async () => {
        // Tenta recuperar sessão salva primeiro (mais rápido que firebase)
        try {
            const saved = await AsyncStorage.getItem(PERSISTENCE_KEY);
            if (saved) {
                const cachedUser = JSON.parse(saved);
                set({ user: cachedUser, session: { user: cachedUser }, isLoading: false });
            }
        } catch (e) {
            console.error('Error reading persistence:', e);
        }

        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    await get().refreshUser(firebaseUser);
                } catch (error) {
                    console.error('Error fetching user metadata:', error);
                    set({ user: firebaseUser, session: { user: firebaseUser }, isLoading: false });
                }
            } else {
                // Se não há usuário Firebase, mas temos user em cache, mantemos
                // (O login legacy de mock users usa esse fluxo)
                const currentStoredUser = get().user;
                if (!currentStoredUser) {
                    set({ user: null, session: null, isLoading: false });
                } else {
                    set({ isLoading: false });
                }
            }
        });
    },

    refreshUser: async (firebaseObject = null) => {
        const firebaseUser = firebaseObject || auth.currentUser;
        if (!firebaseUser && !get().user?.uid) return;

        const uid = firebaseUser?.uid || get().user.uid;

        try {
            // 1. Fetch base metadata from Users collection
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists()) return;
            const userData = userDoc.data();

            // 2. Fetch role-specific profile data
            const role = userData.role;
            let profileData = {};
            if (role) {
                const profileTable = role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                const profileDoc = await getDoc(doc(db, profileTable, uid));
                if (profileDoc.exists()) {
                    profileData = profileDoc.data();
                }
            }

            const enrichedUser = {
                uid: uid,
                phoneNumber: firebaseUser?.phoneNumber || userData.phoneNumber,
                email: firebaseUser?.email || userData.email,
                emailVerified: firebaseUser?.emailVerified || false,
                ...userData,
                ...profileData,
            };

            // Custom name logic
            enrichedUser.name = userData.name || userData.full_name || firebaseUser?.displayName || get().user?.name || 'Utilizador';
            enrichedUser.firstName = enrichedUser.name.split(' ')[0];

            // Persist for future restarts
            await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(enrichedUser));

            set({
                user: enrichedUser,
                session: { user: enrichedUser },
                isLoading: false
            });
        } catch (error) {
            console.error('Refresh user error:', error);
            throw error;
        }
    },

    // Registo com email e senha (gratuito no Firebase Spark)
    register: async (email, password, userData) => {
        set({ isLoading: true });
        try {
            // 1. Criar conta no Firebase Auth com email/senha
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = credential.user;

            // 2. Enviar email de verificação (gratuito)
            try {
                await sendEmailVerification(firebaseUser);
            } catch (emailErr) {
                console.warn('Email verification send failed (non-critical):', emailErr);
            }

            const { name, role, phone, province, city, bairro } = userData;

            // 3. Criar documento na coleção 'users'
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name,
                role,
                email,
                phoneNumber: phone ? `+258${phone}` : '',
                province,
                city,
                bairro,
                is_permanent: true,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            });

            // 4. Criar perfil específico do role
            const profileTable = role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
            await setDoc(doc(db, profileTable, firebaseUser.uid), {
                name,
                user_id: firebaseUser.uid,
                email,
                phone: phone ? `+258${phone}` : '',
                province,
                city,
                bairro,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            });

            // 5. Construir objecto de utilizador enriquecido
            const enrichedUser = {
                uid: firebaseUser.uid,
                email,
                emailVerified: firebaseUser.emailVerified || false,
                phoneNumber: phone ? `+258${phone}` : '',
                name,
                role,
                province,
                city,
                bairro,
                firstName: name.split(' ')[0],
            };

            await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(enrichedUser));
            set({ user: enrichedUser, session: { user: enrichedUser } });

            return { user: enrichedUser };
        } catch (error) {
            // Traduzir erros de Firebase para Português
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este email já está associado a uma conta existente.');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('O endereço de email inserido não é válido.');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('A senha é demasiado fraca. Use pelo menos 6 caracteres.');
            }
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Login com email e senha
    loginWithPassword: async (email, password) => {
        set({ isLoading: true });
        try {
            // Tentar login via Firebase Auth (novos utilizadores com email)
            try {
                const credential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = credential.user;

                // Buscar dados do Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                let enrichedUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                };

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const role = userData.role;
                    let profileData = {};
                    if (role) {
                        const profileTable = role === 'EMPLOYER' ? 'employer_profiles' : 'worker_profiles';
                        const profileDoc = await getDoc(doc(db, profileTable, firebaseUser.uid));
                        if (profileDoc.exists()) {
                            profileData = profileDoc.data();
                        }
                    }
                    enrichedUser = {
                        ...enrichedUser,
                        ...userData,
                        ...profileData,
                        emailVerified: firebaseUser.emailVerified || false,
                    };
                    enrichedUser.name = userData.name || userData.full_name || 'Utilizador';
                    enrichedUser.firstName = enrichedUser.name.split(' ')[0];
                }

                await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(enrichedUser));
                set({ user: enrichedUser, session: { user: enrichedUser } });

                return { user: enrichedUser };
            } catch (firebaseErr) {
                // Se falhou no Firebase Auth, tentar fallback para utilizadores legacy (mock)
                // que foram criados com o sistema antigo de telefone
                if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
                    // Fallback: pesquisar no Firestore por email
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', email));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        throw new Error('Nenhuma conta encontrada com este email.');
                    }

                    const userDocSnap = querySnapshot.docs[0];
                    const userData = userDocSnap.data();

                    if (!userData.password || userData.password !== password) {
                        throw new Error('Senha incorreta.');
                    }

                    const enrichedUser = {
                        uid: userDocSnap.id,
                        ...userData,
                    };
                    enrichedUser.name = userData.name || userData.full_name || 'Utilizador';
                    enrichedUser.firstName = enrichedUser.name.split(' ')[0];

                    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(enrichedUser));
                    set({ user: enrichedUser, session: { user: enrichedUser } });

                    return { user: enrichedUser };
                }

                // Traduzir outros erros Firebase
                if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
                    throw new Error('Email ou senha incorretos.');
                }
                if (firebaseErr.code === 'auth/too-many-requests') {
                    throw new Error('Demasiadas tentativas. Tente novamente mais tarde.');
                }
                throw firebaseErr;
            }
        } finally {
            set({ isLoading: false });
        }
    },

    // Recuperação de senha via email (gratuito no Firebase)
    requestPasswordReset: async (email) => {
        set({ isLoading: true });
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                throw new Error('Nenhuma conta encontrada com este email.');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('O endereço de email inserido não é válido.');
            }
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await AsyncStorage.removeItem(PERSISTENCE_KEY);
            await signOut(auth);
            set({ user: null, session: null });
        } finally {
            set({ isLoading: false });
        }
    },

    checkEmailVerification: async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return false;

        try {
            await firebaseUser.reload();
            const isVerified = auth.currentUser.emailVerified;
            
            if (isVerified) {
                await get().refreshUser(auth.currentUser);
            }
            return isVerified;
        } catch (error) {
            if (error.code === 'auth/network-request-failed') {
                throw new Error('Falha na rede ao verificar email.');
            }
            throw error;
        }
    },

    resendVerificationEmail: async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) throw new Error("A sessão expirou. Entre novamente.");
        try {
            await sendEmailVerification(firebaseUser);
        } catch (error) {
            if (error.code === 'auth/network-request-failed') {
                throw new Error('Falha na rede. Verifique a sua ligação à internet.');
            }
            throw error;
        }
    },

    deleteAccount: async () => {
        set({ isLoading: true });
        try {
            const currentUser = get().user;
            if (!currentUser) throw new Error("Não há utilizador logado.");

            const uid = currentUser.uid;

            // Delete specialized
            if (currentUser.role === 'EMPLOYER') {
                try { await deleteDoc(doc(db, 'employer_profiles', uid)); } catch (e) {}
            } else if (currentUser.role === 'WORKER') {
                try { await deleteDoc(doc(db, 'worker_profiles', uid)); } catch (e) {}
            }

            // Delete main user row
            try { await deleteDoc(doc(db, 'users', uid)); } catch (e) {}

            // Delete from Firebase Auth if real user
            if (auth.currentUser) {
                try { await auth.currentUser.delete(); } catch (e) { console.error("Firebase auth delete failed:", e); }
            }

            await AsyncStorage.removeItem(PERSISTENCE_KEY);
            await signOut(auth);
            set({ user: null, session: null });
        } catch (error) {
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    setUser: (user) => set({ user }),
}));
