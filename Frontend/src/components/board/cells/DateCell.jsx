import { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DateCell = ({ value, isEditing, onSave, onCancel }) => {
  const pickerRef = useRef(null);

  const [editValue, setEditValue] = useState(value ? new Date(value) : null);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset solo al entrar en modo edición (durante render)
  if (isEditing && !prevEditing) {
    setEditValue(value ? new Date(value) : null);
    setPrevEditing(true);
  }

  // Actualizamos bandera al salir de edición
  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && pickerRef.current) {
      // Focus en el input del DatePicker
      const input = pickerRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSave(editValue ? editValue.toISOString() : null);
    } else if (e.key === "Escape") {
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
      ref={pickerRef}
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
    />
  );
};

export default DateCell;
