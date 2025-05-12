"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import ActionButtons from "./ActionButtons";
import type { CrudDataGridBodyProps, DataGridColumn, T } from "@/types";

const CrudDataGridBody: React.FC<CrudDataGridBodyProps> = ({
  columns,
  data = [],
  showActions = false,
  actions = [],
  onActionClick,
  isModal,
  modalComponent,
  onModalOpen,
}) => {
  const t = useTranslations("crudDataGrid");
  const router = useRouter();
  const currentPath = usePathname(); // e.g. "/transfers/internal"

  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<
    Record<number, boolean>
  >({});

  // Container ref for detecting RTL
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRTL, setIsRTL] = useState(false);

  // Canvas for measuring text width
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Create canvas for text measurements
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    if (containerRef.current) {
      setIsRTL(getComputedStyle(containerRef.current).direction === "rtl");
    }

    // Check if we're in mobile view
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Compute minimal widths
  const computeMinWidth = useCallback((col: DataGridColumn) => {
    let baseWidth = col.label.length * 12 + 50;
    if (col.key === "to") {
      baseWidth = 250; // custom logic
    }
    return Math.max(baseWidth, 100);
  }, []);

  const columnMinWidths = useMemo(() => {
    const cmw: Record<number, number> = {};
    columns.forEach((col, idx) => {
      cmw[idx] = computeMinWidth(col);
    });

    if (showActions) {
      cmw[columns.length] = 180; // actions column
    }
    return cmw;
  }, [columns, showActions, computeMinWidth]);

  const [columnWidths, setColumnWidths] = useState<Record<number, number>>(
    () => {
      const initial: Record<number, number> = {};
      columns.forEach((col, idx) => {
        initial[idx] = columnMinWidths[idx];
      });
      if (showActions) {
        initial[columns.length] = columnMinWidths[columns.length];
      }
      return initial;
    }
  );

  // Resizing logic
  const [resizing, setResizing] = useState<number | null>(null);
  const resizeStartX = useRef<number>(0);
  const initialWidths = useRef<Record<number, number>>({});

  const handleResizeStart = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    setResizing(columnIndex);
    resizeStartX.current = e.clientX;
    initialWidths.current = { ...columnWidths };
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (resizing === null) return;
      const delta = isRTL
        ? resizeStartX.current - e.clientX
        : e.clientX - resizeStartX.current;

      const newWidth = initialWidths.current[resizing] + delta;
      const minWidth = columnMinWidths[resizing] || 100;

      if (newWidth >= minWidth) {
        setColumnWidths((prev) => ({
          ...prev,
          [resizing]: newWidth,
        }));
      }
    },
    [resizing, isRTL, columnMinWidths]
  );

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
    resizeStartX.current = 0;
    initialWidths.current = {};
  }, []);

  useEffect(() => {
    if (resizing !== null) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // Sum all column widths
  const totalTableWidth = Object.values(columnWidths).reduce(
    (sum, w) => sum + w,
    0
  );

  /**
   * Double-click => pass row data in the query string.
   * We assume row has 'id'. We'll do: /transfers/internal/[id]?row=encodedRow
   */
  const handleRowDoubleClick = (rowIndex: number) => {
    if (isModal && onModalOpen) {
      onModalOpen(rowIndex, data[rowIndex]);
      setActiveRow(rowIndex);
      return;
    }

    const rowObject = data[rowIndex];
    if (!rowObject) return;

    // For example, rowObject.id => the row's unique ID
    const rowId = rowObject.id;
    // Encode the entire row as JSON for the query param
    const rowJson = encodeURIComponent(JSON.stringify(rowObject));

    // e.g. "/transfers/internal/2?row={...}"
    router.push(`${currentPath}/${rowId}?row=${rowJson}`);
  };

  // Add touch support for double tap
  const lastTap = useRef<number>(0);
  const handleRowTap = (rowIndex: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleRowDoubleClick(rowIndex);
    }
    lastTap.current = now;
  };

  // Function to get display value for a cell
  const getCellDisplayValue = (row: T, col: DataGridColumn) => {
    if (col.renderCell) {
      return col.renderCell(row, 0); // We don't need rowIndex for display
    }

    const value = row[col.key];
    if (typeof value === "boolean") {
      return value ? t("yes") : t("no");
    } else if (value) {
      // If it's an ISO date
      if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) {
        return String(value).split("T")[0];
      } else {
        return String(value);
      }
    }
    return "";
  };

  // Function to measure text width
  const measureTextWidth = (
    text: string,
    fontSize = 14,
    fontFamily = "Arial"
  ): number => {
    if (!canvasRef.current) return 0;

    const context = canvasRef.current.getContext("2d");
    if (!context) return 0;

    context.font = `${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);

    // Add padding
    return metrics.width + 40; // 20px padding on each side
  };

  // Function to calculate optimal column width
  const calculateOptimalColumnWidth = (columnIndex: number): number => {
    // Start with the header width
    let maxWidth = measureTextWidth(columns[columnIndex].label, 14, "Arial");

    // Check all rows for this column
    data.forEach((row) => {
      const displayValue = getCellDisplayValue(row, columns[columnIndex]);
      const valueWidth = measureTextWidth(String(displayValue), 14, "Arial");
      maxWidth = Math.max(maxWidth, valueWidth);
    });

    // Ensure minimum width and add some buffer
    return Math.max(maxWidth, columnMinWidths[columnIndex]);
  };

  // Handle double click on column header
  const handleColumnHeaderDoubleClick = (columnIndex: number) => {
    const optimalWidth = calculateOptimalColumnWidth(columnIndex);

    setColumnWidths((prev) => ({
      ...prev,
      [columnIndex]: optimalWidth,
    }));

    setExpandedColumns((prev) => ({
      ...prev,
      [columnIndex]: true,
    }));
  };

  // Mobile card view
  if (isMobileView) {
    return (
      <div ref={containerRef} className="w-full">
        {data.length > 0 ? (
          <div className="space-y-4 p-2">
            {data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="border rounded-lg shadow-sm bg-white overflow-hidden"
                onClick={() => handleRowTap(rowIndex)}
              >
                <div className="divide-y">
                  {columns.map((col, colIndex) => (
                    <div key={colIndex} className="flex p-3">
                      <div className="font-medium text-gray-700 w-1/2">
                        {col.label}:
                      </div>
                      <div className="text-gray-600 w-1/2">
                        {getCellDisplayValue(row, col)}
                      </div>
                    </div>
                  ))}

                  {/* Actions row */}
                  {showActions && (
                    <div className="p-3 bg-gray-50">
                      <div className="font-medium text-gray-700 mb-2">
                        {t("actions")}:
                      </div>
                      <ActionButtons
                        actions={actions}
                        onActionClick={(actionName) =>
                          onActionClick &&
                          onActionClick(actionName, row, rowIndex)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">{t("noItems")}</div>
        )}

        {/* Modal if needed */}
        {isModal && activeRow !== null && modalComponent}
      </div>
    );
  }

  // Desktop table view (original)
  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto overflow-y-hidden"
    >
      <div
        className="table border border-gray-300"
        style={{
          tableLayout: "fixed",
          width: totalTableWidth,
          minWidth: "100%",
        }}
      >
        {/* Header */}
        <div className="table-header-group bg-info-light border-b border-gray-300">
          <div className="table-row">
            {columns.map((col, index) => (
              <div
                key={index}
                className="table-cell border-b border-gray-300 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 align-middle whitespace-nowrap relative text-xs sm:text-sm cursor-pointer"
                style={{
                  width: columnWidths[index],
                  minWidth: columnMinWidths[index],
                }}
                onDoubleClick={() => handleColumnHeaderDoubleClick(index)}
                title={t("doubleClickToExpand")}
              >
                <div className="flex items-center justify-between">
                  <span>{col.label}</span>
                </div>
                {/* Resize handle */}
                <div
                  className={`
                    absolute
                    ${isRTL ? "left-0" : "right-0"}
                    top-0 bottom-0
                    w-1
                    bg-gray-300
                    cursor-col-resize
                    hover:bg-blue-500
                    hover:w-1.5
                    transition-all
                    z-10
                    ${resizing === index ? "bg-blue-500 w-1.5" : ""}
                  `}
                  onMouseDown={(e) => handleResizeStart(e, index)}
                  onTouchStart={(e) => {
                    // Convert touch event to mouse event for mobile
                    const touch = e.touches[0];
                    handleResizeStart(
                      {
                        clientX: touch.clientX,
                        preventDefault: () => e.preventDefault(),
                      } as React.MouseEvent,
                      index
                    );
                  }}
                />
              </div>
            ))}

            {showActions && (
              <div
                className="table-cell border-b border-gray-300 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 align-middle whitespace-nowrap relative text-xs sm:text-sm"
                style={{
                  width: columnWidths[columns.length],
                  minWidth: columnMinWidths[columns.length],
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{t("actions")}</span>
                </div>
                <div
                  className={`
                    absolute
                    ${isRTL ? "left-0" : "right-0"}
                    top-0 bottom-0
                    w-1
                    bg-gray-300
                    cursor-col-resize
                    hover:bg-blue-500
                    hover:w-1.5
                    transition-all
                    z-10
                    ${resizing === columns.length ? "bg-blue-500 w-1.5" : ""}
                  `}
                  onMouseDown={(e) => handleResizeStart(e, columns.length)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    handleResizeStart(
                      {
                        clientX: touch.clientX,
                        preventDefault: () => e.preventDefault(),
                      } as React.MouseEvent,
                      columns.length
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="table-row-group">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="table-row border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onDoubleClick={() => handleRowDoubleClick(rowIndex)}
                onClick={() => handleRowTap(rowIndex)} // Add touch support
              >
                {columns.map((col, colIndex) => {
                  const isExpanded = expandedColumns[colIndex];

                  return (
                    <div
                      key={colIndex}
                      className="table-cell border-b border-gray-200 px-2 sm:px-4 py-1 sm:py-2 text-gray-600 align-middle text-xs sm:text-sm"
                      style={{
                        width: columnWidths[colIndex],
                        minWidth: columnMinWidths[colIndex],
                      }}
                      title={
                        typeof row[col.key] === "string"
                          ? (row[col.key] as string)
                          : ""
                      }
                    >
                      <div
                        className={`w-full block ${
                          isExpanded
                            ? ""
                            : "overflow-hidden text-ellipsis whitespace-nowrap"
                        }`}
                      >
                        {getCellDisplayValue(row, col)}
                      </div>
                    </div>
                  );
                })}

                {/* Actions column */}
                {showActions && (
                  <div
                    className="table-cell border-b border-gray-200 px-2 sm:px-4 py-1 sm:py-2 align-middle whitespace-nowrap"
                    style={{
                      width: columnWidths[columns.length],
                      minWidth: columnMinWidths[columns.length],
                    }}
                  >
                    <ActionButtons
                      actions={actions}
                      onActionClick={(actionName) =>
                        onActionClick &&
                        onActionClick(actionName, row, rowIndex)
                      }
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="table-row">
              <div className="table-cell px-4 py-2 text-center text-gray-500 text-xs sm:text-sm">
                {t("noItems")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal if needed */}
      {isModal && activeRow !== null && modalComponent}
    </div>
  );
};

export default CrudDataGridBody;
