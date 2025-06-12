"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import { FaUpload, FaCloudUploadAlt } from "react-icons/fa";

import AuthHeader from "../../../components/AuthHeader";
import UploadCategory from "../../components/UploadCategory";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import StatusMessage from "../../components/StatusMessage"; // <-- Import your reusable component

import {
  uploadDocuments,
  getCompanyAttachments,
  deleteAttachment,
} from "../../services";
import ExistingAttachmentsList from "../../components/ExistingAttachmentsList";

import type { TAttachment } from "../../types";

function IDUploadPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // "id" from dynamic route => /auth/register/uploadDocuments/[id]
  const companyCode = params.id ?? "";

  // Possibly read "email" from query param => ?email=user@example.com
  const email = searchParams.get("email") ?? "";

  // If the user was redirected with a message => ?msg=encodedMsg
  const statusMessage = searchParams.get("msg") || "";

  type FormValues = {
    passportFiles: File[];
    birthCertificateFiles: File[];
  };

  // State for existing attachments
  const [attachments, setAttachments] = useState<TAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState<boolean>(true);
  const [attachmentsError, setAttachmentsError] = useState<string>("");

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmModal = () => {
    setModalOpen(false);
    router.push("/auth/login");
  };

  // Fetch existing attachments on mount
  useEffect(() => {
    if (!companyCode) {
      setAttachmentsError("No company code found in route params.");
      setLoadingAttachments(false);
      return;
    }

    async function fetchAttachments() {
      try {
        console.log("Fetching attachments for company code:", companyCode);
        const data = await getCompanyAttachments(companyCode as string);
        console.log("Fetched attachments:", data);
        setAttachments(data);
      } catch (err) {
        if (err instanceof Error) {
          setAttachmentsError(err.message);
        } else {
          setAttachmentsError("Failed to load attachments.");
        }
      } finally {
        setLoadingAttachments(false);
      }
    }

    fetchAttachments();
  }, [companyCode]);

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    console.log("Delete requested for attachment ID:", attachmentId);
    try {
      await deleteAttachment(companyCode as string, attachmentId);
      setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
      alert("تم حذف المرفق بنجاح");
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert("حدث خطأ أثناء حذف المرفق. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="تحميل المستندات"
        subtitle="سيتم إرسال هذه المستندات إلى البنك للمراجعة"
        icon={<FaUpload />}
      />

      {/* Display the statusMessage using the reusable component */}
      {statusMessage && (
        <StatusMessage message={decodeURIComponent(statusMessage)} />
      )}

      {loadingAttachments ? (
        <div className="p-4 text-gray-500">جاري تحميل المرفقات...</div>
      ) : attachmentsError ? (
        <div className="p-4 text-red-600">
          حدث خطأ أثناء جلب المرفقات: {attachmentsError}
        </div>
      ) : (
        <ExistingAttachmentsList
          attachments={attachments}
          onDelete={handleDeleteAttachment}
        />
      )}

      <Formik<FormValues>
        initialValues={{
          passportFiles: [],
          birthCertificateFiles: [],
        }}
        onSubmit={async (values) => {
          try {
            await uploadDocuments(
              companyCode as string,
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

// We wrap PageContent in Suspense to satisfy Next 13's requirement (if using the App Router)
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IDUploadPageContent />
    </Suspense>
  );
}
