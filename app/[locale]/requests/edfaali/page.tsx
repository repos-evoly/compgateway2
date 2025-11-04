"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FormikHelpers } from "formik";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import EdfaaliForm from "./components/EdfaaliForm";
import {
  createEdfaaliRequest,
  getEdfaaliRequests,
} from "./services";
import { TEdfaaliFormValues, TEdfaaliListItem } from "./types";
import { getRepresentatives } from "@/app/[locale]/representatives/services";

const formatAccountNumber = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length === 13) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 10)}-${digits.slice(10)}`;
  }
  return value;
};

type RepresentativeEntry = {
  repId: string;
  repName: string;
};

const mergeRepresentativeEntries = (
  current: Record<string, string>,
  entries: RepresentativeEntry[]
): Record<string, string> => {
  let changed = false;
  const next = { ...current };

  entries.forEach(({ repId, repName }) => {
    if (repId.length === 0) return;
    if (next[repId] !== repName && repName.length > 0) {
      next[repId] = repName;
      changed = true;
    }
  });

  return changed ? next : current;
};

const formatDateTime = (value?: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

const EdfaaliRequestsPage: React.FC = () => {
  const t = useTranslations("edfaaliForm");

  const [rows, setRows] = useState<TEdfaaliListItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [representativeLabelMap, setRepresentativeLabelMap] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const reps = await getRepresentatives(1, 10_000);
        if (!mounted) return;

        const entries = reps.data
          .map((rep) => {
            if (rep.id == null) return null;
            const repId = String(rep.id);
            const repName = (rep.name ?? "").trim() || `#${rep.id}`;
            return { repId, repName } as const;
          })
          .filter((entry): entry is { repId: string; repName: string } =>
            Boolean(entry && entry.repId.length > 0)
          );

        setRepresentativeLabelMap((current) =>
          mergeRepresentativeEntries(current, entries)
        );
      } catch (error) {
        console.error("Failed to load representatives for Edfaali page:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const resolveRepresentativeLabel = useCallback(
    (representativeId: string, providedName?: string | null): string => {
      if (providedName && providedName.trim()) {
        return providedName;
      }
      return representativeLabelMap[representativeId] ?? representativeId;
    },
    [representativeLabelMap]
  );

  const enhanceRow = useCallback(
    (item: TEdfaaliListItem): TEdfaaliListItem => ({
      ...item,
      representativeName: resolveRepresentativeLabel(
        item.representativeId,
        item.representativeName
      ),
    }),
    [resolveRepresentativeLabel]
  );

  const columns = useMemo(
    () => [
      { key: "companyEnglishName", label: t("companyEnglishName") },
      {
        key: "representativeName",
        label: t("representative"),
        renderCell: (row: TEdfaaliListItem) =>
          resolveRepresentativeLabel(row.representativeId, row.representativeName),
      },
      { key: "servicePhoneNumber", label: t("servicePhoneNumber") },
      {
        key: "accountNumber",
        label: t("accountNumber"),
        renderCell: (row: TEdfaaliListItem) =>
          formatAccountNumber(row.accountNumber),
      },
      {
        key: "createdAt",
        label: t("createdAt"),
        renderCell: (row: TEdfaaliListItem) => formatDateTime(row.createdAt),
      },
    ],
    [resolveRepresentativeLabel, t]
  );

  const fetchRequests = useCallback(
    async (options?: { silent?: boolean }) => {
      setLoading(true);
      try {
        const result = await getEdfaaliRequests();
        const listEntries: RepresentativeEntry[] = result.data
          .map((item) => {
            const key = item.representativeId?.trim();
            const name = item.representativeName?.trim();
            if (!key || !name) return null;
            return { repId: key, repName: name } as RepresentativeEntry;
          })
          .filter((entry): entry is RepresentativeEntry => entry !== null);

        if (listEntries.length > 0) {
          setRepresentativeLabelMap((current) =>
            mergeRepresentativeEntries(current, listEntries)
          );
        }
        setRows(result.data.map(enhanceRow));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("genericError");
        if (options?.silent) {
          console.error("Failed to load Edfaali requests:", error);
        } else {
          setModalSuccess(false);
          setModalTitle(t("errorTitle"));
          setModalMessage(message);
          setModalOpen(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [enhanceRow, t]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFormSubmit = useCallback(
    async (
      values: TEdfaaliFormValues,
      helpers: FormikHelpers<TEdfaaliFormValues>
    ) => {
      helpers.setStatus(undefined);
      try {
        const created = await createEdfaaliRequest(values);
        const enriched = enhanceRow(created);
        setRows((prev) => [enriched, ...prev]);
        helpers.resetForm();
        setShowForm(false);
        setModalSuccess(true);
        setModalTitle(t("successTitle"));
        setModalMessage(t("successMessage"));
        setModalOpen(true);
        await fetchRequests({ silent: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("genericError");
        helpers.setStatus({ error: message });
        setModalSuccess(false);
        setModalTitle(t("errorTitle"));
        setModalMessage(message);
        setModalOpen(true);
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [enhanceRow, fetchRequests, t]
  );

  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleAddClick = useCallback(() => {
    setShowForm(true);
  }, []);

  return (
    <div className="p-4">
      {showForm ? (
        <EdfaaliForm onSubmit={handleFormSubmit} onBack={handleCancel} />
      ) : (
        <CrudDataGrid
          data={rows}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showAddButton
          onAddClick={handleAddClick}
          showSearchBar={false}
          showSearchInput={false}
          loading={loading}
          noPagination
        />
      )}

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        okLabel={t("close")}
        confirmLabel={t("close")}
      />
    </div>
  );
};

export default EdfaaliRequestsPage;
