import { useRef, useState, useEffect } from "react";
import Select from "react-select";

const DEFAULT_STATUS_OPTIONS = [
  { value: "Pendiente", label: "Pendiente", color: "#f59e0b" },
  { value: "En progreso", label: "En progreso", color: "#3b82f6" },
  { value: "Revisión", label: "Revisión", color: "#8b5cf6" },
  { value: "Completado", label: "Completado", color: "#10b981" },
  { value: "Bloqueado", label: "Bloqueado", color: "#ef4444" },
];

const StatusCell = ({ value, isEditing, onSave, onCancel }) => {
  const selectRef = useRef(null);

  const [editValue, setEditValue] = useState(value ?? null);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  // Reset solo al entrar en edición
  if (isEditing && !prevEditing) {
    setEditValue(value ?? null);
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      onCancel();
      setEditValue(value ?? null);
    }
  };

  if (!isEditing) {
    if (!value) {
      return <span className="text-gray-400">-</span>;
    }

    const opt = DEFAULT_STATUS_OPTIONS.find((o) => o.value === value);
    if (!opt) return value;

    return (
      <div className="inline-flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: opt.color }}
        />
        <span>{opt.label}</span>
      </div>
    );
  }

  return (
    <Select
      ref={selectRef}
      value={
        DEFAULT_STATUS_OPTIONS.find((opt) => opt.value === editValue) || null
      }
      onChange={(opt) => {
        const newValue = opt ? opt.value : null;
        setEditValue(newValue);
        onSave(newValue);
      }}
      options={DEFAULT_STATUS_OPTIONS}
      formatOptionLabel={(opt) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: opt.color }}
          />
          <span>{opt.label}</span>
        </div>
      )}
      placeholder="Selecciona estado..."
      isClearable
      className="w-full"
      classNamePrefix="react-select"
      onKeyDown={handleKeyDown}
      menuPortalTarget={document.body}
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#3b82f6",
          borderWidth: "1px",
          boxShadow: "none",
          "&:hover": { borderColor: "#3b82f6" },
        }),
      }}
    />
  );
};

export default StatusCell;
