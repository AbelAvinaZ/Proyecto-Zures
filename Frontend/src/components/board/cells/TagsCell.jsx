import { useRef, useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { ChromePicker } from "react-color";
import useBoardTags from "../../../hooks/useBoardTags";

const TagsCell = ({ value, isEditing, onCancel, boardId, columnIndex }) => {
  const containerRef = useRef(null);

  const { data: existingTags = [] } = useBoardTags(boardId, columnIndex);

  const [editValue, setEditValue] = useState(value || []);
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  if (isEditing && !prevEditing) {
    setEditValue(value || []);
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && containerRef.current) {
      // Focus en el input del CreatableSelect
      const input = containerRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel();
      setEditValue(value || []);
      setShowColorPicker(false);
    }
  };

  if (!isEditing) {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {value.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: tag.color || "#6b7280" }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <CreatableSelect
        isMulti
        value={editValue}
        onChange={(tags) => setEditValue(tags || [])}
        options={existingTags.map((tag) => ({
          value: tag,
          label: tag.name,
        }))}
        formatOptionLabel={(option) => (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: option.value.color }}
            />
            <span>{option.label}</span>
          </div>
        )}
        formatCreateLabel={(inputValue) => (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: newTagColor }}
            />
            <span>Crear "{inputValue}"</span>
          </div>
        )}
        onCreateOption={(inputValue) => {
          const newTag = { name: inputValue, color: newTagColor };
          setEditValue([...editValue, newTag]);
        }}
        placeholder="Agrega o busca tags..."
        noOptionsMessage={() => "Escribe para crear nuevo tag"}
        className="w-full"
        classNamePrefix="react-select"
        menuPortalTarget={document.body}
      />

      <div className="mt-2 text-sm">
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          Color para nuevo tag:
          <div
            className="w-5 h-5 rounded border"
            style={{ backgroundColor: newTagColor }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute z-50 mt-2">
            <ChromePicker
              color={newTagColor}
              onChangeComplete={(color) => setNewTagColor(color.hex)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsCell;
