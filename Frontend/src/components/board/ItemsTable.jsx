import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const ItemsTable = ({ board, onUpdateCell }) => {
  // Columnas dinámicas basadas en board.columns
  const columns = useMemo(
    () =>
      board.columns.map((col) => ({
        id: col.order.toString(),
        header: col.name,
        cell: ({ row, getValue }) => {
          const itemIndex = row.index;
          const columnIndex = board.columns.findIndex(
            (c) => c.name === col.name
          );
          const value = getValue();

          return (
            <input
              type="text" // Cambia según tipo (checkbox, date, etc.)
              value={value ?? ""}
              onChange={(e) =>
                onUpdateCell(itemIndex, columnIndex, e.target.value)
              }
              className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        },
      })),
    [board.columns, onUpdateCell]
  );

  const data = useMemo(() => board.items || [], [board.items]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Opcional: column sizing automático
    defaultColumn: {
      minSize: 150, // Ancho mínimo
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
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
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
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
