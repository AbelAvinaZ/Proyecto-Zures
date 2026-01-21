import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useColumnTypes from "../../hooks/useColumnTypes";
import { useState } from "react";

const baseSchema = yup.object({
  name: yup
    .string()
    .min(2, "Nombre mínimo 2 caracteres")
    .required("Nombre obligatorio"),
  type: yup.string().required("Tipo obligatorio"),
  order: yup.number().positive().integer().optional(),
});

const AddColumnModal = ({ isOpen, onClose, onSubmit }) => {
  const { data: columnTypes = [], isLoading } = useColumnTypes();
  const [optionsInput, setOptionsInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(baseSchema),
  });

  const selectedType = watch("type");

  const onFormSubmit = (data) => {
    let finalData = { ...data };

    // Si es SELECT y hay opciones escritas
    if (selectedType === "SELECT" && optionsInput.trim()) {
      const optionsArray = optionsInput
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);

      finalData.config = { options: optionsArray };
    }

    onSubmit(finalData);
    reset();
    setOptionsInput("");
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          Cargando tipos de columnas...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Agregar Nueva Columna</h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la columna
            </label>
            <input
              placeholder="Ej: Estado, Responsable, Fecha límite..."
              {...register("name")}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de columna
            </label>
            <select
              {...register("type")}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un tipo</option>
              {columnTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) +
                    type.slice(1).toLowerCase().replace(/_/g, " ")}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Campo dinámico para SELECT */}
          {selectedType === "SELECT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opciones (separadas por coma)
              </label>
              <textarea
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Ej: Ventas, Marketing, Soporte, Desarrollo"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estas opciones aparecerán en el selector de la columna.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden (opcional)
            </label>
            <input
              type="number"
              placeholder="Ej: 1, 2, 3..."
              {...register("order")}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Agregar Columna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal;
