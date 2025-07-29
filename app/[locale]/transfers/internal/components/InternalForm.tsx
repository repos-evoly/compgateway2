// app/[locale]/internalTransfer/components/InternalForm.tsx
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { Formik, Form, useFormikContext } from "formik";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import {
  getTransfersCommision,
  createTransfer,
  getEconomicSectors,
  checkAccount,
} from "../services";
import { getBeneficiaries } from "@/app/[locale]/beneficiaries/services";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import ResetButton from "@/app/components/FormUI/ResetButton";
import ContinueButton from "./ContinueButton";
import EditButton from "@/app/components/FormUI/EditButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import ConfirmInfoModal from "./ConfirmInfoModal";

import type {
  InternalFormProps,
  InternalFormValues,
  AdditionalData,
} from "../types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { getCompannyInfoByCode } from "@/app/[locale]/profile/services";
import FormHeader from "@/app/components/reusable/FormHeader";

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
  const [toError, setToError] = useState<string | undefined>(undefined);
  const [transferType, setTransferType] = useState<string>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  /* ---------------- account list from cookie ---------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  const [commissionOnReceiver, setCommissionOnReceiver] = useState(false);

  useEffect(() => {
    const code = (Cookies.get("companyCode") ?? "").replace(/^"|"$/g, "");
    if (!code) return;

    (async () => {
      try {
        const info = await getCompannyInfoByCode(code);
        setCommissionOnReceiver(info.commissionOnReceiver!);
      } catch (err) {
        console.error("Failed to fetch company info:", err);
      }
    })();
  }, []);

  console.log("Commission on receiver:", commissionOnReceiver);

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
    displayAmount: number;
  } | null>(null);

  const [sectorOptions, setSectorOptions] = useState<InputSelectComboOption[]>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getEconomicSectors(1, 10000); // limit 10 000
        setSectorOptions(res.data.map((s) => ({ value: s.id, label: s.name })));
      } catch (err) {
        console.error("Fetch economic sectors failed:", err);
      }
    })();
  }, []);

  /* ---------------- beneficiary options ------------------------- */
  const [beneficiaryOptions, setBeneficiaryOptions] = useState<
    InputSelectComboOption[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBeneficiaries(1, 1000); // Get all beneficiaries
        setBeneficiaryOptions(
          res.data.map((b) => ({
            value: b.id,
            label: `${b.name} (${b.accountNumber})`,
          }))
        );
      } catch (err) {
        console.error("Fetch beneficiaries failed:", err);
      }
    })();
  }, []);

  /* ---------------- values & schema ------------------------- */
  const defaults: ExtendedValues = {
    from: "",
    to: "",
    value: 0,
    description: "",
    commissionOnRecipient: false,
    transactionCategoryId: 2,
    economicSectorId: undefined, // ⬅️ new
    beneficiaryId: undefined, // ⬅️ new
  };
  const initialValues: ExtendedValues = {
    ...defaults,
    ...initialData,
    commissionOnRecipient: commissionOnReceiver, // controlled, never shown
  };

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
    transactionCategoryId: Yup.number().required(),
    economicSectorId: Yup.number().required(t("requiredEconomicSector")),
    beneficiaryId: Yup.number().optional(), // Beneficiary is optional
  });

  /* -------- open confirmation modal (skipped in viewOnly) --- */
  const openModal = async (vals: ExtendedValues) => {
    if (viewOnly) return;

    try {
      const currencyCode = vals.from.slice(-3);
      const currResp = await getCurrencies(1, 1, currencyCode, "code");
      const currencyDesc = currResp.data[0]?.description ?? currencyCode;

      const servicePackageId = Number(Cookies.get("servicePackageId") ?? 0);
      const commResp = await getTransfersCommision(
        servicePackageId,
        vals.transactionCategoryId ?? 2
      );

      console.log("Commission response:", commResp);

      const isB2B = transferType === "B2B";
      const pct = isB2B ? commResp.b2BCommissionPct : commResp.b2CCommissionPct;
      const fixed = isB2B ? commResp.b2BFixedFee : commResp.b2CFixedFee;

      /* calculate final fee */
      const pctAmt = (pct * vals.value) / 100;
      const fee = Math.max(pctAmt, fixed);

      setModalData({
        formikData: vals,
        commissionAmount: fee,
        commissionCurrency: currencyDesc,

        // NEW → what the user should see on top of the modal
        displayAmount: commissionOnReceiver ? vals.value : vals.value + fee,
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
      transactionCategoryId,
      economicSectorId,
    } = modalData.formikData;

    try {
      const currencyId = Number(from.slice(-3));
      await createTransfer({
        transactionCategoryId,
        economicSectorId,
        fromAccount: from,
        toAccount: to,
        amount: value,
        currencyId,
        description,
      });
      onSubmit?.(modalData.formikData);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setAlertTitle(t("createErrorTitle")); // e.g. "Creation Error"
      setAlertMessage(msg);
      setAlertOpen(true);
    } finally {
      setModalOpen(false);
    }
  };

  const handleCheckAccount = async (value: string) => {
    try {
      const account = await checkAccount(value);
      setToError(undefined); // clear any old error

      setTransferType(account[0].transferType);
      console.log("Account check successful:", account);
    } catch (err: unknown) {
      console.error("Account check failed:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        setToError((err as { message: string }).message);
      } else {
        setToError(t("accountNotFound"));
      }
    }
  };

  const handleBeneficiaryChange = (
    beneficiaryId: number,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const selectedBeneficiary = beneficiaryOptions.find(
      (b) => b.value === beneficiaryId
    );
    if (selectedBeneficiary) {
      // Extract account number from the label (format: "Name (AccountNumber)")
      const accountNumber = selectedBeneficiary.label.match(/\(([^)]+)\)/)?.[1];
      if (accountNumber) {
        setFieldValue("to", accountNumber);
      }
    }
  };

  const FormSyncBeneficiary = ({ values, setFieldValue }: { values: ExtendedValues, setFieldValue: (field: string, value: unknown) => void }) => {
    useEffect(() => {
      if (values.beneficiaryId) {
        handleBeneficiaryChange(values.beneficiaryId, setFieldValue);
      }
    }, [values.beneficiaryId, setFieldValue]);
    return null;
  };

  /* --------------------------- JSX ------------------------- */
  return (
    <div className="p-2">
      <Formik<ExtendedValues>
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values, setFieldValue }) => {
          return (
            <>
              <FormSyncBeneficiary values={values} setFieldValue={setFieldValue} />
              <Form>
                <FormHeader showBackButton fallbackPath="/transfers/internal" />

                <FormValidator />

                {/* Row 1 */}
                <div className="grid gap-4 md:grid-cols-3 mt-4">
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
                    onBlurAdditional={handleCheckAccount}
                    errorMessage={toError}
                  />
                  <FormInputIcon
                    name="value"
                    label={t("value")}
                    type="number"
                    disabled={fieldsDisabled}
                  />
                </div>
                <InputSelectCombo
                  name="economicSectorId"
                  label={t("economicSector")}
                  options={sectorOptions}
                  disabled={fieldsDisabled}
                />

                {/* Beneficiary Selection */}
                <InputSelectCombo
                  name="beneficiaryId"
                  label={t("beneficiary")}
                  options={beneficiaryOptions}
                  disabled={fieldsDisabled}
                  placeholder={t("selectBeneficiary")}
                />

                {/* Row 2 */}
                <div className="mt-4">
                  <FormInputIcon
                    name="description"
                    label={t("description")}
                    disabled={fieldsDisabled}
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
                        transactionCategoryId: true,
                      }}
                      disabled={!!toError} // ⬅️ block submit if error
                    />
                  </div>
                )}
              </Form>
            </>
          );
        }}
      </Formik>

      {/* Modal – disabled in viewOnly */}
      {modalData && !viewOnly && (
        <ConfirmInfoModal
          isOpen={modalOpen}
          formData={modalData.formikData}
          commissionAmount={modalData.commissionAmount}
          commissionCurrency={modalData.commissionCurrency}
          displayAmount={modalData.displayAmount}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmModal}
        />
      )}

      <ErrorOrSuccessModal
        isOpen={alertOpen}
        isSuccess={false}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => setAlertOpen(false)}
      />
    </div>
  );
}

export default InternalForm;
