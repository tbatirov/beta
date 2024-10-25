import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { ParsedData } from '../utils/fileParsers';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';

interface EditableFinancialTableProps {
  statements: { name: string; gaapData: ParsedData }[];
  onDataChange: (index: number, newData: ParsedData) => void;
}

const EditableFinancialTable: React.FC<EditableFinancialTableProps> = ({ statements, onDataChange }) => {
  const [data, setData] = useState<ParsedData[]>(statements.map(s => s.gaapData));
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setData(statements.map(s => s.gaapData));
    logger.log(LogLevel.DEBUG, 'EditableFinancialTable data updated', { data: statements.map(s => s.gaapData) });
  }, [statements]);

  // Transform the flat data into a matrix format
  const matrixData = useMemo(() => {
    const keys = Object.keys(data[0] || {});
    const rows = keys.reduce((acc, key) => {
      const [rowKey, rowIndex] = key.split('_');
      if (rowIndex !== undefined) { // Ensure rowIndex is defined
        acc[rowIndex] = acc[rowIndex] || {};
        acc[rowIndex][rowKey] = data[0][key];
      }
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Filter out rows that are completely empty
    const filteredRows = Object.values(rows).filter(row => 
      Object.values(row).some(value => value !== undefined && value !== null && value !== '')
    );

    // Log the matrixData for debugging
    console.log('Matrix Data:', filteredRows);

    return filteredRows;
  }, [data]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (matrixData.length === 0) return [];

    const allKeys = new Set<string>();
    matrixData.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });

    return Array.from(allKeys).map(key => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue, row, column, table }) => {
        const initialValue = getValue() as string;
        const [value, setValue] = useState(initialValue);

        const onBlur = () => {
          const newData = { ...data[row.index], [column.id]: value };
          onDataChange(row.index, newData);
        };

        return (
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            className="w-full p-1 border rounded"
          />
        );
      },
    }));
  }, [matrixData, onDataChange]);

  const table = useReactTable({
    data: matrixData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (error) {
    return <div className="text-red-500">{t('editableFinancialTable.error', { error })}</div>;
  }

  if (matrixData.length === 0) {
    return <div className="text-gray-500">{t('editableFinancialTable.noData')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getFilteredRowModel().rows.map(row => (
              <tr key={row.id} className="bg-white border-b hover:bg-gray-100">
                {row.getAllCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableFinancialTable;
