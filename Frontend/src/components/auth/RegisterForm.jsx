import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const schema = yup.object({
  name: yup
    .string()
    .min(2, "Nombre mínimo 2 caracteres")
    .required("Nombre obligatorio"),
  email: yup.string().email("Correo inválido").required("Correo obligatorio"),
  password: yup
    .string()
    .min(6, "Contraseña mínimo 6 caracteres")
    .required("Contraseña obligatoria"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña"),
});

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res.data.success) {
        toast.success(
          res.data.message || "Registro exitoso. Verifica tu correo."
        );
        navigate("/login");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Error al registrar";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Nombre completo"
          {...register("name")}
          className="w-full p-2 border rounded"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register("email")}
          className="w-full p-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Contraseña"
          {...register("password")}
          className="w-full p-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirmar contraseña"
          {...register("confirmPassword")}
          className="w-full p-2 border rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;
