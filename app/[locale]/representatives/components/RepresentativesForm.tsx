"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import Switch from "@/app/components/FormUI/Switch";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaUser, FaPhone, FaPassport } from "react-icons/fa";

import { createRepresentative, updateRepresentative } from "../services";
import type { Representative, RepresentativeFormValues } from "../types";

interface RepresentativesFormProps {
  initialData: Representative | null;
  representativeId?: number;
  onSubmit: (success: boolean, message: string) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  number: Yup.string().required("Number is required"),
  passportNumber: Yup.string().required("Passport number is required"),
  isActive: Yup.boolean().required(),
});

export default function RepresentativesForm({
  initialData,
  representativeId,
  onSubmit,
  onCancel,
}: RepresentativesFormProps) {
  const t = useTranslations("representatives.form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const initialValues: RepresentativeFormValues = {
    name: initialData?.name || "",
    number: initialData?.number || "",
    passportNumber: initialData?.passportNumber || "",
    isActive: initialData?.isActive ?? true,
  };

  const handleSubmit = async (values: RepresentativeFormValues) => {
    try {
      setIsSubmitting(true);

      if (initialData && representativeId) {
        // Update existing representative
        await updateRepresentative(representativeId, {
          name: values.name,
          number: values.number,
          passportNumber: values.passportNumber,
          isActive: values.isActive,
        });
        onSubmit(true, t("updateSuccess"));
      } else {
        // Create new representative
        await createRepresentative({
          name: values.name,
          number: values.number,
          passportNumber: values.passportNumber,
          isActive: values.isActive,
        });
        onSubmit(true, t("createSuccess"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      onSubmit(
        false,
        error instanceof Error ? error.message : t("unexpectedError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <FormHeader
              text={initialData ? t("editTitle") : t("addTitle")}
              showBackButton
              fallbackPath="/representatives"
              isEditing={!!initialData}
            />

            <div className="mt-6 space-y-6">
              {/* First Row: Name and Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInputIcon
                  name="name"
                  label={t("fields.name")}
                  type="text"
                  startIcon={<FaUser />}
                  helpertext={t("fields.namePlaceholder")}
                />

                <FormInputIcon
                  name="number"
                  label={t("fields.number")}
                  type="text"
                  startIcon={<FaPhone />}
                  helpertext={t("fields.numberPlaceholder")}
                />
              </div>

              {/* Second Row: Passport Number and Active Status (edit mode only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInputIcon
                  name="passportNumber"
                  label={t("fields.passportNumber")}
                  type="text"
                  startIcon={<FaPassport />}
                  helpertext={t("fields.passportNumberPlaceholder")}
                />

                {isEditMode && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("fields.isActive")}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t("fields.isActiveDescription")}
                      </p>
                    </div>
                    <Switch
                      name="isActive"
                      label=""
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-success-main text-white rounded-lg hover:bg-success-dark transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-success-light"
              >
                {t("cancelButton")}
              </button>
              <SubmitButton
                title={initialData ? t("updateButton") : t("createButton")}
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
                fullWidth={false}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
} 