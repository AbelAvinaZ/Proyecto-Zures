import { useRef, useState, useEffect } from "react";

const LocationCell = ({ value, isEditing, onSave, onCancel }) => {
  const inputRef = useRef(null);

  const [editValue, setEditValue] = useState(value ?? "");
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset solo al entrar en edición
  if (isEditing && !prevEditing) {
    setEditValue(value ?? "");
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue.trim() || null);
    } else if (e.key === "Escape") {
      onCancel();
      setEditValue(value ?? "");
    }
  };

  if (!isEditing) {
    if (!value || value.trim() === "") {
      return <span className="text-gray-400">-</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-blue-600">📍</span>
        <span>{value}</span>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Escribe la dirección o ubicación..."
    />
  );
};

export default LocationCell;
