import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authHooks from "../../hooks/useAuthActions";
import useAuth from "../../hooks/useAuth";

const schema = yup.object({
  email: yup.string().email("Correo inválido").required("Correo obligatorio"),
  password: yup
    .string()
    .min(6, "Contraseña de al menos 6 caracteres")
    .required("Contraseña obligatoria"),
  rememberMe: yup.boolean().default(false),
});

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: yupResolver(schema) });
  const { setError, rememberedEmail } = useAuth();
  const { useLogin } = authHooks;
  const loginMutation = useLogin();
  const navigate = useNavigate();

  // Recordar email si existe
  if (rememberedEmail) {
    setValue("email", rememberedEmail);
    setValue("rememberMe", true);
  }

  const onSubmit = (data) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Login exitoso");
        navigate("/dashboard");
      },
      onError: (err) => {
        const message =
          err.response?.data?.message || "Error al iniciar sesión";
        setError(message);
        toast.error(message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        type="email"
        placeholder="Correo"
        {...register("email")}
        className="w-full p-2 border rounded"
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Contraseña"
        {...register("password")}
        className="w-full p-2 border rounded"
      />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}

      <label className="flex items-center">
        <input type="checkbox" {...register("rememberMe")} />
        Recordarme
      </label>

      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Iniciar sesión
      </button>
      <ToastContainer />
    </form>
  );
};

export default LoginForm;
