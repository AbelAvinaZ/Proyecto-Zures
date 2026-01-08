import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../utils/api";
import { toast } from "react-toastify";

const schema = yup.object({
  name: yup
    .string()
    .min(3, "Mínimo 3 caracteres")
    .required("Nombre obligatorio"),
  description: yup.string().max(500, "Máximo 500 caracteres").optional(),
  isPrivate: yup.boolean().default(false),
});

const CreateWorkspaceModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/workspaces", data);
      if (res.data.success) {
        toast.success("Workspace creado correctamente");
        onSuccess();
        reset();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al crear workspace");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Crear nuevo Workspace</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              placeholder="Nombre del workspace"
              {...register("name")}
              className="w-full p-2 border rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Descripción (opcional)"
              {...register("description")}
              className="w-full p-2 border rounded"
              rows="3"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <label className="flex items-center">
            <input type="checkbox" {...register("isPrivate")} />
            <span className="ml-2">Workspace privado (solo invitados)</span>
          </label>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
