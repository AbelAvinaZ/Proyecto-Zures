import { useState } from "react";
import { useParams } from "react-router-dom";
import boardHooks from "../hooks/useBoard";
import BoardHeader from "../components/board/BoardHeader";
import ItemsTable from "../components/board/ItemsTable";
import AddColumnModal from "../components/board/AddColumnModal";
import { toast } from "react-toastify";
import AddItemModal from "../components/board/AddItemModal";

const BoardDetailPage = () => {
  const { boardId } = useParams();
  const { useBoard, useAddColumn, useCreateItem, useUpdateItemCell } =
    boardHooks;

  const { data: board, isLoading, error, refetch } = useBoard(boardId);
  const addColumnMutation = useAddColumn(boardId);
  const createItemMutation = useCreateItem(boardId);
  const updateCellMutation = useUpdateItemCell(boardId);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  if (isLoading)
    return <div className="text-center p-8">Cargando board...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-red-500">Error: {error.message}</div>
    );

  const handleAddColumn = (columnData) => {
    addColumnMutation.mutate(columnData, {
      onSuccess: () => {
        toast.success("Columna agregada");
        setShowAddColumn(false);
      },
    });
  };

  const handleUpdateCell = (itemIndex, columnIndex, value) => {
    updateCellMutation.mutate({ itemIndex, columnIndex, value });
  };

  const handleAddItem = (values) => {
    createItemMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Item agregado correctamente");
        refetch();
        setShowAddItem(false);
      },
      onError: (err) => {
        console.error(err);
        toast.error("Error al agregar item");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <BoardHeader
        board={board}
        onAddColumn={() => setShowAddColumn(true)}
        onAddItem={() => setShowAddItem(true)}
      />

      <ItemsTable board={board} onUpdateCell={handleUpdateCell} />

      {showAddColumn && (
        <AddColumnModal
          isOpen={showAddColumn}
          onClose={() => setShowAddColumn(false)}
          onSubmit={handleAddColumn}
        />
      )}

      {showAddItem && (
        <AddItemModal
          isOpen={showAddItem}
          onClose={() => setShowAddItem(false)}
          board={board}
          onSuccess={handleAddItem}
        />
      )}
    </div>
  );
};

export default BoardDetailPage;
