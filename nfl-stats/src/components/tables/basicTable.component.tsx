import React, { useState, useMemo } from 'react';

interface ColumnConfig {
  header: string;
  key: string;
  searchable: boolean;
  sortable: boolean;
}

interface TableProps {
  columns: ColumnConfig[];
  data: Record<string, any>[];
  onRowClick?: (rowData: Record<string, any>) => void;
}

const BasicTable: React.FC<TableProps> = ({ columns, data, onRowClick = () => {} }) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearchChange = (key: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every((column) => {
        if (!column.searchable) return true;
        const query = searchQueries[column.key] || '';
        return row[column.key]?.toString().toLowerCase().includes(query.toLowerCase());
      })
    );
  }, [data, searchQueries, columns]);

  const sortedData = useMemo(() => {
    if (sortConfig !== null) {
      return [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  }, [filteredData, sortConfig]);

  const currentData = useMemo(() => {
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [currentPage, rowsPerPage, sortedData]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  {column.sortable && (
                    <span
                      onClick={() => requestSort(column.key)}
                      className="cursor-pointer"
                    >
                      {column.header}
                    </span>
                  )}
                  {!column.sortable && column.header}
                  {column.searchable && (
                    <input
                      type="text"
                      placeholder={`Search ${column.header}`}
                      value={searchQueries[column.key] || ''}
                      onChange={(e) => handleSearchChange(column.key, e.target.value)}
                      className="ml-2 p-1 border border-gray-300 rounded"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex} onClick={() => onRowClick(row)} className="hover:bg-gray-100 cursor-pointer">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 ?
        <div className="flex justify-between items-center m-4">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm text-blue-500 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm text-blue-500 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 text-sm text-blue-500 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 text-sm text-blue-500 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Last
          </button>
        </div>
      : null}
    </div>
  );
};

export default BasicTable;
