import { useParams, useNavigate } from "react-router-dom";
import useBoard from "../hooks/useBoard";
import BoardHeader from "../components/board/BoardHeader";
import ItemsTable from "../components/board/ItemsTable";
import { toast } from "react-toastify";
import api from "../utils/api";

const BoardDetailPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { data: board, isLoading, error, refetch } = useBoard(boardId);

  if (isLoading)
    return <div className="text-center p-8 text-lg">Cargando board...</div>;
  if (error) {
    toast.error("Board no encontrado o sin permiso");
    navigate("/dashboard"); // O al workspace padre
    return null;
  }
  if (!board)
    return <div className="text-center p-8">Este board no existe</div>;

  const handleUpdateCell = async (itemIndex, columnIndex, value) => {
    try {
      await api.patch(
        `/boards/${boardId}/items/${itemIndex}/columns/${columnIndex}`,
        { value }
      );
      refetch();
      toast.success("Celda actualizada");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <BoardHeader
        board={board}
        onAddColumn={() =>
          toast.info("Funcionalidad de agregar columna en desarrollo")
        }
        onAddItem={() =>
          toast.info("Funcionalidad de agregar item en desarrollo")
        }
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        <ItemsTable board={board} onUpdateCell={handleUpdateCell} />
      </div>

      {/* Botón para volver al workspace */}
      <button
        onClick={() => navigate(`/workspaces/${board.workspaceId}`)}
        className="mt-8 px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        ← Volver al workspace
      </button>
    </div>
  );
};

export default BoardDetailPage;
