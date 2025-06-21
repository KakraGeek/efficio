import React from 'react';

// Define the type for a column
export interface Column<T> {
  // The key in the data object to display in this column
  accessor: keyof T | string;
  // The column header label
  header: React.ReactNode;
  // Optional: a function to render custom cell content
  render?: (value: any, row: T) => React.ReactNode;
}

// Sorting state type
export type SortState<T> = {
  column: keyof T | null;
  direction: 'asc' | 'desc';
};

// Props for the DataTable component
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // Optional: sorting support
  onSort?: (column: keyof T) => void;
  sortState?: SortState<T>;
}

/**
 * DataTable is a reusable table component with optional sorting support.
 * - columns: array of column definitions
 * - data: array of data objects
 * - onSort: function to call when a header is clicked
 * - sortState: current sort state (column and direction)
 */
function DataTable<T extends object>({ columns, data, onSort, sortState }: DataTableProps<T>) {
  // Helper to show sort indicator
  const getSortIndicator = (col: Column<T>) => {
    if (!sortState || sortState.column !== col.accessor) return null;
    return sortState.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className={`px-4 py-2 text-left font-semibold text-gray-700 select-none ${onSort && typeof col.accessor === 'string' ? '' : onSort ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                onClick={
                  onSort && typeof col.accessor !== 'string'
                    ? () => onSort(col.accessor as keyof T)
                    : undefined
                }
              >
                {col.header}
                {getSortIndicator(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-400">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-4 py-2">
                    {/* If a custom render function is provided, use it. Otherwise, show the value. */}
                    {col.render
                      ? col.render(
                          row[col.accessor as keyof T],
                          row
                        )
                      : String(row[col.accessor as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable; 