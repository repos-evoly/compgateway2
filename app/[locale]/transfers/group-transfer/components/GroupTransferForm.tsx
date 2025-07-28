// app/[locale]/group-transfer/components/GroupTransferForm.tsx
"use client";

import { useState, useEffect } from "react";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { Formik, Form } from "formik";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import ContinueButton from "./ContinueButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import MultiSelect from "@/app/components/FormUI/MultiSelect";

import type {
  GroupTransferFormProps,
  GroupTransferFormValues,
} from "../types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import FormHeader from "@/app/components/reusable/FormHeader";
import ConfirmInfoModal from "./ConfirmInfoModal";
import {
  getEconomicSectors,
  getTransfersCommision,
} from "../../internal/services";
import { createTransfer } from "../services";



/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */

type ExtendedValues = GroupTransferFormValues & {
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

function GroupTransferForm({
  initialData,
  onSubmit,
  viewOnly = false,
  onSuccess,
}: GroupTransferFormProps & ExtraProps) {
  const t = useTranslations("groupTransferForm");

  const isNew = !initialData || Object.keys(initialData).length === 0;
  const [fieldsDisabled] = useState(viewOnly || !isNew);
  const [toError] = useState<string | undefined>(undefined);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  /* ---------------- account list from cookie ---------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [sectorOptions, setSectorOptions] = useState<InputSelectComboOption[]>(
    []
  );
  // Remove beneficiaryOptions state

  /* ---------------- commission data ---------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    formikData: ExtendedValues;
    commissionAmount: number;
    commissionCurrency: string;
    displayAmount: number;
  } | null>(null);

  /* ---------------- load accounts from cookie ---------------- */
  useEffect(() => {
    // Dummy account data instead of loading from cookies
    const dummyAccounts = [
      { accountString: "1234-567890-001" },
      { accountString: "2345-678901-002" },
      { accountString: "3456-789012-003" },
      { accountString: "4567-890123-004" },
      { accountString: "5678-901234-005" },
    ];

    const options = dummyAccounts.map((account) => ({
      value: account.accountString,
      label: account.accountString,
    }));
    setAccountOptions(options);
  }, []);

  /* ---------------- load economic sectors ---------------- */
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await getEconomicSectors(1, 100);
        const options = response.data.map(
          (sector: { id: number; name: string }) => ({
            value: sector.id,
            label: sector.name,
          })
        );
        setSectorOptions(options);
      } catch (error) {
        console.error("Error loading economic sectors:", error);
      }
    };
    loadSectors();
  }, []);

  /* ---------------- load beneficiaries ---------------- */
  // Remove beneficiary loading useEffect

  /* ---------------- form validation schema ---------------- */
  const validationSchema = Yup.object().shape({
    from: Yup.string().required(t("fromRequired")),
    to: Yup.string().required(t("toRequired")),
    value: Yup.number()
      .required(t("valueRequired"))
      .positive(t("valuePositive")),
    description: Yup.string().required(t("descriptionRequired")),
  });

  /* ---------------- initial values ---------------- */
  const initialValues: ExtendedValues = {
    from: initialData?.from || "",
    to: initialData?.to || "",
    value: initialData?.value || 0,
    description: initialData?.description || "",
    beneficiaryId: initialData?.beneficiaryId,
    commissionOnRecipient: false,
    transactionCategoryId: initialData?.transactionCategoryId,
  };

  /* ---------------- modal handlers ---------------- */
  const openModal = async (vals: ExtendedValues) => {
    try {
      // Get commission data
      const commissionData = await getTransfersCommision(1, 1); // Replace with actual IDs
      setModalData({
        formikData: vals,
        commissionAmount: commissionData.b2BCommissionPct,
        commissionCurrency: "USD",
        displayAmount: vals.value,
      });
      setModalOpen(true);
    } catch (error) {
      console.error("Error opening modal:", error);
      setAlertTitle(t("errorTitle"));
      setAlertMessage(t("unknownError"));
      setAlertOpen(true);
    }
  };

  const confirmModal = async () => {
    if (!modalData) return;

    try {
      const payload = {
        fromAccount: modalData.formikData.from,
        toAccount: modalData.formikData.to,
        amount: modalData.formikData.value,
        description: modalData.formikData.description,
        currencyId: 1, // Replace with actual currency ID
        transactionCategoryId: modalData.formikData.transactionCategoryId,
      };

      await createTransfer(payload);
      setModalOpen(false);
      setModalData(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating transfer:", error);
      setAlertTitle(t("errorTitle"));
      setAlertMessage(t("unknownError"));
      setAlertOpen(true);
    }
  };

  /* ---------------- account check handler ---------------- */
  // Remove beneficiary change handler

  return (
    <div className="p-2">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit as (values: ExtendedValues) => void}
        enableReinitialize
      >
        {({ values }) => {
          return (
            <Form>
              <FormHeader
                showBackButton
                fallbackPath="/transfers/group-transfer"
              />

              {/* Row 1 */}
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <InputSelectCombo
                  name="from"
                  label={t("from")}
                  options={accountOptions}
                  disabled={fieldsDisabled}
                />

                <MultiSelect
                  name="to"
                  label={t("to")}
                  options={accountOptions}
                />

                <FormInputIcon
                  name="value"
                  label={t("amount")}
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
              {/* Remove beneficiary InputSelectCombo component */}

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

export default GroupTransferForm;
