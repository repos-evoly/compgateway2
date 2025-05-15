"use client";

import React, { useState, useEffect } from "react";
import type { FormikProps } from "formik";
import { FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";
import { ReviewStep } from "./ReviewStep";
import { useTranslations } from "next-intl";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
// ^ Path to your new SubmitButton file. Adjust if needed.

// 1) A type describing each step of the wizard.
type WizardStep = {
  title: string;
  component: React.ReactNode;
};

// 2) A function that translates a fieldName => label
type TranslateFieldNameFn = (fieldName: string) => string;

type TabsWizardProps<FormValues extends Record<string, unknown>> = {
  steps: WizardStep[];
  formik: FormikProps<FormValues>;
  onSubmit: () => void;
  validateCurrentStep: (stepIndex: number) => Promise<boolean>;
  /** We'll pass this to the final appended step. */
  translateFieldName: TranslateFieldNameFn;
};

export function TabsWizard<FormValues extends Record<string, unknown>>({
  steps: userSteps,
  formik,
  // onSubmit,
  validateCurrentStep,
  translateFieldName,
}: TabsWizardProps<FormValues>) {
  const t = useTranslations("tabsWizard"); // i18n from next-intl

  // We create an extra final step for "Review & Submit"
  const allSteps: WizardStep[] = [
    ...userSteps,
    {
      // Localized title for the review step
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

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRTL, setIsRTL] = useState(false);

  // Detect RTL direction
  useEffect(() => {
    const dir = document.dir || document.documentElement.dir;
    setIsRTL(dir === "rtl");

    const observer = new MutationObserver(() => {
      const newDir = document.dir || document.documentElement.dir;
      setIsRTL(newDir === "rtl");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => observer.disconnect();
  }, []);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === allSteps.length - 1;

  async function handleNext() {
    // Validate if not on final step
    if (!isLastStep) {
      const valid = await validateCurrentStep(currentStep);
      if (!valid) return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleStepClick(index: number) {
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
    }
  }

  // async function handleSubmit() {
  //   // Possibly do final validation on the review step
  //   const valid = await validateCurrentStep(currentStep);
  //   if (!valid) return;

  //   if (!completedSteps.includes(currentStep)) {
  //     setCompletedSteps([...completedSteps, currentStep]);
  //   }
  //   onSubmit();
  // }

  // The progress line from 0..90% as we go from step 0..(allSteps.length - 1).
  const progressWidth =
    currentStep === 0 ? "0" : `${(currentStep / (allSteps.length - 1)) * 90}%`;

  // Flip icons if RTL
  const BackIcon = isRTL ? FiChevronRight : FiChevronLeft;
  const NextIcon = isRTL ? FiChevronLeft : FiChevronRight;

  return (
    <div className={`flex flex-col w-full ${isRTL ? "rtl" : "ltr"}`}>
      {/* Step indicator header */}
      <div className="flex items-center justify-center w-full mb-8 relative">
        {/* Dashed background line */}
        <div
          className="absolute border-t-2 border-dashed border-info-main z-0"
          style={{
            left: "5%",
            right: "5%",
            width: "90%",
            top: "30%",
            transform: "translateY(-30%)",
          }}
        />

        {/* Filled progress line */}
        <div
          className="absolute border-t-2 border-dashed border-info-dark z-0 transition-all duration-300"
          style={{
            left: isRTL ? "auto" : "5%",
            right: isRTL ? "5%" : "auto",
            width: progressWidth,
            top: "30%",
            transform: "translateY(-30%)",
          }}
        />

        <div className="flex justify-between items-center w-full relative z-10">
          {allSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.includes(index);
            const isClickable = isActive || isCompleted;

            let circleClasses = "";
            if (isActive) {
              circleClasses =
                "bg-info-dark ring-4 ring-info-main ring-opacity-50";
            } else if (isCompleted) {
              circleClasses = "bg-warning-light";
            } else {
              circleClasses = "bg-info-main";
            }

            return (
              <div key={index} className="flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleStepClick(index);
                  }}
                  type="button"
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 
                    rounded-full text-white font-medium transition-all duration-300
                    ${circleClasses}
                    ${!isClickable ? "cursor-not-allowed" : ""}
                  `}
                >
                  {index + 1}
                </button>

                <span
                  className={`
                    mt-2 text-xs sm:text-sm font-medium max-w-[90px] sm:max-w-none 
                    text-center
                    ${isActive ? "text-info-dark" : "text-info-main"}
                  `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content panel */}
      <div className="border border-info-main p-6 rounded-lg shadow-sm bg-white min-h-[300px] transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-info-dark">
          {allSteps[currentStep].title}
        </h2>

        <div className="transition-opacity duration-300">
          {allSteps[currentStep].component}
        </div>
      </div>

      {/* Footer controls => both on the LEFT */}
      <div className="flex items-center gap-4 mt-6 justify-end">
        {/* Back button (if not first step) */}
        {!isFirstStep && (
          <button
            type="button"
            onClick={handleBack}
            className={`
              px-4 py-2 border border-info-main text-info-dark rounded-md 
              hover:bg-info-main hover:text-white transition-colors duration-300 
              flex items-center gap-2
            `}
          >
            <BackIcon />
            {t("back")}
          </button>
        )}

        {/* Next or Submit (side by side with Back) */}
        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className={`
              px-6 py-2 bg-info-dark text-white rounded-md hover:opacity-90 
              transition-colors duration-300 flex items-center gap-2
            `}
          >
            {t("next")}
            <NextIcon />
          </button>
        ) : (
          /**
           * Final step => Use your SubmitButton
           * We'll pass `isSubmitting={formik.isSubmitting}` to show spinner
           */
          <SubmitButton
            title={t("submit")}
            color="info-dark"
            fullWidth={false}
            isSubmitting={formik.isSubmitting}
            Icon={FiCheck}
          />
        )}
      </div>
    </div>
  );
}
