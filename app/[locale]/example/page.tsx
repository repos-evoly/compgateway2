/* --------------------------------------------------------------------------
 * app/[locale]/documents/upload/page.tsx              (Next .js App Router)
 * A self-contained page that uses <DocumentUploader> v6.
 * – Users pick up to 10 images / PDFs.
 * – Anything > 1 MB is auto-compressed to ≤ 1 MB (handled inside the component).
 * – Press “Merge & Download” → files are squashed into one compact PDF
 *   and downloaded locally.
 *   npm i formik yup pdf-lib pdfjs-dist             (plus your alias set-up)
 * ----------------------------------------------------------------------- */

"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

/* adjust the import path to where you saved the component */
import {
  DocumentUploader,
  mergeFilesToPdf,
} from "@/app/components/reusable/DocumentUploader";

/* --------------------------- validation schema -------------------------- */
const schema = Yup.object({
  documents: Yup.array()
    .of(Yup.mixed<File>().required())
    .min(1, "Select at least one file")
    .max(10, "Maximum 10 files"),
});

/* ------------------------------- helpers ------------------------------- */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------------------------- */
export default function UploadPage() {
  const [skipped, setSkipped] = useState<string[]>([]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload &amp; Merge Documents</h1>

      <Formik
        initialValues={{ documents: [] as File[] }}
        validationSchema={schema}
        onSubmit={async ({ documents }, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          try {
            const { blob, skipped } = await mergeFilesToPdf(documents);
            downloadBlob(blob, "merged.pdf");
            setSkipped(skipped);
            resetForm();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-4">
            {/* ---------- file picker ---------- */}
            <DocumentUploader
              name="documents"
              maxFiles={10}
              className="w-full"
            />

            {/* ---------- merge button ---------- */}
            <button
              type="submit"
              disabled={isSubmitting || values.documents.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded
                         hover:bg-green-700 disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Merging…" : "Merge & Download PDF"}
            </button>

            {/* ---------- feedback ---------- */}
            {skipped.length > 0 && (
              <p className="text-sm text-orange-600">
                Couldn’t include: {skipped.join(", ")}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
}
