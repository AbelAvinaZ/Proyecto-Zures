import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import workspaceActionsHooks from "../hooks/useWorkspaceActions";
import CreateBoardModal from "../components/common/CreateBoardModal";

const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { useWorkspace } = workspaceActionsHooks;
  const { data: workspace, isLoading, error } = useWorkspace(workspaceId);

  if (isLoading) return <div>Cargando workspace...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreateBoard = () => {
    // Aquí puedes abrir el modal de board
    setIsCreateModalOpen(true);
  };

  const onBoardCreated = (newBoard) => {
    // Refetch o redirigir
    navigate(`/boards/${newBoard._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{workspace.name}</h1>
        <p className="text-gray-600 mb-6">
          {workspace.description || "Sin descripción"}
        </p>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Boards</h2>
          <button
            onClick={handleCreateBoard}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Crear Board
          </button>
        </div>

        {/* Lista de boards */}
        {workspace.boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No hay boards aún</p>
            <p className="mt-2 text-gray-500">Crea uno para empezar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workspace.boards.map((board) => (
              <div
                key={board._id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-medium">{board.name}</h3>
                <p className="text-gray-600 mt-2">
                  {board.description || "Sin descripción"}
                </p>
                <button
                  onClick={() => navigate(`/boards/${board._id}`)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Abrir board →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={onBoardCreated}
      />
    </div>
  );
};

export default WorkspaceDetailPage;
