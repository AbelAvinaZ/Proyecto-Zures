import { useRef, useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const PickerInput = forwardRef(
  ({ value, onClick, onKeyDown, placeholder }, ref) => (
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      onKeyDown={onKeyDown}
      readOnly
      placeholder={placeholder}
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  ),
);
PickerInput.displayName = "PickerInput";

const TimelineCell = ({ value, isEditing, onSave, onCancel }) => {
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const initialValue = value || { start: null, end: null };
  const [editValue, setEditValue] = useState(initialValue);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset al entrar en edición (tu patrón actual)
  if (isEditing && !prevEditing) {
    setEditValue(value || { start: null, end: null });
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  // Focus automático al entrar en edición
  useEffect(() => {
    if (isEditing) {
      startInputRef.current?.focus();
    }
  }, [isEditing]);

  const normalize = (d) => (d ? new Date(d).toISOString() : null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave({
        start: editValue.start ? normalize(editValue.start) : null,
        end: editValue.end ? normalize(editValue.end) : null,
      });
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      setEditValue(value || { start: null, end: null });
    }
  };

  if (!isEditing) {
    const { start, end } = value || {};
    if (!start && !end) {
      return <span className="text-gray-400">-</span>;
    }

    let text = "";
    if (start && end) {
      const days = differenceInDays(new Date(end), new Date(start)) + 1;
      text = `del ${format(new Date(start), "dd/MM/yyyy", { locale: es })} al ${format(
        new Date(end),
        "dd/MM/yyyy",
        { locale: es },
      )} - ${days} días`;
    } else if (start) {
      text = `Inicio: ${format(new Date(start), "dd/MM/yyyy", { locale: es })}`;
    } else if (end) {
      text = `Fin: ${format(new Date(end), "dd/MM/yyyy", { locale: es })}`;
    }

    return <span className="text-gray-700">{text}</span>;
  }

  return (
    <div className="flex flex-col gap-2 w-full" onKeyDown={handleKeyDown}>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Inicio</label>

        <DatePicker
          selected={editValue.start ? new Date(editValue.start) : null}
          onChange={(date) => {
            // Si cambias inicio y el fin queda antes, lo limpiamos
            const newStart = date ? date : null;
            const currentEnd = editValue.end ? new Date(editValue.end) : null;

            let newEnd = editValue.end;
            if (newStart && currentEnd && currentEnd < newStart) {
              newEnd = null;
            }

            setEditValue({ ...editValue, start: newStart, end: newEnd });
          }}
          dateFormat="dd/MM/yyyy"
          locale={es}
          placeholderText="Fecha de inicio"
          isClearable
          popperClassName="z-50"
          customInput={
            <PickerInput
              ref={startInputRef}
              placeholder="Fecha de inicio"
              onKeyDown={(e) => {
                handleKeyDown(e);
                // Tab te manda al fin
                if (e.key === "Tab" && !e.shiftKey) {
                  // pequeño delay para que no se trague el foco
                  setTimeout(() => endInputRef.current?.focus(), 0);
                }
              }}
            />
          }
          onCalendarClose={() =>
            onSave({
              start: editValue.start ? normalize(editValue.start) : null,
              end: editValue.end ? normalize(editValue.end) : null,
            })
          }
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Fin</label>

        <DatePicker
          selected={editValue.end ? new Date(editValue.end) : null}
          onChange={(date) =>
            setEditValue({ ...editValue, end: date ? date : null })
          }
          dateFormat="dd/MM/yyyy"
          locale={es}
          placeholderText="Fecha de fin"
          minDate={editValue.start ? new Date(editValue.start) : null}
          isClearable
          popperClassName="z-50"
          customInput={
            <PickerInput
              ref={endInputRef}
              placeholder="Fecha de fin"
              onKeyDown={handleKeyDown}
            />
          }
          onCalendarClose={() =>
            onSave({
              start: editValue.start ? normalize(editValue.start) : null,
              end: editValue.end ? normalize(editValue.end) : null,
            })
          }
        />
      </div>
    </div>
  );
};

export default TimelineCell;
