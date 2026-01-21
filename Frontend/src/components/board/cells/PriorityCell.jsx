import { useRef, useState, useEffect } from "react";
import Select from "react-select";

const DEFAULT_PRIORITY_OPTIONS = [
  { value: "Baja", label: "Baja", color: "#10b981" },
  { value: "Media", label: "Media", color: "#f59e0b" },
  { value: "Alta", label: "Alta", color: "#f97316" },
  { value: "Urgente", label: "Urgente", color: "#ef4444" },
];

const PriorityCell = ({ value, isEditing, onSave, onCancel }) => {
  const selectRef = useRef(null);

  const [editValue, setEditValue] = useState(value ?? null);
  const [prevEditing, setPrevEditing] = useState(isEditing);

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
    if (e.key === "Escape") {
      onCancel();
      setEditValue(value ?? null);
    }
  };

  if (!isEditing) {
    if (!value) {
      return <span className="text-gray-400">-</span>;
    }

    const opt = DEFAULT_PRIORITY_OPTIONS.find((o) => o.value === value);
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
        DEFAULT_PRIORITY_OPTIONS.find((opt) => opt.value === editValue) || null
      }
      onChange={(opt) => {
        const newValue = opt ? opt.value : null;
        setEditValue(newValue);
        onSave(newValue);
      }}
      options={DEFAULT_PRIORITY_OPTIONS}
      formatOptionLabel={(opt) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: opt.color }}
          />
          <span>{opt.label}</span>
        </div>
      )}
      placeholder="Selecciona prioridad..."
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

export default PriorityCell;
