import { useRef, useState, useEffect } from "react";

const CheckboxCell = ({ value, isEditing, onSave, onCancel }) => {
  const inputRef = useRef(null);

  const [editValue, setEditValue] = useState(!!value);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset al entrar en edición
  if (isEditing && !prevEditing) {
    setEditValue(!!value);
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
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const newVal = !editValue;
      setEditValue(newVal);
      onSave(newVal);
    } else if (e.key === "Escape") {
      onCancel();
      setEditValue(!!value);
    }
  };

  if (!isEditing) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {value ? (
          <span className="text-green-600 text-2xl font-bold">✓</span>
        ) : (
          <span className="text-red-500 text-2xl font-bold">✗</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <input
        ref={inputRef}
        type="checkbox"
        checked={editValue}
        onChange={(e) => {
          const newVal = e.target.checked;
          setEditValue(newVal);
          onSave(newVal);
        }}
        onKeyDown={handleKeyDown}
        className="h-6 w-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
    </div>
  );
};

export default CheckboxCell;
