import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import DynamicCell from "./DynamicCell";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import boardHooks from "../../hooks/useBoardActions";
import ConfirmModal from "../common/ConfirmModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableHeader from "./SortableHeader";
import SortableRow from "./SortableRow";

const ItemsTable = ({ board, onUpdateCell }) => {
  const { useDeleteItem, useRemoveColumn, useReorderColumns, useReorderItems } =
    boardHooks;

  const deleteItemMutation = useDeleteItem(board._id);
  const removeColumnMutation = useRemoveColumn(board._id);
  const reorderColumnsMutation = useReorderColumns(board._id);
  const reorderItemsMutation = useReorderItems(board._id);


  const [editingCell, setEditingCell] = useState(null);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState(null);
  const [confirmDeleteColumnId, setConfirmDeleteColumnId] = useState(null);

  const [columnOrder, setColumnOrder] = useState(
    (board.columns || []).map((c) => c._id.toString()),
  );
  const [rowOrder, setRowOrder] = useState(
    (board.items || []).map((i) => i._id.toString()),
  );

  useEffect(() => {
    setColumnOrder((board.columns || []).map((c) => c._id.toString()));
  }, [board.columns]);

  useEffect(() => {
    setRowOrder((board.items || []).map((i) => i._id.toString()));
  }, [board.items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleColumnDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        reorderColumnsMutation.mutate(newOrder);
        return newOrder;
      });
    }
  };

  const handleRowDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setRowOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        reorderItemsMutation.mutate(newOrder);
        return newOrder;
      });
    }
  };

  const handleDeleteRow = (itemId) => {
    setConfirmDeleteRowId(itemId);
  };

  const executeDeleteRow = () => {
    if (!confirmDeleteRowId) return;
    deleteItemMutation.mutate(confirmDeleteRowId);
    setConfirmDeleteRowId(null);
  };

  const handleDeleteColumn = (columnId) => {
    setConfirmDeleteColumnId(columnId);
  };

  const executeDeleteColumn = () => {
    if (!confirmDeleteColumnId) return;
    removeColumnMutation.mutate(confirmDeleteColumnId);
    setConfirmDeleteColumnId(null);
  };

  // Columnas dinámicas, ordenadas por columnOrder.
  const dynamicColumns = useMemo(() => {
    const columnMap = new Map(
      (board.columns || []).map((c) => [c._id.toString(), c]),
    );

    const orderedColumns = (columnOrder || [])
      .map((id) => columnMap.get(id))
      .filter(Boolean);

    return orderedColumns.map((col) => {
      const colId = col._id.toString();

      return {
        id: colId,

        // ✅ Tanstack: sin accessorFn getValue() es undefined
        accessorFn: (row) => {
          const values = row?.values;
          if (!values) return null;

          if (values instanceof Map) return values.get(colId) ?? null;
          return values[colId] ?? null;
        },

        header: () => (
          <SortableHeader
            id={colId}
            title={col.name}
            // ✅ pasa columnId, NO index
            onDelete={() => handleDeleteColumn(colId)}
          />
        ),

        cell: ({ row, getValue }) => {
          const itemIndex = row.index;
          const value = getValue();

          const isThisCellEditing =
            editingCell?.rowIndex === itemIndex && editingCell?.colId === colId;

          return (
            <DynamicCell
              value={value}
              column={col}
              isEditing={isThisCellEditing}
              setIsEditing={(val) => {
                if (val) setEditingCell({ rowIndex: itemIndex, colId });
                else setEditingCell(null);
              }}
              onSave={(newValue) => {
                if (newValue !== value) {
                  onUpdateCell(itemIndex, colId, newValue);
                }
                setEditingCell(null);
              }}
              onCancel={() => setEditingCell(null)}
              boardId={board._id}
              columnId={colId}
              rowIndex={itemIndex}
              board={board}
            />
          );
        },
      };
    });
  }, [board.columns, board._id, columnOrder, editingCell, onUpdateCell]);

  // Columna fija "Actualizado por" (no editable)
  const fixedColumn = useMemo(
    () => ({
      id: "updatedBy",
      header: "Actualizado por",
      cell: ({ row }) => {
        const item = board.items[row.index];
        const updatedByUser = item?.updatedBy;

        if (!updatedByUser || !item.updatedAt) {
          return <span className="text-gray-400">-</span>;
        }

        const date = format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm", {
          locale: es,
        });

        return (
          <div className="flex items-center gap-2">
            <img
              src={
                updatedByUser.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedByUser.name)}`
              }
              alt={updatedByUser.name}
              className="w-8 h-8 rounded-full object-cover border"
            />
            <div className="flex flex-col">
              <span className="font-medium">{updatedByUser.name}</span>
              <span className="text-xs text-gray-500">{date}</span>
            </div>
          </div>
        );
      },
      size: 220,
      enableSorting: false,
      enableResizing: false,
    }),
    [board.items],
  );

  const columns = useMemo(
    () => [...dynamicColumns, fixedColumn],
    [dynamicColumns, fixedColumn],
  );

  // Ordenar filas por rowOrder
  const sortedData = useMemo(() => {
    const orderMap = new Map((rowOrder || []).map((id, idx) => [id, idx]));
    return [...(board.items || [])].sort(
      (a, b) =>
        (orderMap.get(a._id.toString()) ?? Infinity) -
        (orderMap.get(b._id.toString()) ?? Infinity),
    );
  }, [board.items, rowOrder]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: { minSize: 150 },
  });

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleColumnDragEnd}
      >
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {/* Columna de acciones (grip + delete row) */}
                    <th className="w-16 px-4 py-3" />

                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-middle"
                        style={{
                          width: header.column.columnDef.size
                            ? `${header.column.columnDef.size}px`
                            : "auto",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleRowDragEnd}
              >
                <SortableContext
                  items={rowOrder}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        id={row.original._id.toString()}
                        onDeleteRow={() =>
                          handleDeleteRow(row.original._id.toString())
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-4 whitespace-nowrap align-middle"
                            style={{
                              width: cell.column.columnDef.size
                                ? `${cell.column.columnDef.size}px`
                                : "auto",
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </SortableRow>
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </SortableContext>
      </DndContext>

      {/* Modales */}
      <ConfirmModal
        isOpen={confirmDeleteRowId !== null}
        onClose={() => setConfirmDeleteRowId(null)}
        onConfirm={executeDeleteRow}
        title="Eliminar fila"
        message="¿Estás seguro de que deseas eliminar esta fila? Se perderán todos los datos de esta fila. Esta acción no se puede deshacer."
        confirmText="Eliminar fila"
        danger={true}
      />

      <ConfirmModal
        isOpen={confirmDeleteColumnId !== null}
        onClose={() => setConfirmDeleteColumnId(null)}
        onConfirm={executeDeleteColumn}
        title="Eliminar columna"
        message="¿Estás seguro de que deseas eliminar esta columna? Se perderán todos los datos que contiene en todas las filas. Esta acción no se puede deshacer."
        confirmText="Eliminar columna"
        danger={true}
      />
    </>
  );
};

export default ItemsTable;
