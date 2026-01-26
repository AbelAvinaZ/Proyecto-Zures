import { useRef, useState, useEffect } from "react";
import Select from "react-select";
import useUsersForSelect from "../../../hooks/useUsersForSelect.js";

const UserCell = ({ value, isEditing, onSave, onCancel }) => {
  const selectRef = useRef(null);
  const { data: usersOptions = [] } = useUsersForSelect();

  const [editValue, setEditValue] = useState(value || []);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  if (isEditing && !prevEditing) {
    setEditValue(value || []);
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
      setEditValue(value || []);
    }
  };

  if (!isEditing) {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex flex-wrap justify-center gap-1 max-w-full">
        {value.map((userId) => {
          const user = usersOptions.find((u) => u.value === userId);
          if (!user) return <span key={userId}>{userId}</span>;

          return (
            <div
              key={userId}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm max-w-full"
            >
              <img
                src={user.avatar}
                alt={user.label}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="wrap-break-word text-center">{user.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Select
      ref={selectRef}
      value={usersOptions.filter((opt) => editValue.includes(opt.value))}
      onChange={(opts) => {
        const newValues = opts ? opts.map((o) => o.value) : [];
        setEditValue(newValues);
        onSave(newValues);
      }}
      options={usersOptions}
      isMulti
      isSearchable
      placeholder="Asigna usuarios..."
      formatOptionLabel={(opt) => (
        <div className="flex items-center gap-2">
          <img
            src={opt.avatar}
            alt={opt.label}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div>
            <div>{opt.label}</div>
            <div className="text-xs text-gray-500">{opt.email}</div>
          </div>
        </div>
      )}
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
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#e5e7eb",
        }),
      }}
    />
  );
};

export default UserCell;
