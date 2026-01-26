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

  if (!isEditing) {
    return (
      <div className="w-full max-w-full">
        {value != null && value !== "" ? (
          <div className="w-full h-full mx-5 py-2 text-md whitespace-pre-wrap wrap-break-word text-left leading-relaxed">
            {value || <span className="text-gray-400 italic">-</span>}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onCancel();
          setEditValue(value ?? "");
        }

        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onSave(editValue);
        }
      }}
      onBlur={() => onSave(editValue)}
      rows={5}
      className="w-full min-h-40 resize-y py-3 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Escribe aquí... (Ctrl+Enter para guardar)"
    />
  );
};

export default TextCell;
