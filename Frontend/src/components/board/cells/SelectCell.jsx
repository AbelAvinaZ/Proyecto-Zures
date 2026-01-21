import { useRef, useState, useEffect } from "react";
import Select from "react-select";

const SelectCell = ({ value, isEditing, onSave, onCancel, column }) => {
  const selectRef = useRef(null);

  const options = (column.config?.options || []).map((opt) => ({
    value: opt,
    label: opt,
  }));

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

    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : value;
  }

  return (
    <Select
      ref={selectRef}
      value={options.find((opt) => opt.value === editValue) || null}
      onChange={(opt) => {
        const newValue = opt ? opt.value : null;
        setEditValue(newValue);
        onSave(newValue);
      }}
      options={options}
      placeholder="Selecciona una opción..."
      isClearable
      isSearchable
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

export default SelectCell;
