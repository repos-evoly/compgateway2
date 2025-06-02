"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { FaUpload, FaCloudUploadAlt } from "react-icons/fa";

import AuthHeader from "../../components/AuthHeader";
import UploadCategory from "../components/UploadCategory";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { uploadDocuments } from "../services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

// We'll define a separate component for the main content.
function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const companyCode = searchParams.get("companyCode") ?? "";
  const email = searchParams.get("email") ?? "";

  type FormValues = {
    passportFiles: File[];
    birthCertificateFiles: File[];
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmModal = () => {
    setModalOpen(false);
    router.push("/auth/login");
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="تحميل المستندات"
        subtitle="سيتم إرسال هذه المستندات إلى البنك للمراجعة"
        icon={<FaUpload />}
      />

      <Formik<FormValues>
        initialValues={{
          passportFiles: [],
          birthCertificateFiles: [],
        }}
        onSubmit={async (values) => {
          try {
            await uploadDocuments(
              companyCode,
              email,
              values.passportFiles,
              values.birthCertificateFiles
            );

            setModalTitle("تم رفع المستندات");
            setModalMessage(
              "تم رفع المستندات بنجاح. هل تود الذهاب لصفحة تسجيل الدخول؟"
            );
            setModalSuccess(true);
            setModalOpen(true);
          } catch (error) {
            console.error("Error uploading documents:", error);

            setModalTitle("خطأ أثناء الرفع");
            setModalMessage("فشل في رفع المستندات. الرجاء المحاولة مرة أخرى.");
            setModalSuccess(false);
            setModalOpen(true);
          }
        }}
      >
        {({ values, setFieldValue }) => {
          const noFilesSelected =
            values.passportFiles.length === 0 &&
            values.birthCertificateFiles.length === 0;

          return (
            <Form className="w-full p-6 space-y-2" dir="rtl">
              <div className="mb-4 flex justify-end bg-info-dark p-3 rounded-xl">
                <SubmitButton
                  title="رفع المستندات والمتابعة"
                  Icon={FaCloudUploadAlt}
                  color="info-dark"
                  fullWidth={false}
                  disabled={noFilesSelected}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Passport Section */}
                <div className="flex-1">
                  <UploadCategory
                    title="جواز السفر"
                    subtitle="Passport Documentation"
                    description="يرجى رفع صور واضحة لجميع صفحات جواز السفر. تأكد من وضوح النص والصور."
                    files={values.passportFiles}
                    onChangeFiles={(newFiles) =>
                      setFieldValue("passportFiles", newFiles)
                    }
                  />
                </div>

                {/* Birth Certificate Section */}
                <div className="flex-1">
                  <UploadCategory
                    title="شهادة الميلاد المصدقة"
                    subtitle="Certified Birth Certificate"
                    description="يرجى رفع صور واضحة لشهادة الميلاد المصدقة من الجهات الرسمية."
                    files={values.birthCertificateFiles}
                    onChangeFiles={(newFiles) =>
                      setFieldValue("birthCertificateFiles", newFiles)
                    }
                  />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
}

// We wrap PageContent in Suspense to satisfy Next 13's requirement
// if it complains about needing a boundary around useSearchParams().
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
