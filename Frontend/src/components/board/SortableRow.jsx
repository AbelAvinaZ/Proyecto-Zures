import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableRow = ({ children, id, onDeleteRow }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: isDragging ? "#f3f4f6" : "transparent",
  };

  return (
    <tr ref={setNodeRef} style={style} className="group">
      {/* ✅ Celda extra para acciones (AHORA ALINEADA porque hay TH equivalente) */}
      <td className="w-16 px-4 py-4 align-middle">
        <div className="flex items-center justify-center gap-3">
          {/* Grip siempre visible para arrastrar */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600 select-none"
          >
            ⋮⋮
          </div>

          {/* Botón × solo visible al hover sobre la fila */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow();
            }}
            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 font-bold text-lg transition-opacity"
            title="Eliminar fila"
          >
            ×
          </button>
        </div>
      </td>

      {/* Resto de celdas */}
      {children}
    </tr>
  );
};

export default SortableRow;
