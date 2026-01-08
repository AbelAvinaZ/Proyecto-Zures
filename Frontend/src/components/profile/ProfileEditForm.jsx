import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const schema = yup.object({
  name: yup.string().min(2, "Nombre mínimo 2 caracteres").optional(),
  avatar: yup.string().url("URL inválida").optional(),
  currentPassword: yup.string().when("newPassword", {
    is: (val) => !!val,
    then: yup.string().required("Contraseña actual obligatoria"),
  }),
  newPassword: yup
    .string()
    .min(6, "Nueva contraseña mínimo 6 caracteres")
    .optional(),
});

const ProfileEditForm = () => {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user.name, avatar: user.avatar },
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.patch("/users/me", data);
      if (res.data.success) {
        setUser(res.data.data.user, res.data.token || Cookies.get("jwt"));
        toast.success("Perfil actualizado");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        placeholder="Nombre"
        {...register("name")}
        className="w-full p-2 border rounded"
      />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <input
        placeholder="Avatar URL"
        {...register("avatar")}
        className="w-full p-2 border rounded"
      />
      {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}

      <input
        type="password"
        placeholder="Contraseña actual"
        {...register("currentPassword")}
        className="w-full p-2 border rounded"
      />
      {errors.currentPassword && (
        <p className="text-red-500">{errors.currentPassword.message}</p>
      )}

      <input
        type="password"
        placeholder="Nueva contraseña"
        {...register("newPassword")}
        className="w-full p-2 border rounded"
      />
      {errors.newPassword && (
        <p className="text-red-500">{errors.newPassword.message}</p>
      )}

      <button
        type="submit"
        className="w-full p-2 bg-green-500 text-white rounded"
      >
        Guardar cambios
      </button>
    </form>
  );
};

export default ProfileEditForm;
