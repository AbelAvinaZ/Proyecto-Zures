import useAuthStore from '../stores/authStore';

const useAuth = () => {
    const { user, token, isAuthenticated, isLoading, error, setUser, logout, setLoading, setError, checkAuth, rememberedEmail, setRememberedEmail } = useAuthStore();

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        setUser,
        logout,
        setLoading,
        setError,
        checkAuth,
        rememberedEmail,
        setRememberedEmail,
    };
};

export default useAuth;