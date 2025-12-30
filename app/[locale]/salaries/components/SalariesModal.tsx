/* ==========================================================================
   components/SalariesModal.tsx
   Pick debit account + Arabic month; optional additional month (13-24).
   ========================================================================== */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form } from "formik";
import Cookies from "js-cookie";

import InputSelectCombo, { type InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import { CheckAccount, type AccountInfo } from "@/app/helpers/checkAccount";
import { getEmployeeSalaryCycles } from "../services";
import type { TSalaryTransaction } from "../types";

/* ---------- helper component: auto-fill additionalMonth on toggle ---------- */
type AutoFillProps = {
  enabled: boolean;
  cyclesThisYear: TSalaryTransaction[];
  setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void;
};

const AutoFillAdditionalMonth: React.FC<AutoFillProps> = ({
  enabled,
  cyclesThisYear,
  setFieldValue,
}) => {
  const prevEnabled = useRef<boolean>(false);
  useEffect(() => {
    if (enabled && !prevEnabled.current) {
      const nums = cyclesThisYear
        .map((c) => {
          const raw = c.additionalMonth;
          const n = Number.parseInt(String(raw ?? "").trim(), 10);
          return Number.isFinite(n) ? n : NaN;
        })
        .filter((n) => !Number.isNaN(n) && n >= 13 && n <= 24);

      let suggested = "";
      if (nums.length === 0) suggested = "13";
      else {
        const max = Math.max(...nums);
        suggested = max >= 24 ? "" : String(max + 1);
      }

      setFieldValue("additionalMonth", suggested, false);
    }
    prevEnabled.current = enabled;
  }, [enabled, cyclesThisYear, setFieldValue]);
  return null;
};

/* ---------- helper: company code from cookies ---------- */
const getCompanyCode = (): string | undefined => {
  const raw = Cookies.get("companyCode");
  if (!raw) return undefined;
  return decodeURIComponent(raw).replace(/^"|"$/g, "");
};

/* ---------- props ---------- */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    debitAccount: string,
    salaryMonthArabic: string,
    additionalMonth: string | null
  ) => void;
};

const SalariesModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [options, setOptions] = useState<InputSelectComboOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cycles, setCycles] = useState<TSalaryTransaction[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAll = async (): Promise<void> => {
      try {
        setLoading(true);
        setFetchError(null);
        const companyCode = getCompanyCode();
        if (!companyCode) throw new Error("Company code not found.");
        const accounts = await CheckAccount(companyCode);
        const filtered = accounts.filter((acc: AccountInfo) => acc.currency === "LYD");
        const opts = filtered.map<InputSelectComboOption>((acc) => ({
          label: `${acc.accountString} - ${acc.accountName}`,
          value: acc.accountString,
        }));
        setOptions(opts);

        // Fetch existing salary cycles (page=1, limit=100)
        try {
          const res = await getEmployeeSalaryCycles(1, 100);
          setCycles(Array.isArray(res?.data) ? res.data : []);
        } catch {
          // If cycles fail to load, proceed with empty list (no duplicates will be detected)
          setCycles([]);
        }
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : "Failed to fetch accounts");
      } finally {
        setLoading(false);
      }
    };
    void fetchAll();
  }, [isOpen]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const cyclesThisYear = useMemo(() => {
    return cycles.filter((c) => {
      const d = new Date(c.createdAt);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === currentYear;
    });
  }, [cycles, currentYear]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-black">Select Debit Account & Salary Month</h2>

        {loading && <p className="text-sm">Loading accounts…</p>}
        {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}

        {!loading && !fetchError && (
          <Formik
            initialValues={{
              debitAccount: "",
              salaryMonth: "",
              hasAdditionalMonth: false,
              additionalMonth: "",
            }}
            validate={(vals) => {
              const errors: Record<string, string> = {};
              if (!vals.debitAccount) errors.debitAccount = "Required";
              if (!vals.salaryMonth) errors.salaryMonth = "Required";
              if (vals.hasAdditionalMonth) {
                const trimmed = String(vals.additionalMonth ?? "").trim();
                const n = Number.parseInt(trimmed, 10);
                if (!trimmed || Number.isNaN(n) || n < 13 || n > 24) {
                  errors.additionalMonth = "Enter a number between 13 and 24";
                }
              }

              // Duplicate prevention for current year
              const selectedMonth = String(vals.salaryMonth ?? "").trim();
              const requestedAdditional = vals.hasAdditionalMonth
                ? (String(vals.additionalMonth ?? "").trim() || null)
                : null;

              if (requestedAdditional === null && selectedMonth) {
                // Rule 1: For month-only cycles, prevent duplicate of the same salary month in current year
                const monthOnlyExists = cyclesThisYear.find((c) => {
                  const cMonth = String(c.salaryMonth ?? "").trim();
                  const cAdd = c.additionalMonth != null && String(c.additionalMonth).trim() !== ""
                    ? String(c.additionalMonth).trim()
                    : null;
                  return cMonth === selectedMonth && cAdd === null;
                });
                if (monthOnlyExists) {
                  errors.salaryMonth =
                    "A cycle for this salary month already exists for the current year.";
                }
              } else if (requestedAdditional !== null) {
                // Rule 2: Additional month must be unique across entire current year (independent of salary month)
                const addExists = cyclesThisYear.find((c) => {
                  const cAdd = c.additionalMonth != null && String(c.additionalMonth).trim() !== ""
                    ? String(c.additionalMonth).trim()
                    : null;
                  return cAdd === requestedAdditional;
                });
                if (addExists) {
                  errors.additionalMonth =
                    `Additional month ${requestedAdditional} already exists for the current year.`;
                }
              }
              return errors;
            }}
            onSubmit={(vals) => {
              // Only send additionalMonth when checkbox is checked; otherwise null
              const add = vals.hasAdditionalMonth
                ? (String(vals.additionalMonth ?? "").trim() || null)
                : null;
              onConfirm(vals.debitAccount, vals.salaryMonth, add);
              onClose();
            }}
          >
            {({ isSubmitting, values, errors, setFieldValue }) => (
              <Form>
                <AutoFillAdditionalMonth
                  enabled={values.hasAdditionalMonth}
                  cyclesThisYear={cyclesThisYear}
                  setFieldValue={setFieldValue}
                />
                <InputSelectCombo
                  name="debitAccount"
                  label="Debit Account"
                  options={options}
                  placeholder="Choose account…"
                />

                <InputSelectCombo
                  name="salaryMonth"
                  label="Salary Month"
                  options={[
                    { label: "يناير", value: "يناير" },
                    { label: "فبراير", value: "فبراير" },
                    { label: "مارس", value: "مارس" },
                    { label: "أبريل", value: "أبريل" },
                    { label: "مايو", value: "مايو" },
                    { label: "يونيو", value: "يونيو" },
                    { label: "يوليو", value: "يوليو" },
                    { label: "أغسطس", value: "أغسطس" },
                    { label: "سبتمبر", value: "سبتمبر" },
                    { label: "أكتوبر", value: "أكتوبر" },
                    { label: "نوفمبر", value: "نوفمبر" },
                    { label: "ديسمبر", value: "ديسمبر" },
                  ]}
                  placeholder="اختر الشهر"
                />

                <CheckboxWrapper name="hasAdditionalMonth" label="Additional Month" />

                {values.hasAdditionalMonth && (
                  <FormInputIcon
                    name="additionalMonth"
                    label="Additional Month (13-24)"
                    type="number"
                    placeholder="13 - 24"
                    textColor="text-gray-700"
                  />
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !values.debitAccount ||
                      !values.salaryMonth ||
                      !!errors.salaryMonth ||
                      (values.hasAdditionalMonth && !!errors.additionalMonth) ||
                      isSubmitting
                    }
                    className="rounded-md bg-info-dark px-4 py-2 text-sm font-medium text-white hover:bg-warning-light hover:text-info-dark disabled:cursor-not-allowed disabled:bg-info-main"
                  >
                    Confirm
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default SalariesModal;
