/* ==========================================================================
   components/SalariesModal.tsx
   – Pick a debit account **and salary month**, then hand both back
     to the parent (which performs the submitSalaryCycle API call).
   – Strict TypeScript. Copy-paste ready.
   ========================================================================== */
"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import Cookies from "js-cookie";

import InputSelectCombo, {
  type InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue"; // ⬅️ date picker
import { CheckAccount, type AccountInfo } from "@/app/helpers/checkAccount";

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
  onConfirm: (debitAccount: string, salaryMonthISO: string) => void;
};

const SalariesModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [options, setOptions] = useState<InputSelectComboOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ───────── fetch accounts when opened ───────── */
  useEffect(() => {
    if (!isOpen) return;

    const fetchAccounts = async (): Promise<void> => {
      try {
        setLoading(true);
        setFetchError(null);

        const companyCode = getCompanyCode();
        if (!companyCode) throw new Error("Company code not found.");

        const accounts = await CheckAccount(companyCode);
        const filtered = accounts.filter(
          (acc: AccountInfo) => acc.currency === "LYD"
        );

        const opts = filtered.map<InputSelectComboOption>((acc) => ({
          label: `${acc.accountString} - ${acc.accountName}`,
          value: acc.accountString,
        }));
        setOptions(opts);
      } catch (err: unknown) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch accounts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-black">
          {/** modal title */}
          Select Debit Account & Salary Month
        </h2>

        {loading && <p className="text-sm">Loading accounts…</p>}
        {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}

        {!loading && !fetchError && (
          <Formik
            initialValues={{
              debitAccount: "",
              salaryMonth: new Date().toISOString().split("T")[0], // today
            }}
            onSubmit={(vals) => {
              onConfirm(vals.debitAccount, vals.salaryMonth);
              onClose();
            }}
          >
            {({ isSubmitting, values }) => (
              <Form>
                <InputSelectCombo
                  name="debitAccount"
                  label="Debit Account"
                  options={options}
                  placeholder="Choose account…"
                />

                <DatePickerValue
                  name="salaryMonth"
                  label="Salary Month"
                  width="w-full"
                  textColor="text-gray-700"
                />

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
