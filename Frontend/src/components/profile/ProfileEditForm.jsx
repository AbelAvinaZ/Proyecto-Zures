import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authHooks from "../../hooks/useAuthActions";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";

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
  const { useUpdateProfile, useChangePassword } = authHooks;
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user.name, avatar: user.avatar },
  });

  const onSubmit = (data) => {
    // Primero actualiza perfil (nombre/avatar)
    if (data.name || data.avatar) {
      updateProfileMutation.mutate(
        { name: data.name, avatar: data.avatar },
        {
          onSuccess: (res) => {
            setUser(res.data.user);
            toast.success("Perfil actualizado");
          },
          onError: (err) =>
            toast.error(
              err.response?.data?.message || "Error al actualizar perfil",
            ),
        },
      );
    }

    // Si hay cambio de contraseña
    if (data.newPassword) {
      changePasswordMutation.mutate(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          onSuccess: () => toast.success("Contraseña cambiada"),
          onError: (err) =>
            toast.error(
              err.response?.data?.message || "Error al cambiar contraseña",
            ),
        },
      );
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
