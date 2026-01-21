import { useState } from "react";
import { openUploadWidget } from "../../../utils/cloudinaryWidget";

const FilesCell = ({
  value,
  isEditing,
  onSave,

  board,
  rowIndex,
}) => {
  const [editValue, setEditValue] = useState(Array.isArray(value) ? value : []);
  const [prevEditing, setPrevEditing] = useState(isEditing);

  if (isEditing && !prevEditing) {
    setEditValue(Array.isArray(value) ? value : []);
    setPrevEditing(true);
  }

  if (!isEditing && prevEditing) {
    setPrevEditing(false);
  }

  const handleUploadFiles = () => {
    const workspaceName = board.workspaceId?.name || "unnamed-workspace";
    const boardName = board.name || "unnamed-board";
    const folder = `zures/workspaces/${workspaceName}/boards/${boardName}/fila-${rowIndex}`;

    openUploadWidget(
      {
        cloudName: "dyiip3vvj",
        uploadPreset: "zures_unsigned",
        folder: folder,
        maxFiles: 10,
        sources: ["local", "url", "camera"],
        resourceType: "auto",
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const newFiles = result.info.map((file) => ({
            public_id: file.public_id,
            url: file.secure_url,
            original_filename: file.original_filename,
            resource_type: file.resource_type,
          }));

          const currentFiles = [...editValue];
          const updatedFiles = [...currentFiles, ...newFiles].slice(0, 10);
          setEditValue(updatedFiles);
          onSave(updatedFiles);
        }
      },
    );
  };

  if (!isEditing) {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {value.map((file, i) => {
          const isImage =
            file.resource_type === "image" ||
            /\.(jpg|png|gif|webp)$/i.test(file.original_filename);

          return (
            <a
              key={i}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative"
            >
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.original_filename}
                  className="w-16 h-16 object-cover rounded border group-hover:opacity-80"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-gray-600 group-hover:bg-gray-200">
                  <span className="text-xs text-center p-1 wrap-break-words">
                    {file.original_filename.slice(0, 15)}...
                  </span>
                </div>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleUploadFiles}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Subir archivos (máx 10)
      </button>

      {editValue.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {editValue.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm"
            >
              <span className="truncate max-w-40">
                {file.original_filename}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newFiles = editValue.filter((_, idx) => idx !== i);
                  setEditValue(newFiles);
                  onSave(newFiles);
                }}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesCell;
