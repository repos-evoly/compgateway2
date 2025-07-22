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
}) => {
  const t = useTranslations("crudDataGrid");

  // -----------------------------
  // Pagination
  // -----------------------------
  const [goToPage, setGoToPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setGoToPage(String(currentPage));
  }, [currentPage]);
  if (loading) {
    return (
      <CrudDataGridSkeleton columns={columns.length + (showActions ? 1 : 0)} />
    );
  }

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  const goToNextPage = () => {
    if (canGoForward && onPageChange) onPageChange(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (canGoBack && onPageChange) onPageChange(currentPage - 1);
  };

  const goToFirstPage = () => {
    if (canGoBack && onPageChange) onPageChange(1);
  };

  const goToLastPage = () => {
    if (canGoForward && onPageChange) onPageChange(totalPages);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPage(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= totalPages
    ) {
      onPageChange(pageNum);
    } else {
      setGoToPage(String(currentPage));
    }
  };

  // -----------------------------
  // Hide unused features
  // -----------------------------
  const safeDropdownSelect = showDropdown ? onDropdownSelect : undefined;
  const safeSearch = showSearchInput ? onSearch : undefined;

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-visible w-full">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <CrudDataGridHeader
          onSearch={safeSearch}
          onDropdownSelect={safeDropdownSelect}
          dropdownOptions={showDropdown ? dropdownOptions : []}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          showSearchBar={showSearchBar}
          haveChildrens={haveChildrens}
          childrens={childrens}
          showSearchInput={showSearchInput}
          showDropdown={showDropdown}
        />
      </div>

      {/* Body */}
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
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 border-t p-2 overflow-x-auto">
          <div
            className="flex flex-wrap items-center justify-start gap-2"
            style={{ direction: "ltr" }}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToFirstPage}
                disabled={!canGoBack}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoBack ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goFirst")}
              >
                <FaAngleDoubleLeft className="text-xs sm:text-sm" />
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={!canGoBack}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoBack ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goPrevious")}
              >
                <FaAngleLeft className="text-xs sm:text-sm" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={!canGoForward}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoForward ? "bg-info-dark" : "bg-gray-300"
                } text-white`}
                title={t("goNext")}
              >
                <FaAngleRight className="text-xs sm:text-sm" />
              </button>
              <button
                onClick={goToLastPage}
                disabled={!canGoForward}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  canGoForward ? "bg-info-dark" : "bg-gray-300"
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
                className="w-12 sm:w-16 border border-gray-300 rounded px-1 py-0.5 text-xs sm:text-sm ml-1"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudDataGrid;
