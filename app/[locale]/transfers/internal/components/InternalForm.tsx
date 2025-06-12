// app/[locale]/internalTransfer/components/InternalForm.tsx
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { Formik, Form, useFormikContext } from "formik";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { getTransfersCommision, createTransfer } from "../services";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import ResetButton from "@/app/components/FormUI/ResetButton";
import ContinueButton from "./ContinueButton";
import EditButton from "@/app/components/FormUI/EditButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import ConfirmInfoModal from "./ConfirmInfoModal";

import type {
  InternalFormProps,
  InternalFormValues,
  AdditionalData,
} from "../types";

/* -------------------------------------------------------------------------- */
/*                               Helper                                       */
/* -------------------------------------------------------------------------- */

const FormValidator = () => {
  const { values, setFieldError, validateForm } =
    useFormikContext<ExtendedValues>();

  useEffect(() => {
    const { from, to } = values;

    if (!from || !to) return;

    if (from.slice(-3) !== to.slice(-3)) {
      setFieldError("from", "Currency codes must match");
      setFieldError("to", "Currency codes must match");
    } else {
      validateForm();
    }
  }, [values, setFieldError, validateForm]);

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */

type ExtendedValues = InternalFormValues & {
  commissionOnRecipient: boolean;
  transactionCategoryId?: number;
};

interface ExtraProps {
  /** When true form is read-only; no buttons or modal */
  viewOnly?: boolean;
  /** Callback fired after a successful create */
  onSuccess?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

function InternalForm({
  initialData,
  onSubmit,
  viewOnly = false,
  onSuccess,
}: InternalFormProps & ExtraProps) {
  const t = useTranslations("internalTransferForm");

  const isNew = !initialData || Object.keys(initialData).length === 0;
  const [fieldsDisabled, setFieldsDisabled] = useState(viewOnly || !isNew);

  /* ---------------- account list from cookie ---------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  useEffect(() => {
    const rawCookie = Cookies.get("statementAccounts") ?? "[]";
    let accounts: string[] = [];

    try {
      accounts = JSON.parse(rawCookie);
    } catch {
      try {
        accounts = JSON.parse(decodeURIComponent(rawCookie));
      } catch {
        accounts = [];
      }
    }

    setAccountOptions(accounts.map((a) => ({ label: a, value: a })));
  }, []);

  /* ---------------- modal state (ignored in viewOnly) -------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    formikData: ExtendedValues;
    additionalData?: AdditionalData;
    commissionAmount: number;
    commissionCurrency: string;
  } | null>(null);

  /* ---------------- values & schema ------------------------- */
  const defaults: ExtendedValues = {
    from: "",
    to: "",
    value: 0,
    description: "",
    commissionOnRecipient: false,
    transactionCategoryId: 1,
  };
  const initialValues: ExtendedValues = { ...defaults, ...initialData };

  const schema = Yup.object({
    from: Yup.string().required(t("requiredFromAccount")),
    to: Yup.string()
      .required(t("requiredToAccount"))
      .test("match", t("currencyMismatch"), function (v) {
        const f = (this.parent as ExtendedValues).from;
        return !f || !v || f.slice(-3) === v.slice(-3);
      }),
    value: Yup.number()
      .typeError(t("valueMustBeNumber"))
      .required(t("requiredValue"))
      .positive(t("valueMustBePositive")),
    description: Yup.string().required(t("requiredDescription")),
    commissionOnRecipient: Yup.boolean().required(),
    transactionCategoryId: Yup.number().required(),
  });

  /* -------- open confirmation modal (skipped in viewOnly) --- */
  const openModal = async (vals: ExtendedValues) => {
    if (viewOnly) return;

    try {
      const currencyCode = vals.from.slice(-3);
      const currResp = await getCurrencies(1, 1, currencyCode, "code");
      const currencyId = currResp.data[0]?.id ?? 0;
      const currencyDesc = currResp.data[0]?.description ?? currencyCode;

      const servicePackageId = Number(Cookies.get("servicePackageId") ?? 0);
      const commResp = await getTransfersCommision(
        servicePackageId,
        vals.transactionCategoryId ?? 1,
        currencyId
      );

      const pctAmt = (commResp.commissionPct * vals.value) / 100;
      const fee = Math.max(pctAmt, commResp.feeFixed);

      setModalData({
        formikData: vals,
        commissionAmount: fee,
        commissionCurrency: currencyDesc,
      });
      setModalOpen(true);
    } catch (err) {
      console.error("Modal prep failed:", err);
    }
  };

  /* -------- confirm create (no-op in viewOnly) ------------ */
  const confirmModal = async () => {
    if (!modalData) return;
    const {
      from,
      to,
      value,
      description,
      commissionOnRecipient,
      transactionCategoryId,
    } = modalData.formikData;

    try {
      const currencyId = Number(from.slice(-3));
      await createTransfer({
        transactionCategoryId,
        fromAccount: from,
        toAccount: to,
        amount: value,
        currencyId,
        description,
        commissionOnRecipient,
      });
      onSubmit?.(modalData.formikData);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setModalOpen(false);
    }
  };

  /* --------------------------- JSX ------------------------- */
  return (
    <div className="p-6">
      <Formik<ExtendedValues>
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values }) => (
          <Form>
            <FormValidator />

            {/* Row 1 */}
            <div className="grid gap-4 md:grid-cols-3">
              <InputSelectCombo
                name="from"
                label={t("from")}
                options={accountOptions}
                disabled={fieldsDisabled}
                maskingFormat="0000-000000-000"
              />
              <FormInputIcon
                name="to"
                label={t("to")}
                maskingFormat="0000-000000-000"
                disabled={fieldsDisabled}
              />
              <FormInputIcon
                name="value"
                label={t("value")}
                type="number"
                disabled={fieldsDisabled}
              />
            </div>

            {/* Row 2 */}
            <div className="mt-4">
              <FormInputIcon
                name="description"
                label={t("description")}
                disabled={fieldsDisabled}
              />
            </div>

            {/* Row 3 */}
            <div className="mt-4">
              <RadiobuttonWrapper
                name="commissionOnRecipient"
                label={t("commissionPaidBy")}
                options={[
                  { value: false, label: t("sender") },
                  { value: true, label: t("recipient") },
                ]}
                disabled={fieldsDisabled}
                flexDir={["row", "row"]}
              />
            </div>

            {/* Buttons – hide in viewOnly */}
            {!viewOnly && (
              <div className="mt-6 flex justify-center gap-4">
                {!isNew && (
                  <>
                    <EditButton
                      fieldsDisabled={fieldsDisabled}
                      setFieldsDisabled={setFieldsDisabled}
                    />
                    <ResetButton
                      title={t("delete")}
                      Icon={FaTrash}
                      color="warning-light"
                    />
                  </>
                )}
                <ContinueButton
                  onClick={() => openModal(values)}
                  touchedFields={{
                    from: true,
                    to: true,
                    value: true,
                    description: true,
                    commissionOnRecipient: true,
                    transactionCategoryId: true,
                  }}
                />
              </div>
            )}
          </Form>
        )}
      </Formik>

      {/* Modal – disabled in viewOnly */}
      {modalData && !viewOnly && (
        <ConfirmInfoModal
          isOpen={modalOpen}
          formData={modalData.formikData}
          commissionAmount={modalData.commissionAmount}
          commissionCurrency={modalData.commissionCurrency}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmModal}
        />
      )}
    </div>
  );
}

export default InternalForm;
