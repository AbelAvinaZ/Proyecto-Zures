import { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const TimelineCell = ({ value, isEditing, onSave, onCancel }) => {
  const startRef = useRef(null);
  const endRef = useRef(null);

  const initialValue = value || { start: null, end: null };
  const [editValue, setEditValue] = useState(initialValue);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset al entrar en edición
  if (isEditing && !prevEditing) {
    setEditValue(value || { start: null, end: null });
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && startRef.current) {
      const input = startRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSave(editValue);
    } else if (e.key === "Escape") {
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
      text = `del ${format(new Date(start), "dd/MM/yyyy", { locale: es })} al ${format(new Date(end), "dd/MM/yyyy", { locale: es })} - ${days} días`;
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
          ref={startRef}
          selected={editValue.start ? new Date(editValue.start) : null}
          onChange={(date) => setEditValue({ ...editValue, start: date })}
          dateFormat="dd/MM/yyyy"
          locale={es}
          placeholderText="Fecha de inicio"
          isClearable
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          popperClassName="z-50"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Fin</label>
        <DatePicker
          ref={endRef}
          selected={editValue.end ? new Date(editValue.end) : null}
          onChange={(date) => setEditValue({ ...editValue, end: date })}
          dateFormat="dd/MM/yyyy"
          locale={es}
          placeholderText="Fecha de fin"
          minDate={editValue.start ? new Date(editValue.start) : null}
          isClearable
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          popperClassName="z-50"
        />
      </div>
    </div>
  );
};

export default TimelineCell;
