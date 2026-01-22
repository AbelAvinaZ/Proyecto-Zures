import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableHeader = ({ id, title, onDelete }) => {
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
    opacity: isDragging ? 0.7 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 px-2 py-1 group"
    >
      {/* Grip para arrastrar (solo este div tiene los listeners) */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 select-none"
      >
        ⋮⋮
      </div>

      {/* Título */}
      <span className="flex-1">{title}</span>

      {/* Botón eliminar: solo visible al hover */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // evita que active drag
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm font-bold transition-opacity"
        title="Eliminar columna"
      >
        ×
      </button>
    </div>
  );
};

export default SortableHeader;
