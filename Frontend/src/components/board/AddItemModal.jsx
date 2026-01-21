import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ChromePicker } from "react-color";
import { useState } from "react";
import useUsersForSelect from "../../hooks/useUsersForSelect";
import { openUploadWidget } from "../../utils/cloudinaryWidget";

const AddItemModal = ({ isOpen, onClose, board, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: board.columns.reduce((acc, col) => {
      acc[col.name] = col.type === "TIMELINE" ? { start: null, end: null } : "";
      return acc;
    }, {}),
  });

  const [newTagColor, setNewTagColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { data: usersOptions = [] } = useUsersForSelect();

  const onSubmit = (data) => {
    const values = {};
    board.columns.forEach((col, index) => {
      const key = index.toString();
      let val = data[col.name];

      // Ajustes finales por tipo si es necesario
      if (col.type === "TIMELINE") {
        val = val || { start: null, end: null };
      } else if (col.type === "USER" || col.type === "TAGS") {
        val = val || [];
      } else if (col.type === "FORMULA") {
        val = ""; // No se edita
      }

      values[key] = val;
    });

    onSuccess(values);
    reset();
    onClose();
    toast.success("Item agregado correctamente");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Agregar nuevo Item</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {board.columns.map((col) => (
            <div key={col.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {col.name}{" "}
                <span className="text-gray-500 text-xs">({col.type})</span>
              </label>

              {col.type === "LOCATION" ? (
                <input
                  type="text"
                  placeholder="Escribe la dirección o ubicación..."
                  {...register(col.name)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : col.type === "TIMELINE" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Inicio
                    </label>
                    <DatePicker
                      selected={
                        watch(col.name)?.start
                          ? new Date(watch(col.name).start)
                          : null
                      }
                      onChange={(date) =>
                        setValue(col.name, { ...watch(col.name), start: date })
                      }
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      placeholderText="Fecha de inicio"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      isClearable
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Fin
                    </label>
                    <DatePicker
                      selected={
                        watch(col.name)?.end
                          ? new Date(watch(col.name).end)
                          : null
                      }
                      onChange={(date) =>
                        setValue(col.name, { ...watch(col.name), end: date })
                      }
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      placeholderText="Fecha de fin"
                      minDate={
                        watch(col.name)?.start
                          ? new Date(watch(col.name).start)
                          : null
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      isClearable
                    />
                  </div>
                </div>
              ) : col.type === "TAGS" ? (
                <div className="relative">
                  <CreatableSelect
                    isMulti
                    value={watch(col.name) || []}
                    onChange={(tags) => setValue(col.name, tags || [])}
                    options={[]} // Puedes cargar sugerencias si quieres
                    formatCreateLabel={(input) => `Crear "${input}"`}
                    onCreateOption={(input) => {
                      const newTag = { name: input, color: newTagColor };
                      setValue(col.name, [...(watch(col.name) || []), newTag]);
                    }}
                    placeholder="Agrega tags..."
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      Color para nuevo tag:
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: newTagColor }}
                      />
                    </button>
                    {showColorPicker && (
                      <div className="absolute z-50 mt-2">
                        <ChromePicker
                          color={newTagColor}
                          onChangeComplete={(color) =>
                            setNewTagColor(color.hex)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : col.type === "USER" ? (
                <Select
                  isMulti
                  value={
                    usersOptions.filter((opt) =>
                      watch(col.name)?.includes(opt.value),
                    ) || []
                  }
                  onChange={(opts) =>
                    setValue(col.name, opts ? opts.map((o) => o.value) : [])
                  }
                  options={usersOptions}
                  formatOptionLabel={(opt) => (
                    <div className="flex items-center gap-2">
                      <img
                        src={opt.avatar}
                        alt={opt.label}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.email}</div>
                      </div>
                    </div>
                  )}
                  placeholder="Selecciona usuarios..."
                />
              ) : col.type === "FORMULA" ? (
                <div className="p-2 bg-gray-100 rounded text-gray-600 italic">
                  Valor calculado automáticamente (no editable)
                </div>
              ) : col.type === "FILES" ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Lógica similar a handleUploadFiles de DynamicCell
                      openUploadWidget(
                        {
                          cloudName: "dyiip3vvj",
                          uploadPreset: "zures_unsigned",
                          folder: `zures/workspaces/${board.workspaceId?.name || "unnamed"}/boards/${board.name || "unnamed"}/nuevo-item`,
                          maxFiles: 10,
                        },
                        (error, result) => {
                          if (!error && result && result.event === "success") {
                            const files = result.info.map((f) => ({
                              public_id: f.public_id,
                              url: f.secure_url,
                              original_filename: f.original_filename,
                              resource_type: f.resource_type,
                            }));
                            setValue(col.name, files);
                          }
                        },
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Subir archivos (máx 10)
                  </button>

                  {watch(col.name)?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watch(col.name).map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm"
                        >
                          {file.original_filename}
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = watch(col.name).filter(
                                (_, idx) => idx !== i,
                              );
                              setValue(col.name, newFiles);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={col.type === "NUMBER" ? "number" : "text"}
                  placeholder={`Valor para ${col.name}`}
                  {...register(col.name)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

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
