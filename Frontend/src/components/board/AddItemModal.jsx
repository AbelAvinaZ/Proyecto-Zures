import { useForm } from "react-hook-form";
// import * as yup from "yup";
import { toast } from "react-toastify";

const AddItemModal = ({ isOpen, onClose, board, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Schema dinámico basado en columnas (por ahora todos opcionales)
  //   const dynamicSchema = yup.object(
  //     board.columns.reduce((acc, col) => {
  //       acc[col.name] = yup.string().optional(); // Cambia según tipo después
  //       return acc;
  //     }, {}),
  //   );

  const onSubmit = (data) => {
    // Convertimos los valores a un objeto { "0": valorColumna1, "1": valorColumna2, ... }
    const values = {};
    board.columns.forEach((col, index) => {
      values[index.toString()] = data[col.name] || "";
    });

    onSuccess(values);
    reset();
    onClose();
    toast.success("Item agregado (pendiente guardar en backend)");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Agregar nuevo Item</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {board.columns.map((col) => (
            <div key={col.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {col.name} ({col.type})
              </label>
              <input
                type="text" // Cambia según tipo (checkbox, date, etc.)
                placeholder={`Valor para ${col.name}`}
                {...register(col.name)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[col.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[col.name].message}
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Agregar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
