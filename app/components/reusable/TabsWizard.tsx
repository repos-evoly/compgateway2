"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { FormikProps } from "formik";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ReviewStep } from "./ReviewStep";
import { useTranslations } from "next-intl";
import BackButton from "./BackButton";

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
  /**
   * If true => hide all navigation/submit controls.
   * For brevity, we won't implement readOnly in the code below,
   * but you can add it if needed.
   */
  readOnly?: boolean;
  fallbackPath?: string;
  isEditing?: boolean;
};

export function TabsWizard<FormValues extends Record<string, unknown>>({
  steps: userSteps,
  formik,
  // onSubmit,
  validateCurrentStep,
  translateFieldName,
  fallbackPath,
  isEditing,
}: TabsWizardProps<FormValues>) {
  const t = useTranslations("tabsWizard");

  // We create an extra final step for "Review & Submit"
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

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRTL, setIsRTL] = useState(false);

  // Check direction (RTL/LTR)
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

  // Validate current step => if valid => go next
  async function handleNext() {
    if (!isLastStep) {
      const valid = await validateCurrentStep(currentStep);
      if (!valid) return;
    }
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep((prev) => prev + 1);
  }

  // Go back to prev step
  function handleBack() {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  // Clicking step circle => jump if completed or same step
  function handleStepClick(index: number) {
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
    }
  }

  // Calculate horizontal progress from 0..90%
  const progressWidth =
    currentStep === 0 ? "0" : `${(currentStep / (allSteps.length - 1)) * 90}%`;

  // Flip icons if RTL
  const BackIcon = isRTL ? FiChevronRight : FiChevronLeft;
  const NextIcon = isRTL ? FiChevronLeft : FiChevronRight;

  return (
    <div className={`flex flex-col w-full ${isRTL ? "rtl" : "ltr"}`}>
      {/* Step header */}
      <div className="flex flex-col w-full mb-8 relative">
        <div className="flex items-center mb-4">
          <BackButton fallbackPath={fallbackPath} isEditing={isEditing} />
          <h2 className="text-lg font-medium text-info-dark ml-2">
            {t("steps")}
          </h2>
        </div>
        <div className="flex items-center justify-center w-full relative">
          {/* Dashed line */}
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

      {/* Footer => remove button on last page. So the last step has *no* button. */}
      <div className="flex items-center gap-4 mt-6 justify-end">
        {/* If not first step => show Back */}
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

        {/* If not last step => show Next; if last step => show nothing */}
        {!isLastStep && (
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
        )}
      </div>
    </div>
  );
}
