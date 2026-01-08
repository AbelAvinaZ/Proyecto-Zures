const BoardHeader = ({ board, onAddColumn, onAddItem }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          <p className="text-gray-600 mt-2">
            {board.description || "Sin descripción"}
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={onAddColumn}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nueva Columna
          </button>
          <button
            onClick={onAddItem}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Nuevo Item
          </button>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Creado por: {board.createdBy?.name} • Privado:{" "}
        {board.isPrivate ? "Sí" : "No"}
      </div>
    </div>
  );
};

export default BoardHeader;
