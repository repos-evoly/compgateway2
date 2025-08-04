/* --------------------------------------------------------------------------
 * app/[locale]/requests/checkbook/components/CheckbookForm.tsx
 * • Account Number uses <InputSelectCombo> (cookie-based options).
 * • representativeId uses <InputSelectCombo> fed by Representatives API.
 * • On account selection, extracts the middle 6-digit code, calls KYC API,
 *   and auto-fills fullName / address / branch.
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations, useLocale } from "next-intl";
import * as Yup from "yup";
import { useFormikContext } from "formik";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane, FaEdit } from "react-icons/fa";
import Description from "@/app/components/FormUI/Description";

import { createCheckbookRequest } from "../services";
import { TCheckbookFormProps, TCheckbookFormValues } from "../types";

import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

/* Representatives query --------------------------------------------------- */
import { getRepresentatives } from "@/app/[locale]/representatives/services";
import { TKycResponse } from "@/app/auth/register/types";
import { getKycByCode } from "@/app/auth/register/services";

/* -------------------------------- Types --------------------------------- */
interface UpdatedCheckbookFormProps extends TCheckbookFormProps {
  isSubmitting?: boolean;
}

/* ======================================================================== */
const CheckbookForm: React.FC<UpdatedCheckbookFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  readOnly = false,
  isSubmitting: externalIsSubmitting = false,
}) => {
  const t = useTranslations("checkForm");
  const locale = useLocale();

  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [representativeOptions, setRepresentativeOptions] = useState<
    InputSelectComboOption[]
  >([]);

  /* Determine mode ---------------------------------------------------- */
  const isEditMode = Boolean(initialData);

  /* ------------------------------------------------------------------ */
  /* Effects                                                             */
  /* ------------------------------------------------------------------ */
  /* 1 ▸ Load saved account numbers from cookie ------------------------ */
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let accounts: string[] = [];

    try {
      accounts = JSON.parse(raw);
    } catch {
      try {
        accounts = JSON.parse(decodeURIComponent(raw));
      } catch {
        accounts = [];
      }
    }

    setAccountOptions(accounts.map((acc) => ({ label: acc, value: acc })));
  }, []);

  /* 2 ▸ Load Representatives list ------------------------------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const reps = await getRepresentatives(1, 10_000);
        if (!mounted) return;

        const opts = reps.data.map((rep) => ({
          label: rep.name || `#${rep.id}`,
          value: rep.id.toString(),
        }));
        setRepresentativeOptions(opts);
      } catch (error) {
        console.error("Failed to fetch representatives:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Form values & validation                                            */
  /* ------------------------------------------------------------------ */
  const defaultValues: TCheckbookFormValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    representativeId: "",
    branch: "",
    date: "",
    bookContaining: "",
  };

  const initialValues: TCheckbookFormValues = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;

  const schema = Yup.object({
    fullName: Yup.string().required(`${t("name")} ${t("required")}`),
    address: Yup.string().required(`${t("address")} ${t("required")}`),
    accountNumber: Yup.string().required(`${t("accNum")} ${t("required")}`),
    representativeId: Yup.string().required(`${t("sendTo")} ${t("required")}`),
    branch: Yup.string().required(`${t("branch")} ${t("required")}`),
    date: Yup.string().required(`${t("date")} ${t("required")}`),
    bookContaining: Yup.string().required(t("selectOneOption")),
  });

  /* ------------------------------------------------------------------ */
  /* Submit / cancel                                                     */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (values: TCheckbookFormValues): Promise<void> => {
    if (readOnly || isSubmitting || externalIsSubmitting) return;

    if (isEditMode) {
      onSubmit(values);
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = await createCheckbookRequest(values);
      onSubmit(newItem);

      setModalTitle(t("successTitle"));
      setModalMessage(t("successMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  /* ------------------------------------------------------------------ */
  /* KYC auto-fill (inside Formik)                                       */
  /* ------------------------------------------------------------------ */
  const KycAutoFill: React.FC = () => {
    const { values, setFieldValue } = useFormikContext<TCheckbookFormValues>();

    /* Ref to avoid duplicate fetches for the same code */
    const lastCodeRef = useRef<string | null>(null);

    useEffect(() => {
      const acc = values.accountNumber?.trim() ?? "";
      if (!acc) return;

      /* Extract middle 6 digits, whether masked or not */
      const match = acc.match(/^\d{4}-?(\d{6})-?\d{3}$/);
      if (!match) return;

      const code = match[1];
      if (code.length !== 6 || code === lastCodeRef.current) return;

      let cancelled = false;
      (async () => {
        try {
          const kyc: TKycResponse = await getKycByCode(code);
          if (cancelled || !kyc.hasKyc || !kyc.data) return;

          lastCodeRef.current = code;

          const {
            legalCompanyName,
            legalCompanyNameLT,
            branchName,
            street,
            district,
            buildingNumber,
            city,
          } = kyc.data;

          const name = locale === "ar" ? legalCompanyName : legalCompanyNameLT;
          const addressParts = [street, district, buildingNumber, city].filter(
            Boolean
          );

          setFieldValue("fullName", name);
          setFieldValue("address", addressParts.join(" "));
          setFieldValue("branch", branchName);
        } catch (error) {
          console.error("Failed to fetch KYC:", error);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [values.accountNumber, setFieldValue]);

    return null;
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  const status =
    (initialData as { status?: string } | undefined)?.status ?? undefined;

  const submitButtonDisabled = isSubmitting || externalIsSubmitting;

  return (
    <>
      <div className="mt-2 w-full rounded bg-gray-100">
        {/* ---------- Header ---------- */}
        <FormHeader status={status}>
          <BackButton
            fallbackPath="/requests/checkbook"
            isEditing={true}
          />
        </FormHeader>

        {/* ---------- Form body ---------- */}
        <div className="px-6 pb-6">
          <Form
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {/* Side-effect component for KYC auto-fill */}
            <KycAutoFill />

            {/* Inputs grid ------------------------------------------------ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Account Number */}
              <InputSelectCombo
                name="accountNumber"
                label={t("accNum")}
                options={accountOptions}
                placeholder={t("accNum")}
                width="w-full"
                maskingFormat="0000-000000-000"
                disabled={readOnly}
              />

              {/* Representative selector */}
              <InputSelectCombo
                name="representativeId"
                label={t("sendTo")}
                options={representativeOptions}
                placeholder={t("sendTo")}
                width="w-full"
                disabled={readOnly}
              />

              {/* Free-text fields */}
              {[
                { name: "fullName", label: t("name") },
                { name: "address", label: t("address") },
                { name: "branch", label: t("branch") },
              ].map(({ name, label }) => (
                <FormInputIcon
                  key={name}
                  name={name}
                  label={label}
                  type="text"
                  width="w-full"
                  disabled={readOnly}
                />
              ))}

              {/* Date */}
              <DatePickerValue
                name="date"
                label={t("date")}
                disabled={readOnly}
              />
            </div>

            {/* Radio */}
            <div className="mt-4">
              <RadiobuttonWrapper
                name="bookContaining"
                label={t("book")}
                options={[
                  { value: "24", label: "24" },
                  { value: "48", label: "48" },
                ]}
                t={(key) => key}
                disabled={readOnly}
              />
            </div>

            {/* Agreement */}
            <Description variant="h1" className="m-auto mt-4 text-black">
              {t("agree")}
            </Description>

            {/* Actions */}
            {!readOnly && (
              <div className="mt-4 flex justify-center gap-3">
                <SubmitButton
                  title={t("submit")}
                  Icon={isEditMode ? FaEdit : FaPaperPlane}
                  color="info-dark"
                  disabled={submitButtonDisabled}
                  fullWidth={false}
                />

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
                  disabled={submitButtonDisabled}
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </Form>
        </div>
      </div>

      {/* ---------- Modal (create mode only) ---------- */}
      {!isEditMode && (
        <ErrorOrSuccessModal
          isOpen={modalOpen}
          isSuccess={modalSuccess}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
          onConfirm={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
/* ======================================================================== */
export default CheckbookForm;
