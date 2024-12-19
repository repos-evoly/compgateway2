import React, { useState } from "react";
import ActionButtons from "./ActionButtons";
import { useTranslations } from "next-intl";

type CrudDataGridBodyProps = {
  columns: { key: string; label: string }[];
  data: { [key: string]: string | number | boolean }[];
  showActions?: boolean;
  actions?: { name: string; icon: React.ReactNode; tip: string }[];
  onActionClick?: (rowIndex: number, action: string) => void;
  isModal?: boolean;
  modalComponent?: React.ReactNode;
  onModalOpen?: (
    rowIndex: number,
    row: { [key: string]: string | number | boolean }
  ) => void;
  isComponent?: boolean;
  componentToRender?: React.ReactNode;
  onComponentRender?: (
    rowIndex: number,
    row: { [key: string]: string | number | boolean }
  ) => void;
};

const CrudDataGridBody: React.FC<CrudDataGridBodyProps> = ({
  columns,
  data,
  showActions = false,
  actions = [],
  onActionClick,
  isModal,
  modalComponent,
  onModalOpen,
  isComponent,
  componentToRender,
  onComponentRender,
}) => {
  const t = useTranslations("crudDataGrid");

  const [activeRow, setActiveRow] = useState<number | null>(null);

  // Ensure only one of `isModal` or `isComponent` is passed
  if (isModal && isComponent) {
    throw new Error(
      "You can only pass either `isModal` or `isComponent`, not both."
    );
  }

  return (
    <div>
      {isComponent && activeRow !== null && componentToRender ? (
        // Render the form if `isComponent` is true and a row is selected
        componentToRender
      ) : (
        // Render the grid
        <>
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
                {t("actions")}
              </div>
            )}
          </div>

          <div>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => {
                    if (isModal && onModalOpen) {
                      onModalOpen(rowIndex, row);
                      setActiveRow(rowIndex); // Ensure modal opens for the active row
                    } else if (isComponent && onComponentRender) {
                      setActiveRow(rowIndex); // Set active row for rendering the form
                      onComponentRender(rowIndex, row);
                    }
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <div
                      key={colIndex}
                      className="flex-1 px-4 py-2 text-gray-600"
                    >
                      {typeof row[col.key] === "boolean"
                        ? row[col.key]
                          ? t("yes") || "Yes"
                          : t("no") || "No"
                        : row[col.key] || ""}
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
              <div className="flex items-center justify-center py-4 text-gray-500">
                {t("noItems")}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModal && activeRow !== null && modalComponent}
    </div>
  );
};

export default CrudDataGridBody;
