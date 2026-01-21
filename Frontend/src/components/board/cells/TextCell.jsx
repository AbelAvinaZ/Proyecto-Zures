import { useRef, useState, useEffect } from "react";

const TextCell = ({ value, isEditing, onSave, onCancel }) => {
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      onCancel();
      setEditValue(value ?? "");
    }
  };

  if (!isEditing) {
    return (
      <div className="w-full h-full flex items-center px-1">
        {value != null && value !== "" ? (
          value
        ) : (
          <span className="text-gray-400">-</span>
        )}
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
      onBlur={() => onSave(editValue)}
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Escribe aquí..."
    />
  );
};

export default TextCell;
