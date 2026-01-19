// src/pages/BoardDetailPage.js
import { useState } from "react";
import { useParams } from "react-router-dom";
import boardHooks from "../hooks/useBoard";
import BoardHeader from "../components/board/BoardHeader";
import ItemsTable from "../components/board/ItemsTable";
import AddColumnModal from "../components/board/AddColumnModal";
import { toast } from "react-toastify";

const BoardDetailPage = () => {
  const { boardId } = useParams();
  const { useBoard, useAddColumn, useCreateItem, useUpdateItemCell } =
    boardHooks;

  const { data: board, isLoading, error } = useBoard(boardId);
  const addColumnMutation = useAddColumn(boardId);
  const createItemMutation = useCreateItem(boardId);
  const updateCellMutation = useUpdateItemCell(boardId);

  const [showAddColumn, setShowAddColumn] = useState(false);

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

  const handleCreateItem = () => {
    createItemMutation.mutate(
      {},
      {
        onSuccess: () => toast.success("Item creado"),
      },
    );
  };

  const handleUpdateCell = (itemIndex, columnIndex, value) => {
    updateCellMutation.mutate({ itemIndex, columnIndex, value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <BoardHeader
        board={board}
        onAddColumn={() => setShowAddColumn(true)}
        onAddItem={handleCreateItem}
      />

      <ItemsTable board={board} onUpdateCell={handleUpdateCell} />

      {showAddColumn && (
        <AddColumnModal
          isOpen={showAddColumn}
          onClose={() => setShowAddColumn(false)}
          onSubmit={handleAddColumn}
        />
      )}
    </div>
  );
};

export default BoardDetailPage;
