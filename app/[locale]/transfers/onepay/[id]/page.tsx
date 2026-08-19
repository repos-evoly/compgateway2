"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import BackButton from "@/app/components/reusable/BackButton";
import LoadingPage from "@/app/components/reusable/Loading";

import ApproveExecutionModal from "../components/ApproveExecutionModal";
import OnePayRowActions, {
  type OnePayActionName,
} from "../components/OnePayRowActions";
import OnePayStatusBadge from "../components/OnePayStatusBadge";
import { formatOnePayAmount, formatOnePayDateTime } from "../formatters";
import { canApproveOnePayTransfer } from "../permissions";
import {
  approveOnePayTransfer,
  getOnePayTransferById,
  refreshOnePayTransferStatus,
} from "../services";
import type { OnePayTransfer } from "../types";

type NoticeState = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
};

const EMPTY_NOTICE: NoticeState = {
  isOpen: false,
  isSuccess: false,
  title: "",
  message: "",
};

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  wide?: boolean;
};

function DetailItem({ label, value, mono = false, wide = false }: DetailItemProps) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className={`break-words text-sm font-medium text-slate-900 ${mono ? "font-mono" : ""}`}>
        {value === null || value === undefined || value === "" ? "-" : value}
      </dd>
    </div>
  );
}

export default function OnePayTransferDetailsPage() {
  const t = useTranslations("onePayTransfer");
  const statusT = useTranslations("onePayTransfer.statuses");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const transferId = Number(params?.id);

  const [transfer, setTransfer] = useState<OnePayTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [canApprove, setCanApprove] = useState(false);
  const [activeAction, setActiveAction] =
    useState<Exclude<OnePayActionName, null> | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(EMPTY_NOTICE);

  useEffect(() => {
    setCanApprove(canApproveOnePayTransfer());
  }, []);

  useEffect(() => {
    let active = true;

    const loadTransfer = async () => {
      setLoading(true);
      setLoadError("");
      try {
        if (!Number.isFinite(transferId) || transferId <= 0) {
          throw new Error(t("errors.invalidTransfer"));
        }
        const result = await getOnePayTransferById(transferId);
        if (active) setTransfer(result);
      } catch (error) {
        if (!active) return;
        setLoadError(
          error instanceof Error ? error.message : t("errors.unknown")
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTransfer();
    return () => {
      active = false;
    };
  }, [t, transferId]);

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
    if (!transfer || activeAction) return;
    setActiveAction("approve");
    try {
      const updated = await approveOnePayTransfer(transfer.id);
      setTransfer(updated);
      setApprovalOpen(false);
      showActionResult(updated);
    } catch (error) {
      setApprovalOpen(false);
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

  const refreshStatus = async () => {
    if (!transfer || activeAction) return;
    setActiveAction("refresh");
    try {
      const updated = await refreshOnePayTransferStatus(transfer.id);
      setTransfer(updated);
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

  if (loading) return <LoadingPage />;

  if (!transfer) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <BackButton fallbackPath="/transfers/onepay" isEditing />
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {loadError || t("errors.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const providerHasDetails = Boolean(
    transfer.providerTransactionStatus ||
      transfer.providerReturnMessageCode ||
      transfer.providerReturnMessage ||
      transfer.bankReferenceNo ||
      transfer.lastStatusCheckedAt ||
      transfer.statusCheckAttempts
  );
  const hasAvailableAction =
    (transfer.status === "pendingApproval" && canApprove && transfer.canApprove) ||
    transfer.status === "pendingProviderResponse" ||
    transfer.status === "unknown";

  return (
    <div className="p-2 sm:p-4">
      <div className="rounded-xl bg-white p-3 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-info-dark p-4 text-white">
          <BackButton fallbackPath="/transfers/onepay" isEditing />
          <div>
            <h1 className="text-lg font-bold">{t("details.title")}</h1>
            <p className="text-sm text-white/75">{transfer.referenceNo}</p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end ltr:sm:ml-auto rtl:sm:mr-auto">
            <OnePayStatusBadge status={transfer.status} />
            {hasAvailableAction && (
              <OnePayRowActions
                transfer={transfer}
                canApprove={canApprove && transfer.canApprove}
                loadingAction={activeAction}
                showView={false}
                variant="header"
                onView={() => undefined}
                onApprove={() => setApprovalOpen(true)}
                onRefresh={() => void refreshStatus()}
              />
            )}
          </div>
        </div>

        {transfer.status === "unknown" && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <FiAlertTriangle className="mt-0.5 shrink-0" size={19} />
            <span>{t("details.unknownWarning")}</span>
          </div>
        )}

        {transfer.status === "pendingProviderResponse" && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <FiInfo className="mt-0.5 shrink-0" size={19} />
            <span>{t("details.pendingProviderNote")}</span>
          </div>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            {t("details.transferSection")}
          </h2>
          <dl className="grid gap-3 md:grid-cols-2">
            <DetailItem label={t("columns.reference")} value={transfer.referenceNo} mono />
            <DetailItem
              label={t("fields.amount")}
              value={`${formatOnePayAmount(transfer.amount, locale)} ${transfer.currency}`}
            />
            <DetailItem label={t("fields.fromAccount")} value={transfer.fromAccount} mono />
            <DetailItem label={t("details.fromAccountName")} value={transfer.fromAccountName} />
            <DetailItem label={t("fields.toBank")} value={transfer.toInstitutionName} />
            <DetailItem label={t("fields.toAccount")} value={transfer.toAccount} mono />
            <DetailItem label={t("columns.recipientName")} value={transfer.toAccountName} />
            <DetailItem label={t("fields.currency")} value={transfer.currency} />
            <DetailItem label={t("fields.narrative")} value={transfer.description} wide />
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            {t("details.auditSection")}
          </h2>
          <dl className="grid gap-3 md:grid-cols-2">
            <DetailItem label={t("columns.createdBy")} value={transfer.createdByName} />
            <DetailItem
              label={t("columns.requestedAt")}
              value={formatOnePayDateTime(transfer.createdAt, locale)}
            />
            <DetailItem label={t("details.approvedBy")} value={transfer.approvedByName} />
            <DetailItem
              label={t("details.validatedAt")}
              value={formatOnePayDateTime(transfer.validatedAt, locale)}
            />
            <DetailItem
              label={t("details.executedAt")}
              value={formatOnePayDateTime(transfer.executedAt, locale)}
            />
            <DetailItem
              label={t("details.completedAt")}
              value={formatOnePayDateTime(transfer.completedAt, locale)}
            />
          </dl>
        </section>

        {providerHasDetails && (
          <section className="mt-6">
            <h2 className="mb-3 text-base font-bold text-slate-900">
              {t("details.providerSection")}
            </h2>
            <dl className="grid gap-3 md:grid-cols-2">
              <DetailItem
                label={t("details.providerStatus")}
                value={transfer.providerTransactionStatus}
              />
              <DetailItem
                label={t("details.bankReference")}
                value={transfer.bankReferenceNo}
                mono
              />
              <DetailItem
                label={t("details.providerCode")}
                value={transfer.providerReturnMessageCode}
              />
              <DetailItem
                label={t("details.statusChecks")}
                value={transfer.statusCheckAttempts}
              />
              <DetailItem
                label={t("details.lastStatusCheck")}
                value={formatOnePayDateTime(
                  transfer.lastStatusCheckedAt,
                  locale
                )}
              />
              <DetailItem
                label={t("details.providerMessage")}
                value={transfer.providerReturnMessage}
                wide
              />
            </dl>
          </section>
        )}

      </div>

      <ApproveExecutionModal
        isOpen={approvalOpen}
        transfer={transfer}
        isSubmitting={activeAction === "approve"}
        onClose={() => {
          if (!activeAction) setApprovalOpen(false);
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
