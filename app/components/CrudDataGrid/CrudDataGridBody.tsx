import React from "react";
import ActionButtons from "./ActionButtons";
import { useTranslations } from "next-intl";

type CrudDataGridBodyProps = {
  columns: { key: string; label: string }[]; // Columns now include key and label
  data: { [key: string]: string | number }[];
  showActions?: boolean;
  actions?: { name: string; icon: React.ReactNode; tip: string }[];
  onActionClick?: (rowIndex: number, action: string) => void;
};

const CrudDataGridBody: React.FC<CrudDataGridBodyProps> = ({
  columns,
  data,
  showActions = false,
  actions = [],
  onActionClick,
}) => {
  const t = useTranslations("crudDataGrid");
  return (
    <div>
      {/* Columns */}
      <div className="flex bg-info-light border-b border-gray-300">
        {columns.map((col, index) => (
          <div
            key={index}
            className="flex-1 px-4 py-2 font-semibold text-gray-700 cursor-default"
          >
            {col.label}
          </div>
        ))}
        {showActions && (
          <div className="w-32 px-4 py-2 font-semibold text-gray-700">
            عمليات
          </div>
        )}
      </div>

      {/* Rows */}
      <div>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex border-b border-gray-200 hover:bg-gray-50"
            >
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex-1 px-4 py-2 text-gray-600">
                  {row[col.key] || ""}
                </div>
              ))}
              {showActions && (
                <div className="w-32 px-4 py-2 flex items-center">
                  <ActionButtons
                    actions={actions}
                    onActionClick={(action) =>
                      onActionClick && onActionClick(rowIndex, action)
                    }
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          // Display message if no data is available
          <div className="flex items-center justify-center py-4 text-gray-500">
            {t("noItems")}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrudDataGridBody;
