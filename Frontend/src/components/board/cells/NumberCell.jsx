import { useRef, useState, useEffect } from "react";

const NumberCell = ({ value, isEditing, onSave, onCancel }) => {
  const inputRef = useRef(null);

  const [editValue, setEditValue] = useState(value ?? "");
  const [prevEditing, setPrevEditing] = useState(isEditing);

  if (isEditing && !prevEditing) {
    setEditValue(value ?? "");
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  // Focus automático al entrar en edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const numValue = editValue.trim() === "" ? null : Number(editValue);
      onSave(numValue);
    } else if (e.key === "Escape") {
      onCancel();
      setEditValue(value ?? "");
    }
  };

  if (!isEditing) {
    // Modo lectura: mostramos con formato numérico mexicano
    if (value == null || isNaN(value)) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="w-full h-full flex items-center justify-end px-1">
        {Number(value).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    );
  }

  // Modo edición
  return (
    <input
      ref={inputRef}
      type="number"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        const numValue = editValue.trim() === "" ? null : Number(editValue);
        onSave(numValue);
      }}
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
      step="any"
      placeholder="0.00"
    />
  );
};

export default NumberCell;
