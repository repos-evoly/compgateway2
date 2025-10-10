// app/[locale]/representatives/components/RepresentativesForm.tsx
// =============================================================
// RepresentativesForm.tsx
// • EDIT mode:
//     - Shows ONLY the representative photo (no DocumentUploader block)
//     - Photo card appears on the **visual left** of inputs in RTL (ar)
//       and on the left in LTR as well.
//     - Photo card has an Edit button to re-upload; selected file is sent
//       in FormData on submit (updateRepresentative receives Photo).
// • ADD mode: unchanged (uploader inline as before)
// =============================================================

"use client";

import React, { useState, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations, useLocale } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import Switch from "@/app/components/FormUI/Switch";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { DocumentUploader } from "@/app/components/reusable/DocumentUploader";

import { FaUser, FaPhone, FaPassport } from "react-icons/fa";

import { createRepresentative, updateRepresentative } from "../services";
import type { Representative, RepresentativeFormValues } from "../types";
import RepresentativePhotoCard from "./RepresentativePhotoCard";
import { buildImageProxyUrl } from "@/app/utils/imageProxy";

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
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData);

  /* Build preview URL for existing photo (edit mode only) */
  const initialPreviewUrl = useMemo(() => {
    if (!isEditMode || !initialData?.photoUrl) return undefined;
    return buildImageProxyUrl(initialData.photoUrl);
  }, [isEditMode, initialData?.photoUrl]);

  /* Formik */
  const initialValues: RepresentativeFormValues = {
    name: initialData?.name ?? "",
    number: initialData?.number ?? "",
    passportNumber: initialData?.passportNumber ?? "",
    isActive: initialData?.isActive ?? true,
    photo: [],
  };

  /* Validation */
  const validationSchema = Yup.object({
    name: Yup.string().required(t("validation.required")),
    number: Yup.string()
      .required(t("validation.required"))
      .min(9, t("validation.invalidPhone"))
      .max(10, t("validation.invalidPhone")),
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

  /* UI */
  return (
    <div className="p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form>
            <FormHeader
              text={isEditMode ? t("editTitle") : t("addTitle")}
              showBackButton
              fallbackPath="/representatives"
              isEditing={true}
            />

            {/* ====== EDIT MODE: PHOTO (LEFT) + FIELDS (RIGHT) ====== */}
            {isEditMode ? (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ensure photo is visually on the LEFT in RTL by ordering */}
                <div
                  className={`lg:col-span-1 ${
                    isRTL
                      ? "order-last lg:order-last"
                      : "order-first lg:order-first"
                  }`}
                >
                  <RepresentativePhotoCard
                    src={initialPreviewUrl}
                    title={t("fields.currentPhoto")}
                    onPick={(file) => {
                      // store into Formik as a single-element array so services sends it as Photo
                      setFieldValue("photo", file ? [file] : []);
                    }}
                  />
                </div>

                <div
                  className={`lg:col-span-2 ${
                    isRTL
                      ? "order-first lg:order-first"
                      : "order-last lg:order-last"
                  }`}
                >
                  <div className="space-y-6">
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

                    {/* NOTE: As requested, NO DocumentUploader block in edit mode.
                        The photo edit is handled by RepresentativePhotoCard. */}
                  </div>
                </div>
              </div>
            ) : (
              /* ====== ADD MODE: original layout (unchanged) ====== */
              <div className="mt-6 space-y-6">
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
              </div>
            )}

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
