import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  mobileCardView?: boolean;
}

export function ResponsiveTable({ 
  columns, 
  data, 
  emptyMessage = "No data available",
  mobileCardView = true 
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className={`${mobileCardView ? 'hidden md:block' : ''} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`text-left p-3 font-medium text-gray-600 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className={`p-3 ${column.className || ''}`}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="md:hidden space-y-3">
          {data.map((row, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                        {column.label}:
                      </span>
                      <span className="text-sm text-gray-900 ml-2 text-right">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
