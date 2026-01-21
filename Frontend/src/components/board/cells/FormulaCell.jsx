import * as math from "mathjs";

const FormulaCell = ({ isEditing, column, board, rowIndex }) => {
  const calculateFormula = () => {
    if (!column?.config?.formula || !board) return "-";

    try {
      let expression = column.config.formula;

      board.columns.forEach((col, idx) => {
        const cellValue = board.items[rowIndex]?.values?.get(idx.toString());
        let replacement = cellValue ?? 0;

        if (col.type === "DATE" && cellValue) {
          replacement = new Date(cellValue).getTime();
        }

        const escapedName = col.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expression = expression.replace(
          new RegExp(`\\[${escapedName}\\]`, "g"),
          replacement,
        );
      });

      const result = math.evaluate(expression);

      if (typeof result === "number") {
        return result.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return result;
    } catch (err) {
      console.error("Error en fórmula:", err);
      return "Error";
    }
  };

  const calculatedValue = calculateFormula();

  if (!isEditing) {
    return <span className="font-medium">{calculatedValue}</span>;
  }

  return (
    <div className="text-gray-600 italic w-full p-2 bg-gray-50 rounded border border-gray-300">
      {calculatedValue}
      <div className="text-xs text-gray-500 mt-1">
        Fórmula calculada automáticamente (no editable)
      </div>
    </div>
  );
};

export default FormulaCell;
