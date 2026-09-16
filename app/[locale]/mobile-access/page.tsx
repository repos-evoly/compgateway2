"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";
import { FaBan, FaCheck, FaClock, FaMobileAlt } from "react-icons/fa";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ConfirmationDialog from "@/app/components/reusable/ConfirmationDialog";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { getEmployees } from "../users/services";
import type { CompanyEmployee } from "../users/types";
import ActivationCodeModal from "./components/ActivationCodeModal";
import {
  approveMobileDevice,
  listMobileDevices,
  revokeMobileDevice,
} from "./services";
import type { MobileDevice } from "./types";

type PendingAction = { device: MobileDevice; action: "approve" | "revoke" };

const readCompanyAdminCookie = (): boolean => {
  const raw = Cookies.get("isCompanyAdmin");
  if (!raw) return false;
  try {
    const value = decodeURIComponent(raw).replace(/^"|"$/g, "").toLowerCase();
    return value === "true" || value === "1";
  } catch {
    return false;
  }
};

export default function MobileAccessPage() {
  const t = useTranslations("mobileAccess");
  const locale = useLocale();
  const [isReady, setIsReady] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [activationOpen, setActivationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [resultModal, setResultModal] = useState({
    open: false,
    success: false,
    title: "",
    message: "",
  });

  const pageSize = 20;

  useEffect(() => {
    const admin = readCompanyAdminCookie();
    setIsCompanyAdmin(admin);
    setIsReady(true);
  }, []);

  const loadDevices = useCallback(async () => {
    if (!isCompanyAdmin) return;
    setLoading(true);
    try {
      const response = await listMobileDevices(page, pageSize, status || undefined);
      setDevices(response.data);
      setTotalPages(Math.max(1, Math.ceil(response.totalRecords / response.limit)));
    } catch (error) {
      setResultModal({
        open: true,
        success: false,
        title: t("errors.title"),
        message: error instanceof Error ? error.message : t("errors.loadDevices"),
      });
    } finally {
      setLoading(false);
    }
  }, [isCompanyAdmin, page, status, t]);

  useEffect(() => {
    if (isReady && isCompanyAdmin) void loadDevices();
  }, [isReady, isCompanyAdmin, loadDevices]);

  useEffect(() => {
    if (!isCompanyAdmin) return;
    getEmployees()
      .then(setEmployees)
      .catch(() => {
        setEmployees([]);
      });
  }, [isCompanyAdmin]);

  const employeeNames = useMemo(
    () =>
      new Map(
        employees.map((employee) => [
          employee.authUserId,
          `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
            employee.email ||
            employee.username ||
            String(employee.authUserId),
        ])
      ),
    [employees]
  );

  const formatDate = (value?: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : t("never");

  const statusLabel = (value: string) => {
    switch (value.toLowerCase()) {
      case "approved":
        return t("statuses.approved");
      case "pending":
        return t("statuses.pending");
      case "revoked":
        return t("statuses.revoked");
      default:
        return value;
    }
  };

  const statusClasses = (value: string) => {
    switch (value.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "targetAuthUserId",
      label: t("columns.user"),
      renderCell: (row: MobileDevice) => (
        <div>
          <div className="font-medium text-gray-800">
            {employeeNames.get(row.targetAuthUserId) ?? `#${row.targetAuthUserId}`}
          </div>
          <div className="text-xs text-gray-500">#{row.targetAuthUserId}</div>
        </div>
      ),
    },
    { key: "installationId", label: t("columns.installationId") },
    {
      key: "platform",
      label: t("columns.platform"),
      renderCell: (row: MobileDevice) => (
        <span className="capitalize">{row.platform}</span>
      ),
    },
    { key: "appVersion", label: t("columns.appVersion") },
    {
      key: "status",
      label: t("columns.status"),
      renderCell: (row: MobileDevice) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses(row.status)}`}>
          {statusLabel(row.status)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("columns.createdAt"),
      renderCell: (row: MobileDevice) => formatDate(row.createdAt),
    },
    {
      key: "lastSeenAt",
      label: t("columns.lastSeenAt"),
      renderCell: (row: MobileDevice) => formatDate(row.lastSeenAt),
    },
    {
      key: "deviceActions",
      label: t("columns.actions"),
      renderCell: (row: MobileDevice) => {
        const normalized = row.status.toLowerCase();
        const canApprove = normalized === "pending" && Boolean(row.proofVerifiedAt);
        const canRevoke = normalized !== "revoked";

        return (
          <div className="flex items-center justify-center gap-2">
            {canApprove && (
              <button
                type="button"
                title={t("actions.approve")}
                aria-label={t("actions.approve")}
                onClick={() => setPendingAction({ device: row, action: "approve" })}
                className="rounded-full p-2 text-green-700 hover:bg-green-100"
              >
                <FaCheck />
              </button>
            )}
            {normalized === "pending" && !row.proofVerifiedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700" title={t("actions.awaitingProof")}>
                <FaClock /> {t("actions.awaitingProof")}
              </span>
            )}
            {canRevoke && (
              <button
                type="button"
                title={t("actions.revoke")}
                aria-label={t("actions.revoke")}
                onClick={() => setPendingAction({ device: row, action: "revoke" })}
                className="rounded-full p-2 text-red-700 hover:bg-red-100"
              >
                <FaBan />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const confirmMutation = async (confirmed: boolean) => {
    const operation = pendingAction;
    setPendingAction(null);
    if (!confirmed || !operation || mutationLoading) return;

    setMutationLoading(true);
    try {
      if (operation.action === "approve") {
        await approveMobileDevice(operation.device.deviceId);
      } else {
        await revokeMobileDevice(operation.device.deviceId);
      }
      setResultModal({
        open: true,
        success: true,
        title: t("result.successTitle"),
        message:
          operation.action === "approve"
            ? t("result.approved")
            : t("result.revoked"),
      });
      await loadDevices();
    } catch (error) {
      setResultModal({
        open: true,
        success: false,
        title: t("errors.title"),
        message: error instanceof Error ? error.message : t("errors.updateDevice"),
      });
    } finally {
      setMutationLoading(false);
    }
  };

  if (!isReady) {
    return <div className="p-4 text-gray-500">{t("loading")}</div>;
  }

  if (!isCompanyAdmin) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="text-lg font-bold">{t("accessDeniedTitle")}</h2>
          <p className="mt-2">{t("accessDeniedMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <FaMobileAlt className="mt-0.5 shrink-0 text-lg" />
          <div>
            <p className="font-semibold">{t("manualFlow.title")}</p>
            <p className="mt-1">{t("manualFlow.description")}</p>
          </div>
        </div>
      </div>

      <CrudDataGrid
        data={devices}
        columns={columns}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading || mutationLoading}
        showAddButton
        addButtonLabel={t("activation.generate")}
        onAddClick={() => setActivationOpen(true)}
        showSearchBar
        showSearchInput={false}
        showDropdown
        dropdownOptions={[
          { value: "", label: t("statuses.all") },
          { value: "Pending", label: t("statuses.pending") },
          { value: "Approved", label: t("statuses.approved") },
          { value: "Revoked", label: t("statuses.revoked") },
        ]}
        onDropdownSelect={(value) => {
          setStatus(value);
          setPage(1);
        }}
        showActions={false}
      />

      <ActivationCodeModal
        isOpen={activationOpen}
        employees={employees}
        onClose={() => setActivationOpen(false)}
      />

      <ConfirmationDialog
        openDialog={Boolean(pendingAction)}
        message={
          pendingAction?.action === "approve"
            ? t("confirm.approve")
            : t("confirm.revoke")
        }
        onClose={confirmMutation}
      />

      <ErrorOrSuccessModal
        isOpen={resultModal.open}
        isSuccess={resultModal.success}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() => setResultModal((current) => ({ ...current, open: false }))}
        onConfirm={() => setResultModal((current) => ({ ...current, open: false }))}
        okLabel={t("close")}
        confirmLabel={t("close")}
        closeAriaLabel={t("close")}
      />
    </div>
  );
}
