"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { FiCheckCircle, FiEye, FiLoader, FiRefreshCw } from "react-icons/fi";
import type { LyPayTransfer } from "../types";

export type LyPayActionName = "approve" | "refresh" | null;

type LyPayRowActionsProps = {
  transfer: LyPayTransfer;
  canApprove: boolean;
  loadingAction?: LyPayActionName;
  showView?: boolean;
  variant?: "icon" | "header";
  onView: () => void;
  onApprove: () => void;
  onRefresh: () => void;
};

type ActionButtonProps = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  colorClass: string;
  icon: React.ReactNode;
  variant?: "icon" | "header";
  onClick: () => void;
};

function ActionButton({
  label,
  disabled = false,
  loading = false,
  colorClass,
  icon,
  variant = "icon",
  onClick,
}: ActionButtonProps) {
  const stopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        stopPropagation(event);
        if (!disabled) onClick();
      }}
      onDoubleClick={stopPropagation}
      className={`inline-flex items-center justify-center transition-colors ${
        variant === "header"
          ? "h-10 gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm"
          : "h-9 w-9 rounded-full"
      } ${colorClass} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? <FiLoader className="animate-spin" size={17} /> : icon}
      {variant === "header" && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default function LyPayRowActions({
  transfer,
  canApprove,
  loadingAction = null,
  showView = true,
  variant = "icon",
  onView,
  onApprove,
  onRefresh,
}: LyPayRowActionsProps) {
  const t = useTranslations("lyPayTransfer.actions");
  const busy = loadingAction !== null;
  const canExecute = transfer.status === "pendingApproval" && canApprove;
  const canRefresh =
    transfer.status === "pendingProviderResponse" ||
    transfer.status === "unknown";

  return (
    <div className="flex items-center justify-center gap-2">
      {showView && (
        <ActionButton
          label={t("view")}
          disabled={busy}
          colorClass={
            variant === "header"
              ? "bg-white text-info-dark hover:bg-warning-light"
              : "text-slate-700 hover:bg-slate-100"
          }
          icon={<FiEye size={17} />}
          variant={variant}
          onClick={onView}
        />
      )}

      {canExecute && (
        <ActionButton
          label={t("approveAndExecute")}
          disabled={busy}
          loading={loadingAction === "approve"}
          colorClass={
            variant === "header"
              ? "bg-white text-info-dark hover:bg-warning-light"
              : "text-green-700 hover:bg-green-100"
          }
          icon={<FiCheckCircle size={18} />}
          variant={variant}
          onClick={onApprove}
        />
      )}

      {canRefresh && (
        <ActionButton
          label={t("refreshStatus")}
          disabled={busy}
          loading={loadingAction === "refresh"}
          colorClass={
            variant === "header"
              ? "bg-white text-info-dark hover:bg-warning-light"
              : "text-blue-700 hover:bg-blue-100"
          }
          icon={<FiRefreshCw size={18} />}
          variant={variant}
          onClick={onRefresh}
        />
      )}
    </div>
  );
}
