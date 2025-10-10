/* --------------------------------------------------------------------------
   components/DocumentsSection.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { FiFile, FiDownload, FiEye, FiX, FiFileText } from "react-icons/fi";
import Image from "next/image";
import { Attachment } from "../types";
import { useTranslations } from "next-intl";
import { buildImageProxyUrl } from "@/app/utils/imageProxy";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
type DocumentsSectionProps = { documents: Attachment[] };

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  const [selectedDocument, setSelectedDocument] = useState<Attachment | null>(
    null
  );

  const t = useTranslations("profile.documentsSection");
  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  /** Build the full URL for a given attachment. */
  const buildUrl = (doc: Attachment): string =>
    buildImageProxyUrl(doc.attUrl);

  /** Check if an attachment is a PDF by its MIME-type. */
  const isPdf = (mime?: string): boolean =>
    !!mime && mime.toLowerCase().includes("pdf");

  /**
   * Preview logic:
   *  • PDFs open in a new tab.
   *  • Images open in the in-app modal.
   */
  const handlePreview = (doc: Attachment): void => {
    if (isPdf(doc.attMime)) {
      window.open(buildUrl(doc), "_blank");
    } else {
      setSelectedDocument(doc);
    }
  };

  /** Close the full-screen image preview modal. */
  const closePreview = (): void => {
    setSelectedDocument(null);
  };

  /** Force a download of PDFs as well as images. */
  const handleDownload = async (doc: Attachment): Promise<void> => {
    const docUrl = buildUrl(doc);
    const filename =
      doc.attOriginalFileName ??
      (isPdf(doc.attMime) ? "document.pdf" : "image.jpg");

    try {
      const res = await fetch(docUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 bg-info-main border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <FiFile className="w-5 h-5 text-info-dark" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-info-dark">
                {t("title")}
              </h2>
              <p className="text-sm text-info-dark">
                {documents.length} {t("numberOfDocuments")}
              </p>
            </div>
          </div>
        </div>

        {/* Documents list or placeholder */}
        <div className="p-6 overflow-y-hidden hover:overflow-y-auto max-h-[70vh]">
          {documents.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FiFile className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t("noDocs")}
                </h3>
              </div>
            </div>
          ) : (
            /* Documents list */
            <div className="space-y-4">
              {documents.map((doc) => {
                const pdf = isPdf(doc.attMime);

                return (
                  <div
                    key={doc.id}
                    className="group relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-white flex items-center justify-center">
                      {pdf ? (
                        <FiFileText className="w-16 h-16 text-gray-400 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={buildUrl(doc)}
                            alt={doc.attSubject}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                            title={t("preview")}
                          >
                            <FiEye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                            title={t("download")}
                          >
                            <FiDownload className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Document meta */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {doc.attSubject}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {doc.description || t("noDescription")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-screen image preview */}
      {selectedDocument && !isPdf(selectedDocument.attMime) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-full w-full h-full flex flex-col items-center justify-center p-4">
            {/* Close */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200"
            >
              <FiX className="w-6 h-6 text-white" />
            </button>

            {/* Title */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <h3 className="text-white font-medium">
                  {selectedDocument.attSubject}
                </h3>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={buildUrl(selectedDocument)}
                alt={selectedDocument.attSubject}
                fill
                unoptimized
                className="object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Download */}
            <button
              onClick={() => handleDownload(selectedDocument)}
              className="absolute bottom-4 left-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200"
            >
              <FiDownload className="w-4 h-4 text-white" />
              <span className="text-white font-medium">{t("download")}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
