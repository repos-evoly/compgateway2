// =============================================================
// TabsWizard.tsx – v2
// • Adds reusable <BackButton> beside wizard controls
// =============================================================

"use client";

import React, { useState, useEffect } from "react";
import type { FormikProps } from "formik";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { useTranslations } from "next-intl";

import BackButton from "@/app/components/reusable/BackButton"; // NEW
import { ReviewStep } from "./ReviewStep";

type WizardStep = {
  title: string;
  component: React.ReactNode;
};

type TranslateFieldNameFn = (fieldName: string) => string;

type TabsWizardProps<FormValues extends Record<string, unknown>> = {
  steps: WizardStep[];
  formik: FormikProps<FormValues>;
  onSubmit: () => void;
  validateCurrentStep: (stepIndex: number) => Promise<boolean>;
  translateFieldName: TranslateFieldNameFn;
  readOnly?: boolean;
  /** true ⇒ editing mode (submit hidden) */
  isEditing?: boolean;
  /** Optional path if router.back() is not enough */
  backFallbackPath?: string; // NEW
  /** Optional custom back handler */
  onBackPage?: () => void; // NEW
};

export function TabsWizard<FormValues extends Record<string, unknown>>({
  steps: userSteps,
  formik,
  onSubmit,
  validateCurrentStep,
  translateFieldName,
  readOnly = false,
  isEditing = false,
  backFallbackPath, // NEW
  onBackPage, // NEW
}: TabsWizardProps<FormValues>) {
  const t = useTranslations("tabsWizard");

  /* ─── Steps (append review) ──────────────────────────────── */
  const allSteps: WizardStep[] = [
    ...userSteps,
    {
      title: t("review"),
      component: (
        <ReviewStep
          formik={formik}
          translateFieldName={translateFieldName}
          fieldsPerRow={3}
        />
      ),
    },
  ];

  /* ─── State ──────────────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRTL, setIsRTL] = useState(false);

  /* ─── Detect RTL ─────────────────────────────────────────── */
  useEffect(() => {
    const updateDir = () =>
      setIsRTL((document.dir || document.documentElement.dir) === "rtl");
    updateDir();

    const observer = new MutationObserver(updateDir);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, []);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === allSteps.length - 1;

  /* ─── Navigation helpers ─────────────────────────────────── */
  async function handleNext() {
    if (!isLastStep) {
      const valid = await validateCurrentStep(currentStep);
      if (!valid) return;
    }
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  }

  function handleStepClick(index: number) {
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
    }
  }

  /* ─── Progress width (0 .. 90 %) ─────────────────────────── */
  const progressWidth =
    currentStep === 0 ? "0" : `${(currentStep / (allSteps.length - 1)) * 90}%`;

  const BackIcon = isRTL ? FiChevronRight : FiChevronLeft;
  const NextIcon = isRTL ? FiChevronLeft : FiChevronRight;

  return (
    <div className={`flex flex-col w-full mt-5 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header with step circles */}
      <div className="flex flex-col w-full mb-8 relative">
        <div className="flex items-center justify-center w-full relative">
          {/* dashed track */}
          <div
            className="absolute border-t-2 border-dashed border-info-main z-0"
            style={{ left: "5%", right: "5%", width: "90%", top: "30%" }}
          />
          {/* filled progress */}
          <div
            className="absolute border-t-2 border-dashed border-info-dark z-0 transition-all duration-300"
            style={{
              left: isRTL ? "auto" : "5%",
              right: isRTL ? "5%" : "auto",
              width: progressWidth,
              top: "30%",
            }}
          />

          {/* circles */}
          <div className="flex justify-between items-center w-full relative z-10">
            {allSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(index);
              const isClickable = isActive || isCompleted;

              const base =
                "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white font-medium transition-all duration-300";
              const circle = isActive
                ? "bg-info-dark ring-4 ring-info-main ring-opacity-50"
                : isCompleted
                ? "bg-warning-light"
                : "bg-info-main";

              return (
                <div key={index} className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={(e) => {
                      e.preventDefault();
                      handleStepClick(index);
                    }}
                    className={`${base} ${circle} ${
                      !isClickable ? "cursor-not-allowed" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium text-center ${
                      isActive ? "text-info-dark" : "text-info-main"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="border border-info-main p-6 rounded-lg shadow-sm bg-white min-h-[300px] transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-info-dark">
          {allSteps[currentStep].title}
        </h2>
        {allSteps[currentStep].component}
      </div>
      {/* Footer buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton
          fallbackPath={backFallbackPath}
          onBack={onBackPage}
          label={t("backToPage")}
          isEditing={isEditing}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-info-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-warning-light hover:text-info-dark sm:w-auto sm:px-6"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {!isFirstStep && (
            <button
              type="button"
              onClick={handleBack}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-info-main px-4 py-2 text-sm font-semibold text-info-dark transition-colors duration-300 hover:bg-info-main hover:text-white sm:w-auto"
            >
              <BackIcon />
              {t("back")}
            </button>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-info-dark px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:opacity-90 sm:w-auto"
            >
              {t("next")}
              <NextIcon />
            </button>
          )}

          {!isLastStep && !readOnly && isEditing && (
            <button
              type="button"
              onClick={() => !formik.isSubmitting && onSubmit()}
              className={`flex w-full items-center justify-center gap-2 rounded-md bg-success-main px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:opacity-90 sm:w-auto ${
                formik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={formik.isSubmitting}
              aria-disabled={formik.isSubmitting}
              aria-busy={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  {t("submitting", { defaultValue: "Submitting..." })}
                </>
              ) : (
                t("submit")
              )}
            </button>
          )}

          {isLastStep && !readOnly && (
            <button
              type="button"
              onClick={() => !formik.isSubmitting && onSubmit()}
              className={`flex w-full items-center justify-center gap-2 rounded-md bg-success-main px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:opacity-90 sm:w-auto ${
                formik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={formik.isSubmitting}
              aria-disabled={formik.isSubmitting}
              aria-busy={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  {t("submitting", { defaultValue: "Submitting..." })}
                </>
              ) : (
                t("submit")
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
