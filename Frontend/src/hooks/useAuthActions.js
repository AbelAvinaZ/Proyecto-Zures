import { useMutation } from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';
import {
    registerUser,
    verifyEmailToken,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    updateMyProfile,
    changeMyPassword,
} from '../api';

const useRegister = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};

const useVerifyEmail = () => {
    return useMutation({
        mutationFn: verifyEmailToken,
    });
};

const useLogin = () => {
    const { setUser, setRememberedEmail } = useAuthStore();
    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setUser(data.data.user, data.token, data.rememberMe);
            if (data.rememberMe) {
                setRememberedEmail(data.data.user.email);
            }
        },
    });
};

const useLogout = () => {
    const { logout } = useAuthStore();
    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => logout(),
    });
};

const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
    });
};

const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, data }) => resetPassword(token, data),
    });
};

const useUpdateProfile = () => {
    const { setUser } = useAuthStore();
    return useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (data) => setUser(data.data.user),
    });
};

const useChangePassword = () => {
    return useMutation({
        mutationFn: changeMyPassword,
    });
};

export default {
    useRegister,
    useVerifyEmail,
    useLogin,
    useLogout,
    useForgotPassword,
    useResetPassword,
    useUpdateProfile,
    useChangePassword,
};