// app/[locale]/transfers/internal/components/InternalForm.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { Formik, Form, useFormikContext } from "formik";

import {
  getTransfersCommision,
  createTransfer,
  checkAccount, // used to fetch names for FROM/TO
  getEconomicSectors,
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
import { postTransfer } from "../services";



/* -------------------------------------------------------------------------- */
/*                               Helper                                       */
/* -------------------------------------------------------------------------- */

type FormValidatorProps = {
  fromInfo: AccountLookup | null;
  toInfo: AccountLookup | null;
  currencyMismatch: boolean;
  setCurrencyMismatch: (value: boolean) => void;
  mismatchMessage: string;
};

const FormValidator = ({
  fromInfo,
  toInfo,
  currencyMismatch,
  setCurrencyMismatch,
  mismatchMessage,
}: FormValidatorProps) => {
  const { values, setFieldError, errors } = useFormikContext<ExtendedValues>();
  const { from, to } = values;

  useEffect(() => {
    if (!from || !to) {
      if (currencyMismatch) {
        setCurrencyMismatch(false);
        if (errors.from === mismatchMessage) {
          setFieldError("from", undefined);
        }
        if (errors.to === mismatchMessage) {
          setFieldError("to", undefined);
        }
      }
      return;
    }

    const fromCurrency = fromInfo?.currency?.trim();
    const toCurrency = toInfo?.currency?.trim();

    if (!fromCurrency || !toCurrency) {
      if (currencyMismatch) {
        setCurrencyMismatch(false);
        if (errors.from === mismatchMessage) {
          setFieldError("from", undefined);
        }
        if (errors.to === mismatchMessage) {
          setFieldError("to", undefined);
        }
      }
      return;
    }

    if (fromCurrency !== toCurrency) {
      if (!currencyMismatch) {
        setCurrencyMismatch(true);
      }
      setFieldError("from", mismatchMessage);
      setFieldError("to", mismatchMessage);
    } else if (currencyMismatch) {
      setCurrencyMismatch(false);
      if (errors.from === mismatchMessage) {
        setFieldError("from", undefined);
      }
      if (errors.to === mismatchMessage) {
        setFieldError("to", undefined);
      }
    }
  }, [
    from,
    to,
    fromInfo?.currency,
    toInfo?.currency,
    currencyMismatch,
    setCurrencyMismatch,
    mismatchMessage,
    setFieldError,
    errors.from,
    errors.to,
  ]);

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

type AccountLookup = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
  transferType?: string;
  companyName?: string;
  branchCode?: string;
  branchName?: string;
  accountName?: string;
  currency?: string;
};

const getCompanyCodeFromCookie = (): string | undefined => {
  const raw = Cookies.get("companyCode");
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw).replace(/^"|"$/g, "");
  } catch {
    return raw.replace(/^"|"$/g, "");
  }
};

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

function InternalForm({
  initialData,
  onSubmit,
  viewOnly = false,
  onSuccess,
  transferId,
  canPostTransfer,
}: InternalFormProps & ExtraProps) {
  const t = useTranslations("internalTransferForm");
  const locale = useLocale();
  const router = useRouter();

  const isNew = !initialData || Object.keys(initialData).length === 0;
  const [fieldsDisabled, setFieldsDisabled] = useState(viewOnly || !isNew);
  const [toError, setToError] = useState<string | undefined>(undefined);
  const [transferType, setTransferType] = useState<string>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [fromAccountInfo, setFromAccountInfo] = useState<AccountLookup | null>(
    null
  );
  const [toAccountInfo, setToAccountInfo] = useState<AccountLookup | null>(
    null
  );
  const [currencyMismatch, setCurrencyMismatch] = useState(false);

  /* ---------------- account list via checkAccount (FROM account) -------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  /* ---------------- beneficiaries mapped to TO account options ---------- */
  const [toAccountOptions, setToAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  const [commissionOnReceiver, setCommissionOnReceiver] = useState(false);

  const accountInfoCache = useRef(new Map<string, AccountLookup | null>());

  const actionLabel = isNew
    ? t("createTransfer", { defaultValue: "Create transfer" })
    : canPostTransfer
      ? t("confirmTransfer", { defaultValue: "Confirm transfer" }) : '';

  const resolveAccountInfo = useCallback(
    async (accountNumber: string): Promise<AccountLookup | null> => {
      const normalized = (accountNumber ?? "").replace(/\s+/g, "").trim();
      if (!normalized) return null;

      if (accountInfoCache.current.has(normalized)) {
        const cached = accountInfoCache.current.get(normalized) ?? null;
        return cached;
      }

      const response = (await checkAccount(normalized)) as AccountLookup[];
      const info = response?.[0] ?? null;
      accountInfoCache.current.set(normalized, info);
      return info;
    },
    []
  );

  const ACCOUNT_LOOKUP_DEBOUNCE = 400;

  useEffect(() => {
    const code = getCompanyCodeFromCookie();
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
    const code = getCompanyCodeFromCookie();
    if (!code) return;

    (async () => {
      try {
        const accounts = (await checkAccount(code)) as AccountLookup[];
        const seen = new Set<string>();
        accounts.forEach((acc) => {
          if (acc?.accountString) {
            accountInfoCache.current.set(acc.accountString, acc);
          }
        });
        const options = accounts
          .filter((acc) => {
            if (!acc?.accountString) return false;
            if (seen.has(acc.accountString)) return false;
            seen.add(acc.accountString);
            return true;
          })
          .map((acc) => {
            const displayName =
              acc.accountName || acc.companyName || acc.branchName || "";
            const label = displayName
              ? `${acc.accountString} - ${displayName}`
              : acc.accountString;
            return { label, value: acc.accountString };
          });

        setAccountOptions(options);
      } catch (err) {
        console.error("Failed to fetch debit accounts:", err);
        setAccountOptions([]);
      }
    })();
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
    fromCompanyName?: string;
    toCompanyName?: string;
    currencyDesc: string;
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
    to: Yup.string().required(t("requiredToAccount")),
    value: Yup.number()
      .typeError(t("valueMustBeNumber"))
      .required(t("requiredValue"))
      .positive(t("valueMustBePositive")),
    description: Yup.string().required(t("requiredDescription")),
    transactionCategoryId: Yup.number().required(),
    economicSectorId: Yup.number().required(t("requiredEconomicSector")),
  });

  /* ---------------- check TO account whenever it stabilizes ------------- */
  // Keep a stable reference to the translation function to avoid adding `t`
  // to the dependency array (satisfies react-hooks/exhaustive-deps).
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const ToAccountChecker = ({ toValue }: { toValue: string }) => {
    const { setFieldError } = useFormikContext<ExtendedValues>();

    useEffect(() => {
      if (!toValue) {
        setToError(undefined);
        setToAccountInfo(null);
        setTransferType(undefined);
        return;
      }

      const timer = setTimeout(() => {
        void (async () => {
          try {
            const info = await resolveAccountInfo(toValue);
            if (!info) {
              const message = tRef.current("accountNotFound");
              setToError(message);
              setToAccountInfo(null);
              setTransferType(undefined);
              setFieldError("to", message);
              return;
            }

            setToError(undefined);
            setToAccountInfo(info);
            setTransferType(info.transferType);
            setFieldError("to", undefined);
          } catch (err: unknown) {
            console.error("Account check failed:", err);
            const message =
              err instanceof Error &&
                typeof err.message === "string" &&
                err.message
                ? err.message
                : tRef.current("accountNotFound");
            setToError(message);
            setToAccountInfo(null);
            setTransferType(undefined);
            setFieldError("to", message);
          }
        })();
      }, ACCOUNT_LOOKUP_DEBOUNCE);

      return () => clearTimeout(timer);
      // `t` intentionally not included; we read from tRef instead.
    }, [toValue, setFieldError]);

    return null;
  };

  const FromAccountChecker = ({ fromValue }: { fromValue: string }) => {
    const { setFieldError } = useFormikContext<ExtendedValues>();

    useEffect(() => {
      if (!fromValue) {
        setFromAccountInfo(null);
        return;
      }

      const timer = setTimeout(() => {
        void (async () => {
          try {
            const info = await resolveAccountInfo(fromValue);
            if (!info) {
              const message = tRef.current("accountNotFound");
              setFromAccountInfo(null);
              setFieldError("from", message);
              return;
            }

            setFromAccountInfo(info);
            setFieldError("from", undefined);
          } catch (err: unknown) {
            console.error("From account check failed:", err);
            const message =
              err instanceof Error &&
                typeof err.message === "string" &&
                err.message
                ? err.message
                : tRef.current("accountNotFound");
            setFromAccountInfo(null);
            setFieldError("from", message);
          }
        })();
      }, ACCOUNT_LOOKUP_DEBOUNCE);

      return () => clearTimeout(timer);
    }, [fromValue, setFieldError]);

    return null;
  };

  /* -------- open confirmation modal --------------- */
  const openModal = async (vals: ExtendedValues) => {
    // Allow opening in viewOnly when posting is permitted
    if (viewOnly && !canPostTransfer) return;

    try {
      const [fromInfo, toInfo] = await Promise.all([
        resolveAccountInfo(vals.from),
        resolveAccountInfo(vals.to),
      ]);

      if (!fromInfo || !toInfo) {
        throw new Error(tRef.current("accountNotFound"));
      }

      setFromAccountInfo(fromInfo);
      setToAccountInfo(toInfo);

      const fromCurrency = fromInfo.currency?.trim();
      const toCurrency = toInfo.currency?.trim();

      if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
        throw new Error(t("currencyMismatch"));
      }

      const currencyDesc = (fromCurrency ?? toCurrency ?? "").trim();
      if (!currencyDesc) {
        throw new Error(
          t("currencyLookupFailed", {
            defaultValue: "Unable to resolve currency details.",
          })
        );
      }

      const servicePackageId = Number(Cookies.get("servicePackageId") ?? 0);
      const commResp = await getTransfersCommision(
        servicePackageId,
        vals.transactionCategoryId ?? 2
      );

      const effectiveTransferType =
        transferType ?? toInfo.transferType ?? undefined;

      const isB2B = effectiveTransferType === "B2B";
      const pct = isB2B ? commResp.b2BCommissionPct : commResp.b2CCommissionPct;
      // Use foreign fixed fee when currency is not LYD
      const isLYD = currencyDesc.trim().toUpperCase() === "LYD";
      const fixed = isB2B
        ? (isLYD ? commResp.b2BFixedFee : commResp.b2BFixedFeeForeign)
        : (isLYD ? commResp.b2CFixedFee : commResp.b2CFixedFeeForeign);
      const pctAmt = (pct * vals.value) / 100;
      const fee = Math.max(pctAmt, fixed);

      const resolveDisplayName = (info: AccountLookup | null) => {
        if (!info) return undefined;
        if (locale === "ar") {
          return info.accountName || info.companyName || undefined;
        }
        return info.companyName || info.accountName || undefined;
      };

      setModalData({
        formikData: vals,
        commissionAmount: fee,
        commissionCurrency: currencyDesc,
        displayAmount: commissionOnReceiver ? vals.value : vals.value + fee,
        fromCompanyName: resolveDisplayName(fromInfo),
        toCompanyName: resolveDisplayName(toInfo),
        currencyDesc,
      });
      setModalOpen(true);
    } catch (err) {
      console.error("Modal prep failed:", err);
      setAlertTitle(t("createErrorTitle"));
      const message =
        err instanceof Error && err.message
          ? err.message
          : (t("unknownError") as string);
      setAlertMessage(message);
      setAlertOpen(true);
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
      // If we're in details page with permission, post existing transfer instead of creating
      if (transferId && canPostTransfer) {
        const result = await postTransfer(transferId);
        if (!result.success) {
          throw new Error(
            (result.message as string) ||
            (t("postErrorMsg", {
              defaultValue: "The transfer could not be confirmed.",
            }) as string)
          );
        }
        setAlertTitle(t("postSuccessTitle", { defaultValue: "Transfer confirmed" }));
        setAlertMessage(
          result.message ||
          (t("postSuccessMsg", {
            defaultValue: "The transfer was confirmed successfully.",
          }) as string)
        );
        setAlertSuccess(true);
        setAlertOpen(true);
        return;
      }

      const { currencyDesc } = modalData;
      if (!currencyDesc) {
        throw new Error(
          t("currencyLookupFailed", {
            defaultValue: "Unable to resolve currency details.",
          })
        );
      }
      await createTransfer({
        transactionCategoryId,
        economicSectorId,
        fromAccount: from,
        toAccount: to,
        amount: value,
        currencyDesc,
        description,
      });
      onSubmit?.(modalData.formikData);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setAlertTitle(
        t(
          transferId && canPostTransfer ? "postErrorTitle" : "createErrorTitle",
          { defaultValue: transferId && canPostTransfer ? "Confirm error" : "Create error" }
        )
      );
      setAlertMessage(msg);
      setAlertSuccess(false);
      setAlertOpen(true);
    } finally {
      setModalOpen(false);
    }
  };

  // No separate button; posting is triggered from the confirm modal when on details page

  /* --------------------------- JSX ------------------------------------- */
  return (
    <div className="p-2">
      <Formik<ExtendedValues>
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={() => { }}
        enableReinitialize
      >
        {({ values }) => {
          const currencyMismatchMessage = t("currencyMismatch", {
            defaultValue: "Currencies must match",
          });
          return (
            <>
              <FromAccountChecker fromValue={values.from} />
              <ToAccountChecker toValue={values.to} />
              <FormValidator
                fromInfo={fromAccountInfo}
                toInfo={toAccountInfo}
                currencyMismatch={currencyMismatch}
                setCurrencyMismatch={setCurrencyMismatch}
                mismatchMessage={currencyMismatchMessage}
              />
              <Form>
                <FormHeader
                  showBackButton
                  fallbackPath="/transfers/internal"
                  isEditing={true}
                />

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
                  // placeholder={t("selectOrTypeToAccount", {
                  //   defaultValue: "Select beneficiary or type account",
                  // })}
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
                {(!viewOnly || canPostTransfer) && (
                  <div className="mt-6 flex justify-center gap-4">
                    {!viewOnly && !isNew && (
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
                      disabled={!!toError || currencyMismatch}
                      label={actionLabel}
                    />
                  </div>
                )}
              </Form>
            </>
          );
        }}
      </Formik>

      {/* Modal – disabled in viewOnly */}
      {modalData && (!viewOnly || canPostTransfer) && (
        <ConfirmInfoModal
          isOpen={modalOpen}
          formData={modalData.formikData}
          commissionAmount={modalData.commissionAmount}
          commissionCurrency={modalData.commissionCurrency}
          displayAmount={modalData.displayAmount}
          fromAccountName={modalData.fromCompanyName}
          toAccountName={modalData.toCompanyName}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmModal}
          isNew={isNew}
        />
      )}

      <ErrorOrSuccessModal
        isOpen={alertOpen}
        isSuccess={alertSuccess}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => {
          setAlertOpen(false);
          if (alertSuccess && transferId && canPostTransfer) {
            router.push(`/${locale}/transfers/internal`);
          }
        }}
      />
    </div>
  );
}

export default InternalForm;


// Choose action label based on mode

