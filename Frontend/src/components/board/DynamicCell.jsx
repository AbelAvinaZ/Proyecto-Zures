import { useEffect, useRef } from "react";
import TextCell from "./cells/TextCell";
import NumberCell from "./cells/NumberCell";
import DateCell from "./cells/DateCell";
import CheckboxCell from "./cells/CheckboxCell";
import LocationCell from "./cells/LocationCell";
import TimelineCell from "./cells/TimelineCell";
import StatusCell from "./cells/StatusCell";
import PriorityCell from "./cells/PriorityCell";
import SelectCell from "./cells/SelectCell";
import UserCell from "./cells/UserCell";
import TagsCell from "./cells/TagsCell";
import FilesCell from "./cells/FilesCell";
import FormulaCell from "./cells/FormulaCell";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mapa de tipos → componentes
const cellComponents = {
  TEXT: TextCell,
  NUMBER: NumberCell,
  DATE: DateCell,
  CHECKBOX: CheckboxCell,
  LOCATION: LocationCell,
  TIMELINE: TimelineCell,
  STATUS: StatusCell,
  PRIORITY: PriorityCell,
  SELECT: SelectCell,
  USER: UserCell,
  TAGS: TagsCell,
  FILES: FilesCell,
  FORMULA: FormulaCell,
  // Si aparece un tipo desconocido, usamos un fallback simple
  DEFAULT: ({ value }) => (
    <div className="text-gray-500 italic">
      Tipo no soportado: {value ?? "-"}
    </div>
  ),
};

const DynamicCell = ({
  value,
  column,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
  boardId,
  columnIndex,
  rowIndex,
  board,
}) => {
  const containerRef = useRef(null);

  // Manejo de click fuera para cancelar edición
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCancel();
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, onCancel, setIsEditing]);

  // Caso especial: columna "updatedBy" (fija, no editable)
  if (column.id === "updatedBy") {
    const item = board.items[rowIndex];
    const updatedByUser = item?.updatedBy;
    const updatedAt = item?.updatedAt;

    if (!updatedByUser || !updatedAt) {
      return <span className="text-gray-400">-</span>;
    }

    const date = format(new Date(updatedAt), "dd/MM/yyyy HH:mm", {
      locale: es,
    });

    return (
      <div className="flex items-center gap-3 px-2">
        <img
          src={
            updatedByUser.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedByUser.name)}&background=random&size=128`
          }
          alt={updatedByUser.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {updatedByUser.name}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
      </div>
    );
  }

  // Seleccionamos el componente según el tipo
  const CellComponent = cellComponents[column.type] || cellComponents.DEFAULT;

  return (
    <div
      ref={containerRef}
      className={`relative h-full flex items-center px-2 cursor-pointer group min-h-10
        ${isEditing ? "bg-blue-50 border-2 border-blue-400 rounded" : ""}`}
      onClick={() =>
        column.id !== "updatedBy" && !isEditing && setIsEditing(true)
      }
    >
      <CellComponent
        value={value}
        column={column}
        isEditing={isEditing}
        onSave={(newValue) => {
          onSave(newValue);
          setIsEditing(false); // Cerramos edición después de guardar
        }}
        onCancel={() => {
          onCancel();
          setIsEditing(false);
        }}
        boardId={boardId}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        board={board}
      />

      {/* Icono de lápiz solo si no es fórmula ni updatedBy */}
      {!isEditing && column.type !== "FORMULA" && column.id !== "updatedBy" && (
        <div className="opacity-0 group-hover:opacity-60 transition-opacity absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DynamicCell;
