import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { ParsedData } from '../utils/fileParsers';

interface MappingClassificationProps {
  financialData: ParsedData;
  onMappingComplete: (mappedData: any) => void;
}

const MappingClassification: React.FC<MappingClassificationProps> = ({ financialData, onMappingComplete }) => {
  const [mappings, setMappings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (financialData) {
      generateInitialMappings(financialData);
    }
  }, [financialData]);

  const generateInitialMappings = async (data: ParsedData) => {
    logger.log(LogLevel.INFO, 'Generating initial IFRS mappings');
    setLoading(true);

    try {
      const initialMappings = await simulateAutomatedMapping(data);
      setMappings(initialMappings);
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error generating initial mappings', { error });
    } finally {
      setLoading(false);
    }
  };

  const simulateAutomatedMapping = async (data: ParsedData): Promise<{ [key: string]: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    const mappings: { [key: string]: string } = {};

    Object.entries(data).forEach(([key, value]) => {
      const accountName = key.split('_')[0].toLowerCase();
      if (accountName.includes('revenue')) {
        mappings[key] = 'IFRS 15 - Revenue from Contracts with Customers';
      } else if (accountName.includes('lease')) {
        mappings[key] = 'IFRS 16 - Leases';
      } else if (accountName.includes('financial instrument')) {
        mappings[key] = 'IFRS 9 - Financial Instruments';
      } else if (accountName.includes('property') || accountName.includes('equipment')) {
        mappings[key] = 'IAS 16 - Property, Plant and Equipment';
      } else if (accountName.includes('inventory')) {
        mappings[key] = 'IAS 2 - Inventories';
      } else {
        mappings[key] = 'Unmapped';
      }
    });

    return mappings;
  };

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const allKeys = Object.keys(financialData);
    const columnNames = Array.from(new Set(allKeys.map(key => key.split('_')[0])));
    
    return [
      ...columnNames.map(columnName => ({
        accessorKey: columnName,
        header: columnName,
        cell: ({ row }) => financialData[`${columnName}_${row.index}`],
      })),
      {
        id: 'mapping',
        header: 'IFRS Mapping',
        cell: ({ row }) => (
          <select
            value={mappings[`${columnNames[0]}_${row.index}`] || 'Unmapped'}
            onChange={(e) => handleMappingChange(`${columnNames[0]}_${row.index}`, e.target.value)}
            className="border rounded p-1"
          >
            <option value="Unmapped">Unmapped</option>
            <option value="IFRS 15 - Revenue from Contracts with Customers">IFRS 15 - Revenue</option>
            <option value="IFRS 16 - Leases">IFRS 16 - Leases</option>
            <option value="IFRS 9 - Financial Instruments">IFRS 9 - Financial Instruments</option>
            <option value="IAS 16 - Property, Plant and Equipment">IAS 16 - Property, Plant and Equipment</option>
            <option value="IAS 2 - Inventories">IAS 2 - Inventories</option>
          </select>
        ),
      },
    ];
  }, [financialData, mappings]);

  const tableData = useMemo(() => {
    const rowCount = Math.max(...Object.keys(financialData).map(key => parseInt(key.split('_')[1]))) + 1;
    return Array.from({ length: rowCount }, (_, index) => ({ index }));
  }, [financialData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleMappingChange = (key: string, ifrsStandard: string) => {
    setMappings(prev => ({ ...prev, [key]: ifrsStandard }));
  };

  const handleSubmit = () => {
    const mappedData = Object.entries(financialData).reduce((acc, [key, value]) => {
      const standard = mappings[key] || 'Unmapped';
      acc[standard] = acc[standard] || [];
      acc[standard].push({ key, value });
      return acc;
    }, {} as any);

    onMappingComplete(mappedData);
  };

  if (loading) {
    return <div>Generating initial mappings...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Account Mapping and Classification</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Confirm Mappings and Proceed
      </button>
    </div>
  );
};

export default MappingClassification;