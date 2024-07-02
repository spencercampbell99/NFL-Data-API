import React, { useState } from 'react';

type Transformer = (...values: any[]) => any;

interface TableProps {
    headers: string[];
    columnOrder: Array<string | { key: Array<string>, transformer: Transformer }>;
    data: Array<Record<string, any>>;
    onRowClick: (rowData: Record<string, any>) => void;
    childHeaders?: string[];
    childColumnOrder?: Array<string | { key: Array<string>, transformer: Transformer }>;
    childrenKey?: string;
}

const NestedTable: React.FC<TableProps> = ({
    headers,
    columnOrder,
    data,
    onRowClick,
    childHeaders,
    childColumnOrder,
    childrenKey = 'children',
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

const handleExpandClick = (rowIndex: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
        newExpandedRows.delete(rowIndex);
    } else {
        newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
};

const renderCell = (row: Record<string, any>, column: string | { key: string|Array<string>, transformer: Transformer }) => {
    if (typeof column === 'string') {
        return row[column];
    } else {
        if (!Array.isArray(column.key)) {
            return column.transformer(row[column.key]);
        }
        const keys = column.key;
        const values = keys.map(key => row[key.trim()]);
        return column.transformer(...values);
    }
};

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
            <React.Fragment key={rowIndex}>
              <tr
                onClick={() => onRowClick(row)}
                className="hover:bg-gray-100 cursor-pointer"
              >
                {columnOrder.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {renderCell(row, column)}
                  </td>
                ))}
                <td className="px-6 py-4">
                  {row[childrenKey] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandClick(rowIndex);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {expandedRows.has(rowIndex) ? 'Collapse' : 'Expand'}
                    </button>
                  )}
                </td>
              </tr>
              {expandedRows.has(rowIndex) && row[childrenKey] && (
                <tr>
                  <td colSpan={headers.length + 1}>
                    <div className="ml-4">
                      <NestedTable
                        headers={childHeaders || headers}
                        columnOrder={childColumnOrder || columnOrder}
                        data={row[childrenKey]}
                        onRowClick={onRowClick}
                        childHeaders={childHeaders}
                        childColumnOrder={childColumnOrder}
                        childrenKey={childrenKey}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NestedTable;
