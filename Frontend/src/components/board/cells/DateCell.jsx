import { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DateCell = ({ value, isEditing, onSave, onCancel }) => {
  const inputRef = useRef(null);

  const [editValue, setEditValue] = useState(value ? new Date(value) : null);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset al entrar en modo edición
  if (isEditing && !prevEditing) {
    setEditValue(value ? new Date(value) : null);
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue ? editValue.toISOString() : null);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      setEditValue(value ? new Date(value) : null);
    }
  };

  if (!isEditing) {
    if (!value) {
      return <span className="text-gray-400">-</span>;
    }
    try {
      return format(new Date(value), "dd/MM/yyyy", { locale: es });
    } catch {
      return <span className="text-red-500">Fecha inválida</span>;
    }
  }

  return (
    <DatePicker
      selected={editValue}
      onChange={(date) => setEditValue(date)}
      dateFormat="dd/MM/yyyy"
      locale={es}
      placeholderText="Selecciona fecha"
      isClearable
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      popperClassName="z-50"
      onKeyDown={handleKeyDown}
      onCalendarClose={() => onSave(editValue ? editValue.toISOString() : null)}
      customInputRef="input"
      inputRef={inputRef}
    />
  );
};

export default DateCell;
