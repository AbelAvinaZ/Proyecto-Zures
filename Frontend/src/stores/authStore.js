import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            rememberedEmail: null,

            setUser: (userData, token, remember = false) => {
                set({
                    user: userData,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                if (remember) {
                    set({ rememberedEmail: userData.email });
                    Cookies.set('jwt', token, { expires: 30, path: '/', secure: true, sameSite: 'none' });
                } else {
                    Cookies.set('jwt', token, { path: '/', secure: true, sameSite: 'none' });
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                Cookies.remove('jwt');
            },

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (err) => set({ error: err }),

            checkAuth: () => {
                const token = Cookies.get('jwt');
                if (token) {
                    // Aquí puedes validar el token con backend si quieres (ej. GET /users/me)
                    // Por ahora, asumimos que si hay token, está autenticado
                    set({ token, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            setRememberedEmail: (email) => set({ rememberedEmail: email }),
        }),
        {
            name: 'auth-storage', // Nombre para persistencia
            partialize: (state) => ({ rememberedEmail: state.rememberedEmail }), // Solo persistir email
        }
    )
);

export default useAuthStore;