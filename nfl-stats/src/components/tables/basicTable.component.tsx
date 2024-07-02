import React from 'react';

interface TableProps {
  headers: string[];
  columnOrder: string[];
  data: Record<string, any>[];
  onRowClick: (rowData: Record<string, any>) => void;
}

const BasicTable: React.FC<TableProps> = ({ headers, columnOrder, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} onClick={() => onRowClick(row)} className="hover:bg-gray-100 cursor-pointer">
              {columnOrder.map((column) => (
                <td key={column} className="px-6 py-4 whitespace-nowrap">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BasicTable;