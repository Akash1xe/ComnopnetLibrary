import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

export function DataTable<T>({
  columns,
  data,
  selectable = false,
  onRowClick,
}: {
  columns: Array<{ key: keyof T | string; header: string; render?: (row: T) => React.ReactNode }>;
  data: T[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [descending, setDescending] = useState(false);

  const rows = [...data].sort((a, b) => {
    if (!sortKey) {
      return 0;
    }

    const left = String((a as Record<string, unknown>)[sortKey] ?? "");
    const right = String((b as Record<string, unknown>)[sortKey] ?? "");
    return descending ? right.localeCompare(left) : left.localeCompare(right);
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f]">
      <table className="min-w-full divide-y divide-[#1e1e1e] text-left text-sm">
        <thead className="bg-[#111]">
          <tr>
            {selectable ? <th className="px-4 py-3 text-[#777]">#</th> : null}
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 text-[#777]">
                <button
                  className="inline-flex items-center gap-2"
                  onClick={() => {
                    const nextKey = String(column.key);
                    if (sortKey === nextKey) {
                      setDescending((value) => !value);
                    } else {
                      setSortKey(nextKey);
                      setDescending(false);
                    }
                  }}
                  type="button"
                >
                  {column.header}
                  <ArrowDownUp className="h-4 w-4" />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {rows.map((row, index) => (
            <tr key={index} className="cursor-pointer hover:bg-[#141414]" onClick={() => onRowClick?.(row)}>
              {selectable ? <td className="px-4 py-4 text-[#666]">{index + 1}</td> : null}
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-4 text-[#ddd]">
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
