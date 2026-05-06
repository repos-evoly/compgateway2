"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { EmployeeExcelImportResult, EmployeesApiResponse } from "./types";
import { getEmployees, deleteEmployee, uploadEmployeesExcel } from "./services";
import { EmployeeResponse } from "./types";
import { FaEdit, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";
import type { Action } from "@/types";
import EmployeeForm from "./components/EmployeesForm";

const Page = () => {
  const t = useTranslations("employees");
  const router = useRouter();
  const locale = useLocale();

  // Table/pagination states
  const [data, setData] = useState<EmployeesApiResponse["data"]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // or whichever page size
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<EmployeeExcelImportResult | null>(null);

  // We'll create a function to fetch data
  const fetchEmployees = useMemo(
    () => async () => {
      setLoading(true); // Set loading state
      try {
        console.log("Fetching employees...");
        console.log("Current page:", currentPage);
        console.log("Limit:", limit);
        console.log("Search term:", searchTerm);
        const result = await getEmployees(currentPage, limit, searchTerm);
        console.log("Employees result:", result);
        console.log("Employees data:", result.data);
        console.log("Total pages:", result.totalPages);
        setData(result.data);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Error fetching employees:", err);
        const msg = err instanceof Error ? err.message : t("unknownError");
        setModalTitle(t("fetchErrorTitle")); // use your i18n keys
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false); // Reset loading state
      }
    },
    [currentPage, limit, searchTerm, t]
  );

  // On mount / whenever page or searchTerm changes => fetch data
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Define actions for the data grid
  const actions: Action[] = [
    {
      name: "edit",
      tip: t("editEmployee", { defaultValue: "Edit Employee" }),
      icon: <FaEdit />,
      onClick: (row) => {
        router.push(`/${locale}/employees/${row.id}`);
      },
    },
    {
      name: "delete",
      tip: t("deleteEmployee", { defaultValue: "Delete Employee" }),
      icon: <FaTrash />,
      onClick: async (row) => {
        if (
          confirm(
            t("confirmDelete", {
              defaultValue: "Are you sure you want to delete this employee?",
            })
          )
        ) {
          try {
            await deleteEmployee(Number(row.id));
            // Refresh the data after successful deletion
            fetchEmployees();
            setModalTitle(t("deleteSuccessTitle", { defaultValue: "Success" }));
            setModalMessage(
              t("deleteSuccessMsg", {
                defaultValue: "Employee deleted successfully",
              })
            );
            setModalSuccess(true);
            setModalOpen(true);
          } catch (err) {
            const msg = err instanceof Error ? err.message : t("unknownError");
            setModalTitle(t("deleteErrorTitle", { defaultValue: "Error" }));
            setModalMessage(msg);
            setModalSuccess(false);
            setModalOpen(true);
          }
        }
      },
    },
  ];

  // columns => minimal example
  const columns = [
    {
      key: "id",
      label: t("id"),
      renderCell: (row: EmployeeResponse) => (
        <div
          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          onDoubleClick={() => router.push(`/${locale}/employees/${row.id}`)}
          title={t("doubleClickToEdit", {
            defaultValue: "Double-click to edit",
          })}
        >
          {row.id}
        </div>
      ),
    },
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    {
      key: "salary",
      label: t("salary"),
      renderCell: (row: EmployeeResponse) => (
        <span>{row.salary?.toLocaleString() || "0"}</span>
      ),
    },
    {
      key: "date",
      label: t("date"),
      renderCell: (row: EmployeeResponse) => (
        <span>
          {row.date ? new Date(row.date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType") },
    {
      key: "sendSalary",
      label: t("sendSalary"),
      renderCell: (row: EmployeeResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.sendSalary
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.sendSalary ? t("yes") : t("no")}
        </span>
      ),
    },
    {
      key: "canPost",
      label: t("canPost"),
      renderCell: (row: EmployeeResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.canPost
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.canPost ? t("yes") : t("no")}
        </span>
      ),
    },
  ];

  // Searching & dropdown
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };
  const handleDropdownSelect = (val: string) => {
    console.log("Dropdown:", val);
  };

  // Show/hide form
  const handleAddClick = () => setShowForm(true);

  const resetSelectedUploadFile = () => {
    setSelectedUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      resetSelectedUploadFile();
      setModalTitle(
        t("uploadInvalidFileTitle", { defaultValue: "Invalid file" })
      );
      setModalMessage(
        t("uploadInvalidFileMsg", {
          defaultValue: "Please select an .xlsx file.",
        })
      );
      setModalSuccess(false);
      setModalOpen(true);
      return;
    }

    setSelectedUploadFile(file);
    setUploadConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedUploadFile) return;

    try {
      setUploading(true);
      const result = await uploadEmployeesExcel(selectedUploadFile);
      setUploadConfirmOpen(false);
      setUploadResult(result);
      resetSelectedUploadFile();
      await fetchEmployees();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setUploadConfirmOpen(false);
      setModalTitle(t("uploadErrorTitle", { defaultValue: "Upload failed" }));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleEmployeeCreated = () => {
    setShowForm(false);
    fetchEmployees(); // Refresh the data
    setModalTitle(t("createSuccessTitle"));
    setModalMessage(t("createSuccessMsg"));
    setModalSuccess(true);
    setModalOpen(true);
  };

  const handleFormBack = () => {
    setShowForm(false);
    // Don't show any modal, just hide the form
  };

  const uploadButton = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleUploadFileSelected}
      />
      <button
        type="button"
        onClick={handleUploadButtonClick}
        disabled={loading || uploading}
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap border border-white px-4 py-2 text-white ring-offset-2 transition hover:border-warning-light hover:bg-warning-light hover:text-info-dark focus:outline-none focus:ring-2 focus:ring-warning-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FaUpload aria-hidden="true" />
        <span>{t("uploadExcel", { defaultValue: "Upload Excel" })}</span>
      </button>
    </>
  );

  return (
    <div className="p-4">
      {showForm ? (
        <EmployeeForm
          initialData={{}}
          onSuccess={handleEmployeeCreated}
          onBack={handleFormBack}
        />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          // pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          // Searching
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          // Example dropdown
          showDropdown
          dropdownOptions={[
            { label: "Name", value: "name" },
            { label: "Email", value: "email" },
            { label: "Phone", value: "phone" },
            { label: "Account Number", value: "accountNumber" },
            { label: "Account Type", value: "accountType" },
          ]}
          onDropdownSelect={handleDropdownSelect}
          // Add button
          showAddButton
          onAddClick={handleAddClick}
          childrens={uploadButton}
          // Actions
          showActions
          actions={actions}
          // Enable double-click on ID
          loading={loading}
        />
      )}

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />

      {uploadConfirmOpen && selectedUploadFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded bg-white shadow-lg">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("uploadConfirmTitle", {
                  defaultValue: "Confirm employee sync",
                })}
              </h2>
            </div>
            <div className="space-y-3 p-4 text-sm text-gray-700">
              <p>
                {t("uploadConfirmFile", {
                  defaultValue: "File",
                })}
                {": "}
                <span className="font-semibold">{selectedUploadFile.name}</span>
              </p>
              <p className="text-red-700">
                {t("uploadConfirmWarning", {
                  defaultValue:
                    "Employees missing from this Excel file will be marked as deleted.",
                })}
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t p-4">
              <button
                type="button"
                onClick={() => {
                  setUploadConfirmOpen(false);
                  resetSelectedUploadFile();
                }}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-info-dark rounded hover:bg-warning-light hover:text-info-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("cancel", { defaultValue: "Cancel" })}
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-success-main rounded hover:bg-success-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading && <FaSpinner className="animate-spin" />}
                <span>
                  {t("uploadAndSync", { defaultValue: "Upload and Sync" })}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded bg-white shadow-lg">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("uploadResultTitle", {
                  defaultValue: "Employee sync result",
                })}
              </h2>
            </div>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                {[
                  {
                    label: t("uploadTotalRows", { defaultValue: "Rows" }),
                    value: uploadResult.totalRows,
                  },
                  {
                    label: t("uploadCreated", { defaultValue: "Created" }),
                    value: uploadResult.createdCount,
                  },
                  {
                    label: t("uploadUpdated", { defaultValue: "Updated" }),
                    value: uploadResult.updatedCount,
                  },
                  {
                    label: t("uploadDeleted", { defaultValue: "Deleted" }),
                    value: uploadResult.deletedCount,
                  },
                  {
                    label: t("uploadSkipped", { defaultValue: "Skipped" }),
                    value: uploadResult.skippedCount,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded border p-3">
                    <div className="text-xs font-medium text-gray-500">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {uploadResult.errors.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">
                    {t("uploadErrors", { defaultValue: "Skipped rows" })}
                  </h3>
                  <div className="max-h-56 overflow-y-auto rounded border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="w-24 px-3 py-2">
                            {t("uploadRow", { defaultValue: "Row" })}
                          </th>
                          <th className="px-3 py-2">
                            {t("uploadError", { defaultValue: "Error" })}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.errors.map((error) => (
                          <tr
                            key={`${error.rowNumber}-${error.message}`}
                            className="border-t"
                          >
                            <td className="px-3 py-2 font-medium">
                              {error.rowNumber}
                            </td>
                            <td className="px-3 py-2">{error.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t p-4">
              <button
                type="button"
                onClick={() => setUploadResult(null)}
                className="px-5 py-2 text-sm font-medium text-white bg-info-dark rounded hover:bg-warning-light hover:text-info-dark"
              >
                {t("close", { defaultValue: "Close" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
