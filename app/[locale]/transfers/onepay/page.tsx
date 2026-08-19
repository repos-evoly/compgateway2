"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import type { DataGridColumn } from "@/types";

import ApproveExecutionModal from "./components/ApproveExecutionModal";
import OnePayRowActions, {
  type OnePayActionName,
} from "./components/OnePayRowActions";
import OnePayStatusBadge from "./components/OnePayStatusBadge";
import { formatOnePayAmount, formatOnePayDateTime } from "./formatters";
import {
  canApproveOnePayTransfer,
  canCreateOnePayTransfer,
} from "./permissions";
import {
  approveOnePayTransfer,
  getOnePayTransfers,
  refreshOnePayTransferStatus,
} from "./services";
import type { OnePayTransfer } from "./types";

const PAGE_SIZE = 10;

type NoticeState = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
};

type ActiveAction = {
  transferId: number;
  name: Exclude<OnePayActionName, null>;
} | null;

const EMPTY_NOTICE: NoticeState = {
  isOpen: false,
  isSuccess: false,
  title: "",
  message: "",
};

export default function OnePayTransfersPage() {
  const t = useTranslations("onePayTransfer");
  const statusT = useTranslations("onePayTransfer.statuses");
  const locale = useLocale();
  const router = useRouter();

  const [transfers, setTransfers] = useState<OnePayTransfer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [approvalTarget, setApprovalTarget] =
    useState<OnePayTransfer | null>(null);
  const [notice, setNotice] = useState<NoticeState>(EMPTY_NOTICE);

  useEffect(() => {
    setCanCreate(canCreateOnePayTransfer());
    setCanApprove(canApproveOnePayTransfer());
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOnePayTransfers(
        currentPage,
        PAGE_SIZE,
        searchTerm
      );
      setTransfers(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      setNotice({
        isOpen: true,
        isSuccess: false,
        title: t("errors.fetchTitle"),
        message: error instanceof Error ? error.message : t("errors.unknown"),
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, t]);

  useEffect(() => {
    void fetchTransfers();
  }, [fetchTransfers]);

  const updateTransfer = (updated: OnePayTransfer) => {
    setTransfers((current) =>
      current.map((transfer) =>
        transfer.id === updated.id ? updated : transfer
      )
    );
  };

  const showActionResult = (updated: OnePayTransfer) => {
    const isSuccessfulResult =
      updated.status !== "failed" && updated.status !== "unknown";
    setNotice({
      isOpen: true,
      isSuccess: isSuccessfulResult,
      title: isSuccessfulResult
        ? t("messages.actionSuccessTitle")
        : t("messages.actionAttentionTitle"),
      message: t("messages.currentStatus", {
        status: statusT(updated.status),
      }),
    });
  };

  const approveTransfer = async () => {
    if (!approvalTarget || activeAction) return;
    const transferId = approvalTarget.id;
    setActiveAction({ transferId, name: "approve" });
    try {
      const updated = await approveOnePayTransfer(transferId);
      updateTransfer(updated);
      setApprovalTarget(null);
      showActionResult(updated);
    } catch (error) {
      setApprovalTarget(null);
      setNotice({
        isOpen: true,
        isSuccess: false,
        title: t("errors.approveTitle"),
        message: error instanceof Error ? error.message : t("errors.unknown"),
      });
    } finally {
      setActiveAction(null);
    }
  };

  const refreshTransfer = async (transfer: OnePayTransfer) => {
    if (activeAction) return;
    setActiveAction({ transferId: transfer.id, name: "refresh" });
    try {
      const updated = await refreshOnePayTransferStatus(transfer.id);
      updateTransfer(updated);
      showActionResult(updated);
    } catch (error) {
      setNotice({
        isOpen: true,
        isSuccess: false,
        title: t("errors.refreshTitle"),
        message: error instanceof Error ? error.message : t("errors.unknown"),
      });
    } finally {
      setActiveAction(null);
    }
  };

  const columns: DataGridColumn[] = [
      { key: "referenceNo", label: t("columns.reference") },
      {
        key: "createdAt",
        label: t("columns.requestedAt"),
        renderCell: (row: OnePayTransfer) =>
          formatOnePayDateTime(row.createdAt, locale),
      },
      { key: "fromAccount", label: t("fields.fromAccount") },
      { key: "toInstitutionName", label: t("fields.toBank") },
      { key: "toAccount", label: t("fields.toAccount") },
      { key: "toAccountName", label: t("columns.recipientName") },
      {
        key: "amount",
        label: t("fields.amount"),
        renderCell: (row: OnePayTransfer) =>
          `${formatOnePayAmount(row.amount, locale)} ${row.currency}`,
      },
      { key: "createdByName", label: t("columns.createdBy") },
      {
        key: "status",
        label: t("columns.status"),
        renderCell: (row: OnePayTransfer) => (
          <OnePayStatusBadge status={row.status} />
        ),
      },
      {
        key: "actions",
        label: t("columns.actions"),
        renderCell: (row: OnePayTransfer) => (
          <OnePayRowActions
            transfer={row}
            canApprove={canApprove && row.canApprove}
            loadingAction={
              activeAction?.transferId === row.id ? activeAction.name : null
            }
            onView={() =>
              router.push(`/${locale}/transfers/onepay/${row.id}`)
            }
            onApprove={() => setApprovalTarget(row)}
            onRefresh={() => void refreshTransfer(row)}
          />
        ),
      },
    ];

  return (
    <div className="p-2 sm:p-4">
      <CrudDataGrid
        data={transfers}
        columns={columns}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showSearchBar
        showSearchInput
        showDropdown={false}
        onSearch={(value) => {
          setSearchTerm(value.trim());
          setCurrentPage(1);
        }}
        showAddButton={canCreate}
        onAddClick={() => router.push(`/${locale}/transfers/onepay/add`)}
        showActions={false}
        loading={loading}
        canEdit
      />

      <ApproveExecutionModal
        isOpen={approvalTarget !== null}
        transfer={approvalTarget}
        isSubmitting={
          approvalTarget !== null &&
          activeAction?.transferId === approvalTarget.id &&
          activeAction.name === "approve"
        }
        onClose={() => {
          if (!activeAction) setApprovalTarget(null);
        }}
        onConfirm={() => void approveTransfer()}
      />

      <ErrorOrSuccessModal
        isOpen={notice.isOpen}
        isSuccess={notice.isSuccess}
        title={notice.title}
        message={notice.message}
        onClose={() => setNotice(EMPTY_NOTICE)}
        onConfirm={() => setNotice(EMPTY_NOTICE)}
        okLabel={t("common.ok")}
        confirmLabel={t("common.confirm")}
        closeAriaLabel={t("common.close")}
      />
    </div>
  );
}
