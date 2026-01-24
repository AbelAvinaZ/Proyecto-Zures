import { useRef, useState, useEffect, useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { ChromePicker } from "react-color";
import useBoardTags from "../../../hooks/useBoardTags";

// Normaliza lo que venga (por si hay data vieja)
const normalizeToSelect = (tag) => {
  if (!tag) return null;

  // ya viene como option
  if (typeof tag === "object" && "value" in tag && "label" in tag) {
    return {
      value: tag.value ?? tag.label,
      label: tag.label ?? String(tag.value ?? ""),
      color: tag.color ?? tag.value?.color ?? "#6b7280",
    };
  }

  // {name,color}
  if (typeof tag === "object" && ("name" in tag || "color" in tag)) {
    const name = tag.name ?? "";
    return { value: name, label: name, color: tag.color ?? "#6b7280" };
  }

  // string
  if (typeof tag === "string") {
    return { value: tag, label: tag, color: "#6b7280" };
  }

  return null;
};

// Convierte a formato que guardas en DB (recomendado: {name,color})
const toDbTags = (selectOptions) => {
  const arr = Array.isArray(selectOptions) ? selectOptions : [];
  return arr
    .map((opt) => ({
      name: opt?.label ?? opt?.value ?? "",
      color: opt?.color ?? "#6b7280",
    }))
    .filter((t) => t.name.trim() !== "");
};

const TagsCell = ({
  value,
  isEditing,
  onSave,
  onCancel,
  boardId,
  columnId,
}) => {
  const containerRef = useRef(null);

  // OJO: si ya migraste a columnId, pásalo al hook también (ver punto 2)
  const keyForTagsHook = columnId;

  const { data: existingTags = [] } = useBoardTags(boardId, keyForTagsHook);

  const options = useMemo(() => {
    return (existingTags || []).map(normalizeToSelect).filter(Boolean);
  }, [existingTags]);

  const [editValue, setEditValue] = useState(() => {
    const arr = Array.isArray(value) ? value : [];
    return arr.map(normalizeToSelect).filter(Boolean);
  });

  const [newTagColor, setNewTagColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  if (isEditing && !prevEditing) {
    const arr = Array.isArray(value) ? value : [];
    setEditValue(arr.map(normalizeToSelect).filter(Boolean));
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  useEffect(() => {
    if (isEditing && containerRef.current) {
      const input = containerRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel?.();
      const arr = Array.isArray(value) ? value : [];
      setEditValue(arr.map(normalizeToSelect).filter(Boolean));
      setShowColorPicker(false);
    }
  };

  if (!isEditing) {
    const arr = Array.isArray(value) ? value : [];
    const tags = arr.map(normalizeToSelect).filter(Boolean);

    if (tags.length === 0) return <span className="text-gray-400">-</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <span
            key={`${tag.value}-${i}`}
            className="px-2 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: tag.color || "#6b7280" }}
          >
            {tag.label}
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
        options={options}
        onChange={(tags) => {
          const next = tags || [];
          setEditValue(next);

          onSave?.(toDbTags(next));
        }}
        formatOptionLabel={(option) => {
          const color = option?.color ?? option?.value?.color ?? "#6b7280";
          const label = option?.label ?? "";
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          );
        }}
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
          const created = {
            value: inputValue,
            label: inputValue,
            color: newTagColor,
          };

          const next = [...editValue, created];
          setEditValue(next);

          onSave?.(toDbTags(next));
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
          onClick={() => setShowColorPicker((s) => !s)}
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
