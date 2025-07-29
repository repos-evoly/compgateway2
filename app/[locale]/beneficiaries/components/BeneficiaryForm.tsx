"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SelectWrapper from "@/app/components/FormUI/Select";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { createBeneficiary, updateBeneficiary } from "../services";
import type {
  BeneficiaryFormProps,
  BeneficiaryFormValues,
  BeneficiaryType,
} from "../types";

import {
  FaUser,
  FaCreditCard,
  FaGlobe,
  FaUniversity,
  FaMoneyBill,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FormikConfig } from "formik";

const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({
  initialData,

  viewOnly = false,
  onSuccess,
}) => {
  const t = useTranslations("beneficiaries");

  // Available banks for dropdown
  const availableBanks = [
    "National Bank",
    "Commercial Bank",
    "Islamic Bank",
    "Central Bank",
    "Investment Bank",
    "Savings Bank",
    "Development Bank",
    "Cooperative Bank",
  ];

  /* -------------------------------------------------------- */
  /*                        State                             */
  /* -------------------------------------------------------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [selectedType, setSelectedType] = useState<BeneficiaryType>(
    initialData?.type || "local"
  );

  /* -------------------------------------------------------- */
  /*                    Form Configuration                     */
  /* -------------------------------------------------------- */
  const isEditMode = Boolean(initialData?.id);

  const type: BeneficiaryType = selectedType;

  const initialValues: BeneficiaryFormValues =
    type === "international"
      ? {
          type: "international",
          name: initialData?.name || "",
          address:
            initialData && initialData.type === "international"
              ? initialData.address || ""
              : "",
          country:
            initialData && initialData.type === "international"
              ? initialData.country || ""
              : "",
          accountNumber: initialData?.accountNumber || "",
          intermediaryBankSwift:
            initialData && initialData.type === "international"
              ? initialData.intermediaryBankSwift || ""
              : "",
          intermediaryBankName:
            initialData && initialData.type === "international"
              ? initialData.intermediaryBankName || ""
              : "",
        }
      : {
          type: "local",
          name: initialData?.name || "",
          accountNumber: initialData?.accountNumber || "",
          bank:
            initialData && initialData.type === "local"
              ? initialData.bank || ""
              : "",
          amount:
            initialData && initialData.type === "local"
              ? initialData.amount || 0
              : 0,
        };

  // Validation schema for each type
  const validationSchema =
    type === "international"
      ? Yup.object().shape({
          name: Yup.string()
            .required(t("nameRequired"))
            .min(2, t("nameMinLength"))
            .max(100, t("nameMaxLength")),
          address: Yup.string().required(t("addressRequired")),
          country: Yup.string().required(t("countryRequired")),
          accountNumber: Yup.string()
            .required(t("accountNumberRequired"))
            .matches(/^.+$/, t("accountNumberFormat")),
          intermediaryBankSwift: Yup.string(),
          intermediaryBankName: Yup.string(),
        })
      : Yup.object().shape({
          name: Yup.string()
            .required(t("nameRequired"))
            .min(2, t("nameMinLength"))
            .max(100, t("nameMaxLength")),
          accountNumber: Yup.string()
            .required(t("accountNumberRequired"))
            .matches(/^[0-9A-Za-z\-]+$/, t("accountNumberFormat")),
          bank: Yup.string().required(t("bankRequired")),
          amount: Yup.number()
            .typeError(t("amountFormat"))
            .min(0, t("amountMin")),
        });

  /* -------------------------------------------------------- */
  /*                    Form Handlers                         */
  /* -------------------------------------------------------- */
  const handleSubmit = async (values: BeneficiaryFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && initialData?.id) {
        await updateBeneficiary(initialData.id, values);
        setModalTitle(t("updateSuccessTitle"));
        setModalMessage(t("updateSuccessMsg"));
      } else {
        await createBeneficiary(values);
        setModalTitle(t("createSuccessTitle"));
        setModalMessage(t("createSuccessMsg"));
      }
      setModalSuccess(true);
      setModalOpen(true);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unknownError");
      setModalTitle(t("errorTitle"));
      setModalMessage(errorMessage);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  /* -------------------------------------------------------- */
  /*                       Render                             */
  /* -------------------------------------------------------- */
  return (
    <div className="p-2">
      <Form
        initialValues={initialValues}
        validationSchema={validationSchema as FormikConfig<BeneficiaryFormValues>["validationSchema"]}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <FormHeader
          showBackButton
          fallbackPath="/beneficiaries"
          isEditing={true}
        >
          {/* Type Selector */}
          {!isEditMode && (
            <div className="flex gap-2 ml-4">
              <button
                className={`px-4 py-2 rounded font-semibold border transition-colors duration-150 ${
                  selectedType === "international"
                    ? "bg-white text-green-700"
                    : "bg-white/20 text-white border-white/30"
                }`}
                onClick={() => setSelectedType("international")}
                type="button"
              >
                {t("international")}
              </button>
              <button
                className={`px-4 py-2 rounded font-semibold border transition-colors duration-150 ${
                  selectedType === "local"
                    ? "bg-white text-green-700"
                    : "bg-white/20 text-white border-white/30"
                }`}
                onClick={() => setSelectedType("local")}
                type="button"
              >
                {t("local")}
              </button>
            </div>
          )}
        </FormHeader>

        {/* Form Fields */}
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <FormInputIcon
            name="name"
            label={t("name")}
            type="text"
            startIcon={<FaUser />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("namePlaceholder")}
          />
          {type === "international" ? (
            <>
              <FormInputIcon
                name="address"
                label={t("address")}
                type="text"
                startIcon={<FaMapMarkerAlt />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("addressPlaceholder")}
              />
              <FormInputIcon
                name="country"
                label={t("country")}
                type="text"
                startIcon={<FaGlobe />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("countryPlaceholder")}
              />
              <FormInputIcon
                name="accountNumber"
                label={t("accountNumber")}
                type="text"
                startIcon={<FaCreditCard />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("accountNumberPlaceholder")}
              />
              <FormInputIcon
                name="intermediaryBankSwift"
                label={t("intermediaryBankSwift")}
                type="text"
                startIcon={<FaUniversity />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("intermediaryBankSwiftPlaceholder")}
              />
              <FormInputIcon
                name="intermediaryBankName"
                label={t("intermediaryBankName")}
                type="text"
                startIcon={<FaUniversity />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("intermediaryBankNamePlaceholder")}
              />
            </>
          ) : (
            <>
              <SelectWrapper
                name="bank"
                label={t("bank")}
                options={availableBanks.map((bank) => ({
                  value: bank,
                  label: bank,
                }))}
                disabled={viewOnly || isSubmitting}
              />
              <FormInputIcon
                name="accountNumber"
                label={t("accountNumber")}
                type="text"
                startIcon={<FaCreditCard />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("accountNumberPlaceholder")}
              />
              <FormInputIcon
                name="amount"
                label={t("amount")}
                type="number"
                startIcon={<FaMoneyBill />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("amountPlaceholder")}
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!viewOnly && (
          <div className="flex gap-4 mt-6">
            <SubmitButton disabled={isSubmitting} title={t("submit")} />
          </div>
        )}
      </Form>

      {/* Error/Success Modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalClose}
      />
    </div>
  );
};

export default BeneficiaryForm;
