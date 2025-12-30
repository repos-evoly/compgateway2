"use client";

import React, { JSX, useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";

import Button from "@/app/components/reusable/Button";
import Modal from "@/app/components/reusable/Modal";
import { FiCheck, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { editSalaryCycleEntry, updateSalaryCycle } from "../services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

type EntryLite = {
  id: number;
  employeeId?: number;
  name?: string;
  accountNumber?: string;
  salary?: number;
};

export type NotTransferredHeaderProps = {
  entries: EntryLite[]; // only entries where isTransferred === false
  cycleId: number;

  onApply?: (
    updates: Array<{
      id: number;
      accountNumber?: string;
      salary?: number;
    }>
  ) => void;
};

export default function NotTransferredHeader({
  entries,
  cycleId,
  onApply,
}: NotTransferredHeaderProps): JSX.Element | null {
  const t = useTranslations("salaries");
  const [open, setOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  // Note: Do not early-return before hooks; hide controls conditionally instead

  const initialValues = useMemo(
    () => ({
      rows: entries.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        name: e.name ?? "",
        accountNumber: e.accountNumber ?? "",
        salary: typeof e.salary === "number" ? e.salary : 0,
      })),
    }),
    [entries]
  );


  return (
    <>
      {entries.length > 0 && (
        <Button afterClick={() => setOpen(true)} isTransparent={true}>
          {t("repost", { defaultValue: "Repost" })}
        </Button>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">
              {t("modalTitle", { defaultValue: "Fix Not Transferred Salaries" })}
            </h3>
            <Formik
              initialValues={initialValues}
              enableReinitialize
              onSubmit={async (vals, { setSubmitting }) => {
                try {
                  const original = new Map(entries.map((e) => [e.id, e]));
                  const changed = vals.rows.filter((r) => {
                    const o = original.get(r.id);
                    if (!o) return true;
                    const oSalary = typeof o.salary === "number" ? o.salary : 0;
                    const oAcc = o.accountNumber ?? "";
                    return Number(r.salary || 0) !== Number(oSalary) || (r.accountNumber ?? "") !== oAcc;
                  });

                  if (changed.length === 0) {
                    setResultTitle(t("noChangesTitle", { defaultValue: "No changes" }));
                    setResultMessage(t("noChangesMessage", { defaultValue: "There are no changes to save." }));
                    setResultSuccess(true);
                    setResultOpen(true);
                    return;
                  }

                  // 1) Edit individual entries
                  for (const r of changed) {
                    await editSalaryCycleEntry(cycleId, r.id, {
                      amount: Number(r.salary) || 0,
                      accountNumber: r.accountNumber ?? "",
                    });
                  }

                  // 2) Repost cycle with edited employee IDs only
                  const employeeIds = Array.from(
                    new Set(
                      changed
                        .filter((r) => typeof r.employeeId === "number")
                        .map((r) => r.employeeId as number)
                    )
                  );
                  await updateSalaryCycle(cycleId, employeeIds);

                  onApply?.(
                    changed.map((r) => ({
                      id: r.id,
                      accountNumber: r.accountNumber,
                      salary: Number(r.salary),
                    }))
                  );

                  setResultTitle(t("saveSuccessTitle", { defaultValue: "Saved" }));
                  setResultMessage(t("saveSuccessMessage", { defaultValue: "Changes saved successfully." }));
                  setResultSuccess(true);
                  setResultOpen(true);
                } catch (err) {
                  console.error(err);
                  setResultTitle(t("saveErrorTitle", { defaultValue: "Save failed" }));
                  setResultMessage(t("saveErrorMessage", { defaultValue: "Failed to save changes. Please try again." }));
                  setResultSuccess(false);
                  setResultOpen(true);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-4">
                  {values.rows.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      No untransferred salaries found.
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-auto pr-1">
                      {values.rows.map((row, idx) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2 border-b border-slate-100"
                        >
                          <div className="sm:col-span-4">
                            <div className="text-xs text-slate-500">{t("name")}</div>
                            <div className="font-medium text-slate-900 truncate" title={row.name}>
                              {row.name || "-"}
                            </div>
                          </div>

                          <label className="sm:col-span-4 text-sm">
                            <div className="text-xs text-slate-500">{t("accountNumber")}</div>
                            <Field
                              name={`rows[${idx}].accountNumber`}
                              type="text"
                              className="w-full rounded border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-info-dark"
                              placeholder="e.g. 001-..."
                            />
                          </label>

                          <label className="sm:col-span-4 text-sm">
                            <div className="text-xs text-slate-500">{t("salary")}</div>
                            <Field
                              name={`rows[${idx}].salary`}
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full rounded border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-info-dark"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button afterClick={() => setOpen(false)} icon={<FiX />}>
                      {t("cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || values.rows.length === 0} icon={<FiCheck />}>
                      {t("saveAndRepost")}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Modal>
      )}

      <ErrorOrSuccessModal
        isOpen={resultOpen}
        isSuccess={resultSuccess}
        title={resultTitle}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
        onConfirm={() => {
          setResultOpen(false);
          if (resultSuccess) setOpen(false);
        }}
        okLabel={t("ok", { defaultValue: "OK" })}
        confirmLabel={t("confirm", { defaultValue: "Confirm" })}
        closeAriaLabel={t("close", { defaultValue: "Close" })}
      />
    </>
  );
}
