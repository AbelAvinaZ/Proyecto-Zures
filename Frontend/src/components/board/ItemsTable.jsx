import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import DynamicCell from "./DynamicCell";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ItemsTable = ({ board, onUpdateCell }) => {
  const [editingCell, setEditingCell] = useState(null);

  const dynamicColumns = useMemo(
    () =>
      board.columns.map((col) => ({
        id: col.order.toString(),
        header: col.name,
        cell: ({ row, getValue }) => {
          const itemIndex = row.index;
          const columnIndex = board.columns.findIndex(
            (c) => c.name === col.name,
          );
          const value = getValue();

          const isThisCellEditing =
            editingCell?.rowIndex === itemIndex &&
            editingCell?.colIndex === columnIndex;

          return (
            <DynamicCell
              value={value}
              column={col}
              isEditing={isThisCellEditing}
              setIsEditing={(val) => {
                if (val) {
                  setEditingCell({
                    rowIndex: itemIndex,
                    colIndex: columnIndex,
                  });
                } else {
                  setEditingCell(null);
                }
              }}
              onSave={(newValue) => {
                if (newValue !== value) {
                  onUpdateCell(itemIndex, columnIndex, newValue);
                }
                setEditingCell(null);
              }}
              onCancel={() => setEditingCell(null)}
              boardId={board._id}
              columnIndex={columnIndex}
              rowIndex={itemIndex}
              board={board}
            />
          );
        },
      })),
    [board.columns, onUpdateCell, editingCell],
  );

  // Columna fija "Actualizado por" - siempre al final
  const fixedColumn = useMemo(
    () => ({
      id: "updatedBy",
      header: "Actualizado por",
      cell: ({ row }) => {
        const item = board.items[row.index];
        const updatedByUser = item?.updatedBy; // ya populado como objeto { name, avatar, etc. }

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
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(updatedByUser.name)
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
      size: 220, // ancho fijo para que no se achique
      enableSorting: false,
      enableResizing: false,
    }),
    [board.items],
  );

  const columns = useMemo(
    () => [...dynamicColumns, fixedColumn],
    [dynamicColumns, fixedColumn],
  );

  const data = useMemo(() => board.items || [], [board.items]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 150,
    },
  });

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
