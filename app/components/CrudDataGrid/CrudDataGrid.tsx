"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import {
  FaAngleLeft,
  FaAngleDoubleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

import CrudDataGridHeader from "./CrudDataGridHeader";
import CrudDataGridBody from "./CrudDataGridBody";
import type { CrudDataGridProps } from "@/types";
import CrudDataGridSkeleton from "./CrudDataGridSkeleton";

const CrudDataGrid: React.FC<CrudDataGridProps> = ({
  data,
  columns,
  showSearchBar = false,
  onSearch,
  onDropdownSelect,
  dropdownOptions = [],
  showActions = false,
  actions,
  showAddButton = false,
  onAddClick,
  haveChildrens = false,
  childrens,
  isModal,
  modalComponent,
  onModalOpen,
  showDropdown = false,
  showSearchInput = false,
  onPageChange,
  currentPage,
  totalPages,
  loading = false,
  canEdit,
  noPagination = false,
}) => {
  const t = useTranslations("crudDataGrid");

  // -----------------------------
  // Pagination
  // -----------------------------
  const [goToPage, setGoToPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setGoToPage(String(currentPage));
  }, [currentPage]);

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  const goToNextPage = () => {
    if (canGoForward && onPageChange && !loading) onPageChange(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (canGoBack && onPageChange && !loading) onPageChange(currentPage - 1);
  };

  const goToFirstPage = () => {
    if (canGoBack && onPageChange && !loading) onPageChange(1);
  };

  const goToLastPage = () => {
    if (canGoForward && onPageChange && !loading) onPageChange(totalPages);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPage(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitGoToPage();
    }
  };

  const handlePageInputBlur = () => {
    submitGoToPage();
  };

  const submitGoToPage = () => {
    const pageNum = Number.parseInt(goToPage, 10);
    if (
      onPageChange &&
      !Number.isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= totalPages &&
      !loading
    ) {
      onPageChange(pageNum);
    } else {
      setGoToPage(String(currentPage));
    }
  };

  // -----------------------------
  // Hide/disable unused features
  // Keep header mounted; disable handlers while loading
  // -----------------------------
  const safeDropdownSelect =
    showDropdown && !loading ? onDropdownSelect : undefined;
  const safeSearch = showSearchInput && !loading ? onSearch : undefined;

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-visible w-full">
      {/* Header (always mounted) */}
      <div className="border-b border-gray-200 bg-gray-50">
        <CrudDataGridHeader
          onSearch={safeSearch}
          onDropdownSelect={safeDropdownSelect}
          dropdownOptions={showDropdown ? dropdownOptions : []}
          showAddButton={showAddButton}
          onAddClick={!loading ? onAddClick : undefined}
          showSearchBar={showSearchBar}
          haveChildrens={haveChildrens}
          childrens={childrens}
          showSearchInput={showSearchInput}
          showDropdown={showDropdown}
        />
      </div>

      {/* Body: swap only the body when loading */}
      {loading ? (
        <CrudDataGridSkeleton
          columns={columns.length + (showActions ? 1 : 0)}
        />
      ) : (
        <CrudDataGridBody
          columns={columns}
          data={data}
          showActions={showActions}
          actions={actions}
          onActionClick={(actionName, row, rowIndex) => {
            const action = actions?.find((a) => a.name === actionName);
            if (action && action.onClick) {
              action.onClick(row, rowIndex);
            }
          }}
          isModal={isModal}
          modalComponent={modalComponent}
          onModalOpen={onModalOpen}
          canEdit={canEdit}
          noPagination={noPagination}
        />
      )}

      {/* Pagination (always mounted) */}
      {!noPagination && totalPages > 1 && (
        <div className="bg-gray-50 border-t p-2 overflow-x-auto">
          <div
            className="flex flex-wrap items-center justify-start gap-2"
            style={{ direction: "ltr" }}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToFirstPage}
                disabled={!canGoBack || loading}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoBack && !loading ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goFirst")}
                type="button"
              >
                <FaAngleDoubleLeft className="text-xs sm:text-sm" />
              </button>
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={!canGoBack || loading}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoBack && !loading ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goPrevious")}
              >
                <FaAngleLeft className="text-xs sm:text-sm" />
              </button>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={!canGoForward || loading}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoForward && !loading ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goNext")}
              >
                <FaAngleRight className="text-xs sm:text-sm" />
              </button>
              <button
                type="button"
                onClick={goToLastPage}
                disabled={!canGoForward || loading}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoForward && !loading ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goLast")}
              >
                <FaAngleDoubleRight className="text-xs sm:text-sm" />
              </button>
            </div>

            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
              {t("page")} {currentPage} {t("of")} {totalPages}
            </span>

            <label className="text-xs sm:text-sm font-medium flex items-center flex-wrap">
              <span className="whitespace-nowrap">{t("goTo")}</span>
              <input
                type="number"
                value={goToPage}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageInputBlur}
                min={1}
                max={totalPages}
                disabled={loading}
                className="w-12 sm:w-16 border border-gray-300 rounded px-1 py-0.5 text-xs sm:text-sm ml-1 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudDataGrid;
