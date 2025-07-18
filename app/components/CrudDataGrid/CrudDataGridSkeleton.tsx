/* --------------------------------------------------------------------------
   components/CrudDataGridSkeleton.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";

type CrudDataGridSkeletonProps = {
  columns: number; // include the Actions column if present
  rows?: number;
};

const CrudDataGridSkeleton: React.FC<CrudDataGridSkeletonProps> = ({
  columns,
  rows = 10,
}) => {
  const range = (n: number) => [...Array(n).keys()];

  return (
    <div className="w-full border border-gray-300 rounded-md shadow-sm animate-pulse">
      {/* ── Solid header bar (no controls) ─────────────────────────────── */}
      <div className="bg-info-dark h-14 rounded-t-md" />

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="table w-full">
        {/* Header row */}
        <div className="table-header-group">
          <div className="table-row">
            {range(columns).map((i) => (
              <div
                key={i}
                className="table-cell bg-info-light px-4 py-3 border-b border-gray-300"
              >
                <div className="h-4 rounded bg-gray-300/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Body rows */}
        <div className="table-row-group">
          {range(rows).map((r) => (
            <div key={r} className="table-row">
              {range(columns).map((c) => (
                <div
                  key={c}
                  className="table-cell px-4 py-3 border-t border-gray-200 first:w-full"
                >
                  <div className="h-3 rounded bg-gray-200/60" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Pagination bar ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-t p-2">
        <div
          className="flex flex-wrap items-center gap-2"
          style={{ direction: "ltr" }}
        >
          {range(4).map((b) => (
            <div key={b} className="w-7 h-7 rounded-full bg-info-light/60" />
          ))}
          <div className="h-4 w-28 bg-gray-300/60 rounded" />
          <div className="h-7 w-16 bg-gray-300/60 rounded" />
        </div>
      </div>
    </div>
  );
};

export default CrudDataGridSkeleton;
