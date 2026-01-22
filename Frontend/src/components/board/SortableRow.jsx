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
      {/* Celda con grip + botón eliminar (solo visible al hover) */}
      <td className="w-16 text-center px-2 py-4 flex items-center gap-3">
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
            e.stopPropagation(); // evita que active drag
            onDeleteRow();
          }}
          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 font-bold text-lg transition-opacity"
          title="Eliminar fila"
        >
          ×
        </button>
      </td>

      {/* Resto de celdas */}
      {children}
    </tr>
  );
};

export default SortableRow;
