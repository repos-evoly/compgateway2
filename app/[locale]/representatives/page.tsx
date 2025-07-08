"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import ConfirmationDialog from "@/app/components/reusable/ConfirmationDialog";


import { getRepresentatives, toggleRepresentativeStatus } from "./services";
import type { Representative } from "./types";

export default function RepresentativesPage() {
  const t = useTranslations("representatives");
  const router = useRouter();
  const pathname = usePathname();

  // Determine the locale based on the pathname
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  /*─────────────────────────── Table / pagination ───────────────────────────*/
  const [data, setData] = useState<Representative[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  /*─────────────────────────── Search input  ────────────────────────────────*/
  const [searchTerm, setSearchTerm] = useState("");

  /*─────────────────────────── Modal state  ─────────────────────────────────*/
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /*─────────────────────────── Confirmation dialog state  ───────────────────*/
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);

  /*─────────────────────────── Loading state  ───────────────────────────────*/
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  /*─────────────────────────── Fetch data  ──────────────────────────────────*/
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRepresentatives(currentPage, limit, searchTerm);
      setData(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch representatives:", error);
      setModalOpen(true);
      setModalSuccess(false);
      setModalTitle(t("errorTitle"));
      setModalMessage(error instanceof Error ? error.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, t]);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, fetchData]);

  /*─────────────────────────── Handle add  ──────────────────────────────────*/
  const handleAdd = () => {
    router.push("/representatives/add");
  };

  /*─────────────────────────── Handle action click  ─────────────────────────*/
  const handleActionClick = async (actionName: string, row: Representative) => {
    if (actionName === "edit") {
      router.push(`/representatives/${row.id}`);
    } else if (actionName === "delete") {
      setSelectedRepresentative(row);
      setShowConfirmation(true);
    }
  };

  /*─────────────────────────── Handle confirmation  ─────────────────────────*/
  const handleConfirmation = async (confirmed: boolean) => {
    setShowConfirmation(false);
    
    if (!confirmed || !selectedRepresentative) return;

    try {
      setTogglingId(selectedRepresentative.id);
      
      console.log('Toggling status for representative:', selectedRepresentative.id, 'Current status:', selectedRepresentative.isActive);
      
      // Call the API first
      const updatedRepresentative = await toggleRepresentativeStatus(selectedRepresentative.id);
      console.log('API response:', updatedRepresentative);
      
      // Update the UI with the server response
      const updatedData = data.map(rep => 
        rep.id === selectedRepresentative.id 
          ? { ...rep, isActive: updatedRepresentative.isActive }
          : rep
      );
      setData(updatedData);
      
      setModalOpen(true);
      setModalSuccess(true);
      setModalTitle(t("successTitle"));
      setModalMessage(updatedRepresentative.isActive ? t("activatedSuccess") : t("deactivatedSuccess"));
    } catch (error) {
      console.error("Failed to toggle representative status:", error);
      setModalOpen(true);
      setModalSuccess(false);
      setModalTitle(t("errorTitle"));
      setModalMessage(error instanceof Error ? error.message : t("unexpectedError"));
    } finally {
      setTogglingId(null);
    }
  };

  /*─────────────────────────── Table columns  ───────────────────────────────*/
  const columns = [
    {
      key: "id",
      label: t("columns.id"),
      sortable: true,
      renderCell: (row: Representative) => (
        <div 
          className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors duration-200 border border-transparent hover:border-gray-300 group"
          onDoubleClick={() => router.push(`/representatives/${row.id}`)}
          title={t("doubleClickToEdit")}
        >
          <span className="text-black font-medium group-hover:text-gray-700">{row.id}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: t("columns.name"),
      sortable: true,
    },
    {
      key: "number",
      label: t("columns.number"),
      sortable: true,
    },
    {
      key: "passportNumber",
      label: t("columns.passportNumber"),
      sortable: true,
    },
    {
      key: "isActive",
      label: t("columns.status"),
      sortable: true,
      renderCell: (row: Representative) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black">
          {row.isActive ? t("status.active") : t("status.inactive")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("columns.createdAt"),
      sortable: true,
      renderCell: (row: Representative) => new Date(row.createdAt).toLocaleDateString(currentLocale),
    },
    {
      key: "actions",
      label: t("columns.actions"),
      sortable: false,
      renderCell: (row: Representative) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleActionClick("edit", row)}
            className="p-2 text-black hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors duration-200"
            title={t("actions.edit")}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleActionClick("delete", row)}
            disabled={togglingId === row.id}
            className={`p-2 rounded-full transition-colors duration-200 ${
              togglingId === row.id
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:text-gray-700 hover:bg-gray-50"
            }`}
            title={row.isActive ? t("actions.deactivate") : t("actions.activate")}
          >
            <FaTrash className={`w-4 h-4 ${togglingId === row.id ? "animate-pulse" : ""}`} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <CrudDataGrid
        columns={columns}
        data={data}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showSearchInput={true}
        onSearch={setSearchTerm}
        showAddButton={true}
        onAddClick={handleAdd}
        loading={loading}
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
      />

      <ConfirmationDialog
        openDialog={showConfirmation}
        message={selectedRepresentative 
          ? selectedRepresentative.isActive 
            ? t("confirmDeactivateMessage") 
            : t("confirmActivateMessage")
          : ""
        }
        onClose={handleConfirmation}
      />
    </div>
  );
} 