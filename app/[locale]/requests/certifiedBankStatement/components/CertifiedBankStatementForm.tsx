// /* --------------------------------------------------------------------------
//    components/CertifiedBankStatementForm.tsx
//    -------------------------------------------------------------------------- */
// "use client";

// import React, { useRef, useState } from "react";
// import { Formik, Form, FormikHelpers } from "formik";
// import * as Yup from "yup";
// import { ValidationError } from "yup";
// import { useTranslations } from "next-intl";

// import { TabsWizard } from "@/app/components/reusable/TabsWizard";
// import { Step1StatementForm } from "./Step1StatementForm";
// import { Step2StatementForm } from "./Step2StatementForm";
// import {
//   CertifiedBankStatementRequest,
//   step1StatementInputs,
//   step2StatementInputs,
// } from "./statementInputs";
// import ReasonBanner from "@/app/components/reusable/ReasonBanner";
// import ConfirmationDialog from "@/app/components/reusable/ConfirmationDialog";

// /* === helpers to fetch statement + pricing and compute amount === */
// import { getPricing } from "@/app/helpers/getPricing";
// import type { PricingItem } from "@/types";
// import {
//   getStatement,
//   type StatementLine,
// } from "@/app/[locale]/statement-of-account/services";

// /* === PDF generation helpers (re-use Statement of Account PDF generator) === */
// import { generateStatementPdf } from "@/app/[locale]/statement-of-account/generatePdf";
// import { loadImageAsBase64 } from "@/app/[locale]/statement-of-account/loadImageAsBase64";

// /* ──────────────────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────────────────── */
// export type CertifiedBankStatementRequestWithID =
//   CertifiedBankStatementRequest & {
//     id: number;
//     [k: string]: unknown;
//   };

// type CertifiedBankStatementFormProps = {
//   initialValues?: Partial<CertifiedBankStatementRequestWithID>;
//   onSubmit: (v: CertifiedBankStatementRequestWithID) => void;
//   readOnly?: boolean;
// };

// /* ──────────────────────────────────────────────────────────────────────────
//  * Defaults
//  * ──────────────────────────────────────────────────────────────────────── */
// const defaultValues: CertifiedBankStatementRequestWithID = {
//   id: 0,
//   accountHolderName: "",
//   authorizedOnTheAccountName: "",
//   accountNumber: undefined,
//   totalAmountLyd: 0,
//   serviceRequests: {
//     reactivateIdfaali: false,
//     deactivateIdfaali: false,
//     resetDigitalBankPassword: false,
//     resendMobileBankingPin: false,
//     changePhoneNumber: false,
//   },
//   oldAccountNumber: undefined,
//   newAccountNumber: undefined,
//   statementRequest: {
//     currentAccountStatement: { arabic: false, english: false },
//     visaAccountStatement: false,
//     fromDate: "",
//     toDate: "",
//     accountStatement: false,
//     journalMovement: false,
//     nonFinancialCommitment: false,
//   },
// };

// /* ──────────────────────────────────────────────────────────────────────────
//  * Utility: pick the Certified Bank Statement pricing row robustly
//  * ──────────────────────────────────────────────────────────────────────── */
// function findCertifiedBankStatementPricing(
//   items: PricingItem[]
// ): PricingItem | undefined {
//   const byTrxCat = items.find((p) => p.trxCatId === 9);
//   if (byTrxCat) return byTrxCat;

//   const byDesc = items.find((p) =>
//     (p.description ?? "").toLowerCase().includes("certified bank statement")
//   );
//   if (byDesc) return byDesc;

//   return items.find((p) => p.id === 18);
// }

// /* Compute running balance and set a reference field (for PDF) */
// function withBalanceAndReference(data: StatementLine[]): StatementLine[] {
//   let running = 0;
//   return data.map((ln) => {
//     running += ln.amount ?? 0;
//     return {
//       ...ln,
//       balance: running,
//       reference: ln.nr1 ?? "",
//     };
//   });
// }

// /* ──────────────────────────────────────────────────────────────────────────
//  * Component
//  * ──────────────────────────────────────────────────────────────────────── */
// export default function CertifiedBankStatementForm({
//   initialValues,
//   onSubmit,
//   readOnly = false,
// }: CertifiedBankStatementFormProps) {
//   const t = useTranslations("bankStatement");

//   const merged: CertifiedBankStatementRequestWithID = {
//     ...defaultValues,
//     ...initialValues,
//   };

//   const steps = [
//     {
//       title: t("step1Title"),
//       component: <Step1StatementForm readOnly={readOnly} />,
//     },
//     {
//       title: t("step2Title"),
//       component: <Step2StatementForm readOnly={readOnly} />,
//     },
//   ];

//   const allInputs = [...step1StatementInputs, ...step2StatementInputs];
//   const xlate = (name: string) => {
//     const input = allInputs.find((f) => f.name === name);
//     if (input) {
//       return t(input.label);
//     }
//     if (name === "id") {
//       return t("id");
//     }
//     return name;
//   };

//   const stepValidations = [
//     Yup.object({
//       accountHolderName: Yup.string().required(
//         `${t("accountHolderName")} ${t("isRequired")}`
//       ),
//       authorizedOnTheAccountName: Yup.string().required(
//         `${t("authorizedOnTheAccountName")} ${t("isRequired")}`
//       ),
//       accountNumber: Yup.number()
//         .typeError(`${t("accountNumber")} ${t("mustBeNumber")}`)
//         .required(`${t("accountNumber")} ${t("isRequired")}`),
//     }),
//     Yup.object({
//       oldAccountNumber: Yup.number()
//         .typeError(`${t("oldAccountNumber")} ${t("mustBeNumber")}`)
//         .required(`${t("oldAccountNumber")} ${t("isRequired")}`),
//       newAccountNumber: Yup.number()
//         .typeError(`${t("newAccountNumber")} ${t("mustBeNumber")}`)
//         .required(`${t("newAccountNumber")} ${t("isRequired")}`),
//     }),
//   ];

//   /* ───────────────────────────────────────────────────────────────
//    * Confirmation dialog state (Arabic message) + pending submit
//    * ─────────────────────────────────────────────────────────────── */
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmMsg, setConfirmMsg] = useState("");

//   const pendingValuesRef = useRef<CertifiedBankStatementRequestWithID | null>(
//     null
//   );
//   const helpersRef =
//     useRef<FormikHelpers<CertifiedBankStatementRequestWithID> | null>(null);
//   const fetchedLinesRef = useRef<StatementLine[] | null>(null);

//   return (
//     <div className="w-full rounded-md bg-gray-50 p-4">
//       <Formik
//         initialValues={merged}
//         onSubmit={async (
//           vals: CertifiedBankStatementRequestWithID,
//           helpers: FormikHelpers<CertifiedBankStatementRequestWithID>
//         ) => {
//           helpersRef.current = helpers;

//           const isEditingMode = !!initialValues;
//           if (isEditingMode || readOnly) {
//             // Edit mode → submit immediately.
//             try {
//               onSubmit(vals);
//             } finally {
//               helpers.setSubmitting(false);
//             }
//             return;
//           }

//           // Add mode → fetch statement & pricing, compute amount, prepare PDF, then confirm.
//           try {
//             helpers.setSubmitting(true); // keep submit button loading through the whole flow

//             const accountRaw = vals.accountNumber;
//             const account =
//               typeof accountRaw === "number"
//                 ? String(accountRaw)
//                 : accountRaw ?? "";
//             const fromDate = vals.statementRequest?.fromDate ?? "";
//             const toDate = vals.statementRequest?.toDate ?? "";

//             // 1) Fetch Statement rows
//             const linesRaw = await getStatement({ account, fromDate, toDate });
//             const linesProcessed = withBalanceAndReference(linesRaw);
//             fetchedLinesRef.current = linesProcessed;

//             // 2) Fetch pricing and compute amount
//             const pricing = await getPricing();
//             const cbs = findCertifiedBankStatementPricing(pricing.data);

//             const unit = Math.max(1, cbs?.unit ?? 1);
//             const price = cbs?.price ?? 0;
//             const rowsCount = linesProcessed.length;
//             const chunks = Math.ceil(rowsCount / unit);
//             const amount = chunks * price;

//             // Debug
//             console.log(
//               "[CertifiedBankStatement] rows/unit/price/chunks/amount",
//               {
//                 rowsCount,
//                 unit,
//                 price,
//                 chunks,
//                 amount,
//               }
//             );

//             // 3) Build Arabic confirmation message
//             const msg = `سيتم خصم مبلغ ${amount} من الحساب ${account} مقابل إصدار كشف حساب معتمد.
//    عدد الحركات: ${rowsCount}. التسعير: ${price} لكل ${unit} حركة.
//    هل تريد المتابعة؟`;

//             setConfirmMsg(msg);
//             pendingValuesRef.current = { ...vals, totalAmountLyd: amount }; // ← set it here
//             setConfirmOpen(true);
//             // Keep isSubmitting = true until user decides.
//           } catch (err) {
//             console.error(
//               "[CertifiedBankStatement] حساب الخصم أو جلب الكشف فشل:",
//               err
//             );
//             helpers.setSubmitting(false);
//           }
//         }}
//         validationSchema={Yup.object({})} /* TabsWizard validates per step */
//         validateOnBlur
//         validateOnChange={false}
//       >
//         {(formik) => {
//           const validateCurrentStep = async (idx: number) => {
//             try {
//               await stepValidations[idx].validate(formik.values, {
//                 abortEarly: false,
//               });
//               formik.setErrors({});
//               return true;
//             } catch (err) {
//               if (err instanceof ValidationError) {
//                 const errs: Record<string, string> = {};
//                 const touched: Record<string, boolean> = {};
//                 err.inner.forEach((e) => {
//                   if (e.path) {
//                     errs[e.path] = e.message;
//                     touched[e.path] = true;
//                   }
//                 });
//                 formik.setErrors(errs);
//                 formik.setTouched(touched, false);
//               }
//               return false;
//             }
//           };

//           const statusVal = (merged as Record<string, unknown>)["status"];
//           const bannerStatus: "approved" | "rejected" =
//             typeof statusVal === "string" &&
//             statusVal.toLowerCase() === "approved"
//               ? "approved"
//               : "rejected";

//           const reasonVal = (merged as Record<string, unknown>)["reason"];
//           const bannerReason = typeof reasonVal === "string" ? reasonVal : null;

//           return (
//             <>
//               <Form>
//                 <ReasonBanner reason={bannerReason} status={bannerStatus} />
//                 <TabsWizard
//                   steps={steps}
//                   formik={formik}
//                   onSubmit={() => formik.handleSubmit()}
//                   validateCurrentStep={validateCurrentStep}
//                   translateFieldName={xlate}
//                   readOnly={readOnly}
//                   isEditing={!!initialValues}
//                 />
//               </Form>

//               {/* Confirmation Dialog (Arabic) */}
//               <ConfirmationDialog
//                 openDialog={confirmOpen}
//                 message={confirmMsg}
//                 onClose={async (confirmed: boolean) => {
//                   setConfirmOpen(false);
//                   const helpers = helpersRef.current;

//                   try {
//                     if (confirmed && pendingValuesRef.current) {
//                       // Generate PDF for the fetched rows before submitting
//                       const vals = pendingValuesRef.current;
//                       const accountRaw = vals.accountNumber;
//                       const accountNumber =
//                         typeof accountRaw === "number"
//                           ? String(accountRaw)
//                           : accountRaw ?? "";

//                       const fromDate = vals.statementRequest?.fromDate ?? "";
//                       const toDate = vals.statementRequest?.toDate ?? "";
//                       const fromDateFormatted = fromDate
//                         ? new Date(fromDate).toLocaleDateString("en-GB")
//                         : "";
//                       const toDateFormatted = toDate
//                         ? new Date(toDate).toLocaleDateString("en-GB")
//                         : "";

//                       const linesForPdf = fetchedLinesRef.current ?? [];

//                       if (linesForPdf.length > 0) {
//                         try {
//                           const bgImageBase64 = await loadImageAsBase64(
//                             "/images/pdfbg.jpg"
//                           );

//                           const accountInfo = {
//                             accountNumber,
//                             customerName:
//                               typeof vals.accountHolderName === "string" &&
//                               vals.accountHolderName.trim() !== ""
//                                 ? vals.accountHolderName
//                                 : linesForPdf[0]?.nr1 ?? "Customer Name",
//                             accountType: "جاري",
//                             currency: "دينار",
//                             branchAgency: "0015",
//                             timePeriod: `${fromDateFormatted} - ${toDateFormatted}`,
//                           };

//                           generateStatementPdf(
//                             linesForPdf,
//                             accountInfo,
//                             bgImageBase64
//                           );
//                         } catch (pdfErr) {
//                           console.error("Failed to generate PDF:", pdfErr);
//                         }
//                       }

//                       // Finally submit the form (API call by parent)
//                       onSubmit(vals);
//                     }
//                   } finally {
//                     if (helpers) helpers.setSubmitting(false);
//                     pendingValuesRef.current = null;
//                     fetchedLinesRef.current = null;
//                   }
//                 }}
//               />
//             </>
//           );
//         }}
//       </Formik>
//     </div>
//   );
// }

// components/CertifiedBankStatementForm.tsx
"use client";

import React, { useRef, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1StatementForm } from "./Step1StatementForm";
import { Step2StatementForm } from "./Step2StatementForm";
import {
  CertifiedBankStatementRequest,
  step1StatementInputs,
  step2StatementInputs,
} from "./statementInputs";
import ReasonBanner from "@/app/components/reusable/ReasonBanner";
import ConfirmationDialog from "@/app/components/reusable/ConfirmationDialog";

/* === helpers to fetch statement + pricing and compute amount === */
import { getPricing } from "@/app/helpers/getPricing";
import type { PricingItem } from "@/types";
import {
  getStatement,
  type StatementLine,
} from "@/app/[locale]/statement-of-account/services";
import { printCertifiedStatement } from "./printCertifiedStatement";

/* NEW: print with the new PDF template as background */

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */
export type CertifiedBankStatementRequestWithID =
  CertifiedBankStatementRequest & {
    id: number;
    totalAmountLyd?: number;
    [k: string]: unknown;
  };

type CertifiedBankStatementFormProps = {
  initialValues?: Partial<CertifiedBankStatementRequestWithID>;
  onSubmit: (v: CertifiedBankStatementRequestWithID) => void;
  readOnly?: boolean;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Defaults
 * ──────────────────────────────────────────────────────────────────────── */
const defaultValues: CertifiedBankStatementRequestWithID = {
  id: 0,
  accountHolderName: "",
  authorizedOnTheAccountName: "",
  accountNumber: undefined,
  totalAmountLyd: 0,
  serviceRequests: {
    reactivateIdfaali: false,
    deactivateIdfaali: false,
    resetDigitalBankPassword: false,
    resendMobileBankingPin: false,
    changePhoneNumber: false,
  },
  oldAccountNumber: undefined,
  newAccountNumber: undefined,
  statementRequest: {
    currentAccountStatement: { arabic: false, english: false },
    visaAccountStatement: false,
    fromDate: "",
    toDate: "",
    accountStatement: false,
    journalMovement: false,
    nonFinancialCommitment: false,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Utility
 * ──────────────────────────────────────────────────────────────────────── */
function findCertifiedBankStatementPricing(
  items: PricingItem[]
): PricingItem | undefined {
  const byTrxCat = items.find((p) => p.trxCatId === 9);
  if (byTrxCat) return byTrxCat;

  const byDesc = items.find((p) =>
    (p.description ?? "").toLowerCase().includes("certified bank statement")
  );
  if (byDesc) return byDesc;

  return items.find((p) => p.id === 18);
}

function withBalanceAndReference(data: StatementLine[]): StatementLine[] {
  let running = 0;
  return data.map((ln) => {
    running += ln.amount ?? 0;
    return {
      ...ln,
      balance: running,
      reference: ln.nr1 ?? "",
    };
  });
}

/* ──────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────── */
export default function CertifiedBankStatementForm({
  initialValues,
  onSubmit,
  readOnly = false,
}: CertifiedBankStatementFormProps) {
  const t = useTranslations("bankStatement");

  const merged: CertifiedBankStatementRequestWithID = {
    ...defaultValues,
    ...initialValues,
  };

  const steps = [
    {
      title: t("step1Title"),
      component: <Step1StatementForm readOnly={readOnly} />,
    },
    {
      title: t("step2Title"),
      component: <Step2StatementForm readOnly={readOnly} />,
    },
  ];

  const allInputs = [...step1StatementInputs, ...step2StatementInputs];
  const xlate = (name: string) => {
    const input = allInputs.find((f) => f.name === name);
    if (input) return t(input.label);
    if (name === "id") return t("id");
    return name;
  };

  const stepValidations = [
    Yup.object({
      accountHolderName: Yup.string().required(
        `${t("accountHolderName")} ${t("isRequired")}`
      ),
      authorizedOnTheAccountName: Yup.string().required(
        `${t("authorizedOnTheAccountName")} ${t("isRequired")}`
      ),
      accountNumber: Yup.number()
        .typeError(`${t("accountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("accountNumber")} ${t("isRequired")}`),
    }),
    Yup.object({
      oldAccountNumber: Yup.number()
        .typeError(`${t("oldAccountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("oldAccountNumber")} ${t("isRequired")}`),
      newAccountNumber: Yup.number()
        .typeError(`${t("newAccountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("newAccountNumber")} ${t("isRequired")}`),
    }),
  ];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  const pendingValuesRef = useRef<CertifiedBankStatementRequestWithID | null>(
    null
  );
  const helpersRef =
    useRef<FormikHelpers<CertifiedBankStatementRequestWithID> | null>(null);
  const fetchedLinesRef = useRef<StatementLine[] | null>(null);


  return (
    <div className="w-full rounded-md bg-gray-50 p-4">
      <Formik
        initialValues={merged}
        onSubmit={async (
          vals: CertifiedBankStatementRequestWithID,
          helpers: FormikHelpers<CertifiedBankStatementRequestWithID>
        ) => {
          helpersRef.current = helpers;

          const isEditingMode = !!initialValues;
          if (isEditingMode || readOnly) {
            try {
              onSubmit(vals);
            } finally {
              helpers.setSubmitting(false);
            }
            return;
          }

          try {
            helpers.setSubmitting(true);

            const accountRaw = vals.accountNumber;
            const account =
              typeof accountRaw === "number"
                ? String(accountRaw)
                : accountRaw ?? "";
            const fromDate = vals.statementRequest?.fromDate ?? "";
            const toDate = vals.statementRequest?.toDate ?? "";

            // 1) Fetch Statement rows
            const linesRaw = await getStatement({ account, fromDate, toDate });
            const linesProcessed = withBalanceAndReference(linesRaw);
            fetchedLinesRef.current = linesProcessed;

            // 2) Fetch pricing and compute amount
            const pricing = await getPricing();
            const cbs = findCertifiedBankStatementPricing(pricing.data);

            const unit = Math.max(1, cbs?.unit ?? 1);
            const price = cbs?.price ?? 0;
            const rowsCount = linesProcessed.length;
            const chunks = Math.ceil(rowsCount / unit);
            const amount = chunks * price;

            const msg = `سيتم خصم مبلغ ${amount} من الحساب ${account} مقابل إصدار كشف حساب معتمد.
عدد الحركات: ${rowsCount}. التسعير: ${price} لكل ${unit} حركة.
هل تريد المتابعة؟`;

            setConfirmMsg(msg);
            pendingValuesRef.current = { ...vals, totalAmountLyd: amount };
            setConfirmOpen(true);
          } catch (err) {
            console.error(
              "[CertifiedBankStatement] حساب الخصم أو جلب الكشف فشل:",
              err
            );
            helpers.setSubmitting(false);
          }
        }}
        validationSchema={Yup.object({})}
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
          const validateCurrentStep = async (idx: number) => {
            try {
              await stepValidations[idx].validate(formik.values, {
                abortEarly: false,
              });
              formik.setErrors({});
              return true;
            } catch (err) {
              if (err instanceof ValidationError) {
                const errs: Record<string, string> = {};
                const touched: Record<string, boolean> = {};
                err.inner.forEach((e) => {
                  if (e.path) {
                    errs[e.path] = e.message;
                    touched[e.path] = true;
                  }
                });
                formik.setErrors(errs);
                formik.setTouched(touched, false);
              }
              return false;
            }
          };

          const statusVal = (merged as Record<string, unknown>)["status"];
          const bannerStatus: "approved" | "rejected" =
            typeof statusVal === "string" &&
            statusVal.toLowerCase() === "approved"
              ? "approved"
              : "rejected";

          const reasonVal = (merged as Record<string, unknown>)["reason"];
          const bannerReason = typeof reasonVal === "string" ? reasonVal : null;

          return (
            <>
              <Form>
                <ReasonBanner reason={bannerReason} status={bannerStatus} />
                <TabsWizard
                  steps={steps}
                  formik={formik}
                  onSubmit={() => formik.handleSubmit()}
                  validateCurrentStep={validateCurrentStep}
                  translateFieldName={xlate}
                  readOnly={readOnly}
                  isEditing={!!initialValues}
                />
              </Form>

              <ConfirmationDialog
                openDialog={confirmOpen}
                message={confirmMsg}
                onClose={async (confirmed: boolean) => {
                  setConfirmOpen(false);
                  const helpers = helpersRef.current;

                  try {
                    if (confirmed && pendingValuesRef.current) {
                      const vals = pendingValuesRef.current;
                      const accountRaw = vals.accountNumber;
                      const accountNumber =
                        typeof accountRaw === "number"
                          ? String(accountRaw)
                          : accountRaw ?? "";

                      const fromDate = vals.statementRequest?.fromDate ?? "";
                      const toDate = vals.statementRequest?.toDate ?? "";
                      const fromDateFormatted = fromDate
                        ? new Date(fromDate).toLocaleDateString("en-GB")
                        : "";
                      const toDateFormatted = toDate
                        ? new Date(toDate).toLocaleDateString("en-GB")
                        : "";

                      const linesForPdf = fetchedLinesRef.current ?? [];

                      if (linesForPdf.length > 0) {
                        try {
                          const accountInfo = {
                            accountNumber,
                            customerName:
                              typeof vals.accountHolderName === "string" &&
                              vals.accountHolderName.trim() !== ""
                                ? vals.accountHolderName
                                : linesForPdf[0]?.nr1 ?? "Customer Name",
                            accountType: "جاري",
                            currency: "دينار",
                            branchAgency: "0015",
                            timePeriod: `${fromDateFormatted} - ${toDateFormatted}`,
                          };

                          await printCertifiedStatement(
                            linesForPdf,
                            accountInfo
                          );
                        } catch (pdfErr) {
                          console.error("Failed to generate PDF:", pdfErr);
                        }
                      }

                      // Finally submit
                      onSubmit(vals);
                    }
                  } finally {
                    if (helpers) helpers.setSubmitting(false);
                    pendingValuesRef.current = null;
                    fetchedLinesRef.current = null;
                  }
                }}
              />
            </>
          );
        }}
      </Formik>
    </div>
  );
}
