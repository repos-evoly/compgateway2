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

type ExtraProps = {
  viewOnly?: boolean;
  onSuccess?: () => void;
};

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

  /* ---------------- account list from cookie (FROM account) ------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  /* ---------------- beneficiaries mapped to TO account options ---------- */
  const [toAccountOptions, setToAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  const [commissionOnReceiver, setCommissionOnReceiver] = useState(false);

  useEffect(() => {
    const code = (Cookies.get("companyCode") ?? "").replace(/^"|"$/g, "");
    if (!code) return;

    (async () => {
      try {
        const info = await getCompannyInfoByCode(code);
        setCommissionOnReceiver(Boolean(info.commissionOnReceiver));
      } catch (err) {
        console.error("Failed to fetch company info:", err);
      }
    })();
  }, []);

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

  /* ---------------- economic sectors ------------------------------------ */
  const [sectorOptions, setSectorOptions] = useState<InputSelectComboOption[]>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getEconomicSectors(1, 10000);
        setSectorOptions(res.data.map((s) => ({ value: s.id, label: s.name })));
      } catch (err) {
        console.error("Fetch economic sectors failed:", err);
      }
    })();
  }, []);

  /* ---------------- beneficiaries -> build TO options ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getBeneficiaries(1, 1000);
        setToAccountOptions(
          res.data.map((b) => ({
            // VALUE IS THE ACCOUNT NUMBER so selecting fills "to" with account
            value: String(b.accountNumber),
            label: `${b.name} (${b.accountNumber})`,
          }))
        );
      } catch (err) {
        console.error("Fetch beneficiaries failed:", err);
      }
    })();
  }, []);

  /* ---------------- modal state (ignored in viewOnly) ------------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    formikData: ExtendedValues;
    additionalData?: AdditionalData;
    commissionAmount: number;
    commissionCurrency: string;
    displayAmount: number;
  } | null>(null);

  /* ---------------- values & schema ------------------------------------ */
  const defaults: ExtendedValues = {
    from: "",
    to: "",
    value: 0,
    description: "",
    commissionOnRecipient: false,
    transactionCategoryId: 2,
    economicSectorId: undefined,
  };

  const initialValues: ExtendedValues = {
    ...defaults,
    ...initialData,
    commissionOnRecipient: commissionOnReceiver,
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
  });

  /* ---------------- check TO account whenever it stabilizes ------------- */
  const ToAccountChecker = ({ toValue }: { toValue: string }) => {
    useEffect(() => {
      if (!toValue) {
        setToError(undefined);
        return;
      }
      // Debounce to avoid spamming the API while typing
      const timer = setTimeout(() => {
        void (async () => {
          try {
            const account = await checkAccount(toValue);
            setToError(undefined);
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
        })();
      }, 400);
      return () => clearTimeout(timer);
    }, [toValue]);

    return null;
  };

  /* -------- open confirmation modal (skipped in viewOnly) --------------- */
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

      const isB2B = transferType === "B2B";
      const pct = isB2B ? commResp.b2BCommissionPct : commResp.b2CCommissionPct;
      const fixed = isB2B ? commResp.b2BFixedFee : commResp.b2CFixedFee;

      const pctAmt = (pct * vals.value) / 100;
      const fee = Math.max(pctAmt, fixed);

      setModalData({
        formikData: vals,
        commissionAmount: fee,
        commissionCurrency: currencyDesc,
        displayAmount: commissionOnReceiver ? vals.value : vals.value + fee,
      });
      setModalOpen(true);
    } catch (err) {
      console.error("Modal prep failed:", err);
    }
  };

  /* -------- confirm create (no-op in viewOnly) -------------------------- */
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
      setAlertTitle(t("createErrorTitle"));
      setAlertMessage(msg);
      setAlertOpen(true);
    } finally {
      setModalOpen(false);
    }
  };

  /* --------------------------- JSX ------------------------------------- */
  return (
    <div className="p-2">
      <Formik<ExtendedValues>
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values }) => {
          return (
            <>
              <ToAccountChecker toValue={values.to} />
              <Form>
                <FormHeader
                  showBackButton
                  fallbackPath="/transfers/internal"
                  isEditing={true}
                />

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

                  {/* TO account as InputSelectCombo:
                      - You can select a beneficiary (value = account no.)
                      - Or type an account manually */}
                  <InputSelectCombo
                    name="to"
                    label={t("to")}
                    options={toAccountOptions}
                    disabled={fieldsDisabled}
                    maskingFormat="0000-000000-000"
                    placeholder={t("selectOrTypeToAccount", {
                      defaultValue: "Select beneficiary or type account",
                    })}
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
                      disabled={!!toError}
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
