"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClipboard, FiX } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import type { CompanyEmployee } from "../../users/types";
import { createActivationCode } from "../services";
import type { ActivationCodeResult } from "../types";

type Props = {
  isOpen: boolean;
  employees: CompanyEmployee[];
  initialEmployee?: CompanyEmployee | null;
  onClose: () => void;
};

const employeeLogin = (employee?: CompanyEmployee): string =>
  employee?.email?.trim() || employee?.username?.trim() || "";

const employeeLabel = (employee: CompanyEmployee): string => {
  const fullName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  return `${fullName || employee.username || employee.authUserId} (${employeeLogin(employee) || employee.authUserId})`;
};

export default function ActivationCodeModal({
  isOpen,
  employees,
  initialEmployee,
  onClose,
}: Props) {
  const t = useTranslations("mobileAccess");
  const locale = useLocale();
  const [selectedAuthUserId, setSelectedAuthUserId] = useState(0);
  const [login, setLogin] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(30);
  const [result, setResult] = useState<ActivationCodeResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectableEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive !== false),
    [employees]
  );

  useEffect(() => {
    if (!isOpen) return;
    const selected = initialEmployee ?? selectableEmployees[0];
    setSelectedAuthUserId(selected?.authUserId ?? 0);
    setLogin(employeeLogin(selected));
    setExpiresInMinutes(30);
    setResult(null);
    setError("");
    setCopied(false);
  }, [initialEmployee, isOpen, selectableEmployees]);

  if (!isOpen) return null;

  const handleEmployeeChange = (authUserId: number) => {
    const selected = selectableEmployees.find(
      (employee) => employee.authUserId === authUserId
    );
    setSelectedAuthUserId(authUserId);
    setLogin(employeeLogin(selected));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAuthUserId || !login.trim()) {
      setError(t("validation.userAndLoginRequired"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      setResult(
        await createActivationCode({
          targetAuthUserId: selectedAuthUserId,
          login: login.trim(),
          expiresInMinutes,
        })
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("errors.generate")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.activationCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activation-code-title"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="activation-code-title" className="text-xl font-bold text-gray-800">
              {t("activation.title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("activation.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={t("close")}
          >
            <FiX size={22} />
          </button>
        </div>

        {result ? (
          <div className="space-y-5 text-center">
            <FiCheckCircle className="mx-auto text-green-500" size={52} />
            <div>
              <p className="font-semibold text-gray-800">{t("activation.generated")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("activation.oneTimeNotice")}</p>
            </div>
            <div className="rounded-lg border border-dashed border-info-dark bg-gray-50 p-4">
              <code className="break-all text-lg font-bold tracking-wider text-info-dark">
                {result.activationCode}
              </code>
            </div>
            <p className="text-sm text-gray-600">
              {t("activation.expiresAt", {
                date: new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(result.expiresAt)),
              })}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-info-dark px-5 py-2.5 font-medium text-white hover:bg-warning-light hover:text-info-dark"
              >
                <FiClipboard />
                {copied ? t("activation.copied") : t("activation.copy")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="activation-user" className="mb-1 block text-sm font-medium text-gray-700">
                {t("activation.user")}
              </label>
              <select
                id="activation-user"
                value={selectedAuthUserId}
                onChange={(event) => handleEmployeeChange(Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:border-info-dark focus:outline-none focus:ring-1 focus:ring-info-dark"
                required
              >
                <option value={0}>{t("activation.selectUser")}</option>
                {selectableEmployees.map((employee) => (
                  <option key={employee.authUserId} value={employee.authUserId}>
                    {employeeLabel(employee)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="activation-login" className="mb-1 block text-sm font-medium text-gray-700">
                {t("activation.login")}
              </label>
              <input
                id="activation-login"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-info-dark focus:outline-none focus:ring-1 focus:ring-info-dark"
                maxLength={256}
                required
              />
              <p className="mt-1 text-xs text-gray-500">{t("activation.loginHint")}</p>
            </div>

            <div>
              <label htmlFor="activation-expiry" className="mb-1 block text-sm font-medium text-gray-700">
                {t("activation.expiry")}
              </label>
              <input
                id="activation-expiry"
                type="number"
                min={5}
                max={1440}
                value={expiresInMinutes}
                onChange={(event) => setExpiresInMinutes(Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-info-dark focus:outline-none focus:ring-1 focus:ring-info-dark"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting || selectableEmployees.length === 0}
                className="rounded-md bg-info-dark px-5 py-2.5 font-medium text-white hover:bg-warning-light hover:text-info-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("activation.generating") : t("activation.generate")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
