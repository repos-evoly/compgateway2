// =============================================================
// RepresentativesForm.tsx      (ONLY FILE UPDATED)
// • Shows existing photo when editing
// =============================================================

"use client";

import React, { useState, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import Switch from "@/app/components/FormUI/Switch";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { DocumentUploader } from "@/app/components/reusable/DocumentUploader";

import { FaUser, FaPhone, FaPassport } from "react-icons/fa";

import { createRepresentative, updateRepresentative } from "../services";
import type { Representative, RepresentativeFormValues } from "../types";

type RepresentativesFormProps = {
  initialData: Representative | null;
  representativeId?: number;
  onSubmit: (success: boolean, message: string) => void;
  onCancel: () => void;
};

export default function RepresentativesForm({
  initialData,
  representativeId,
  onSubmit,
  onCancel,
}: RepresentativesFormProps) {
  const t = useTranslations("representatives.form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData);

  /* ------------------------------------------------------------------ */
  /* Build preview URL for existing photo (edit mode only)              */
  /* ------------------------------------------------------------------ */
  const initialPreviewUrl = useMemo(() => {
    if (!isEditMode || !initialData?.photoUrl) return undefined;

    /*  NEXT_PUBLIC_IMAGE_URL holds the base - ensure trailing slash */
    const base = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "").replace(/\/$/, "");
    return `${base}${initialData.photoUrl}`;
  }, [isEditMode, initialData]);

  /* ------------------------------------------------------------------ */
  /* Formik                                                             */
  /* ------------------------------------------------------------------ */
  const initialValues: RepresentativeFormValues = {
    name: initialData?.name ?? "",
    number: initialData?.number ?? "",
    passportNumber: initialData?.passportNumber ?? "",
    isActive: initialData?.isActive ?? true,
    photo: [],
  };

  /* ------------------------------------------------------------------ */
  /* Updated Yup schema – length-only restrictions                      */
  /* ------------------------------------------------------------------ */
  const validationSchema = Yup.object({
    name: Yup.string().required(t("validation.required")),

    /* Phone number: 9–10 characters, no other checks */
    number: Yup.string()
      .required(t("validation.required"))
      .min(9, t("validation.invalidPhone"))
      .max(10, t("validation.invalidPhone")),

    /* Passport number: exactly 8 characters, no other checks */
    passportNumber: Yup.string()
      .required(t("validation.required"))
      .length(8, t("validation.invalidPassport")),

    isActive: Yup.boolean().required(),

    photo: Yup.array()
      .of(Yup.mixed<File>())
      .test("photo-required-on-create", t("validation.photoRequired"), (arr) =>
        isEditMode ? true : Boolean(arr?.length)
      ),
  });

  const handleSubmit = async (values: RepresentativeFormValues) => {
    try {
      setIsSubmitting(true);

      if (isEditMode && representativeId) {
        await updateRepresentative(representativeId, values);
        onSubmit(true, t("updateSuccess"));
      } else {
        await createRepresentative(values);
        onSubmit(true, t("createSuccess"));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("unexpectedError");
      onSubmit(false, msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
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
              text={isEditMode ? t("editTitle") : t("addTitle")}
              showBackButton
              fallbackPath="/representatives"
              isEditing={isEditMode}
            />

            <div className="mt-6 space-y-6">
              {/* Row 1 – Name & Number */}
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
                  type="number"
                  startIcon={<FaPhone />}
                  helpertext={t("fields.numberPlaceholder")}
                />
              </div>

              {/* Row 2 – conditional layouts */}
              {isEditMode ? (
                /* Edit Mode: Passport + Active Toggle share one row */
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <FormInputIcon
                      name="passportNumber"
                      label={t("fields.passportNumber")}
                      type="text"
                      startIcon={<FaPassport />}
                      helpertext={t("fields.passportNumberPlaceholder")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg md:w-64">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("fields.isActive")}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t("fields.isActiveDescription")}
                      </p>
                    </div>
                    <Switch name="isActive" label="" />
                  </div>
                </div>
              ) : (
                /* Add Mode: Passport + Photo Uploader share one row */
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <FormInputIcon
                      name="passportNumber"
                      label={t("fields.passportNumber")}
                      type="text"
                      startIcon={<FaPassport />}
                      helpertext={t("fields.passportNumberPlaceholder")}
                    />
                  </div>

                  <div className="flex-1">
                    <DocumentUploader
                      name="photo"
                      maxFiles={1}
                      label={t("fields.photo")}
                    />
                  </div>
                </div>
              )}

              {/* Extra row: in edit mode we still need the uploader, but below */}
              {isEditMode && (
                <DocumentUploader
                  name="photo"
                  maxFiles={1}
                  label={t("fields.photo")}
                  initialPreviewUrl={initialPreviewUrl}
                  canView
                />
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-success-main text-white rounded-lg hover:bg-success-dark transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-success-light"
              >
                {t("cancelButton")}
              </button>
              <SubmitButton
                title={isEditMode ? t("updateButton") : t("createButton")}
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
