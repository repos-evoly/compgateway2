// =============================================================
// DocumentUploader.tsx  – Compact Version
// • Minimal space usage for form integration
// • Expandable file list when files are present
// • All compression functionality preserved
// =============================================================

"use client";

import { ChangeEvent, useState } from "react";
import { useField } from "formik";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker as string;

const ACCEPT =
  "application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif";
const LIMIT_MB = 1;
const LIMIT_BYTES = LIMIT_MB * 1024 * 1024;

export interface DocumentUploaderProps {
  name: string;
  maxFiles: number;
  className?: string;
  label?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  name,
  maxFiles,
  className,
  label = "Documents",
}) => {
  const [field, meta, helpers] = useField<File[]>({ name });
  const files = field.value ?? [];
  const [notice, setNotice] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;

    const allowed: File[] = [];
    const rejected: string[] = [];

    picked.forEach((f) =>
      f.size <= LIMIT_BYTES * 25 ? allowed.push(f) : rejected.push(f.name)
    );

    setNotice(rejected.length ? `${rejected.join(", ")} too large` : null);

    helpers.setValue([...files, ...allowed].slice(0, maxFiles));
    if (allowed.length > 0) setShowFiles(true);
  };

  const removeAt = (idx: number) => {
    const next = [...files];
    next.splice(idx, 1);
    helpers.setValue(next);
    if (next.length === 0) setShowFiles(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return (
        <div className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
          P
        </div>
      );
    }
    return (
      <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
        I
      </div>
    );
  };

  const error = meta.error as string | undefined;

  return (
    <div className={className}>
      <div className="space-y-2">
        {/* Compact Upload Button */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="relative">
            <input
              type="file"
              accept={ACCEPT}
              multiple
              onChange={onChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              type="button"
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Files
            </button>
          </div>

          {files.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {files.length}/{maxFiles} files
              </span>
              <button
                type="button"
                onClick={() => setShowFiles(!showFiles)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showFiles ? "Hide" : "Show"}
              </button>
            </div>
          )}
        </div>

        {/* Compact File List */}
        {files.length > 0 && showFiles && (
          <div className="bg-gray-50 rounded p-3 space-y-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-gray-500">
                    ({formatSize(file.size)})
                  </span>
                  {file.size > LIMIT_BYTES && (
                    <span className="text-amber-600">*</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {files.some((f) => f.size > LIMIT_BYTES) && (
              <div className="text-xs text-amber-600 pt-1 border-t">
                * Will be compressed to 1MB
              </div>
            )}
          </div>
        )}

        {/* Compact Alerts */}
        {notice && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {notice}
          </div>
        )}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                       COMPRESSION + MERGING UTILITIES                      */
/* -------------------------------------------------------------------------- */
async function compressImage(
  file: File,
  limitBytes = LIMIT_BYTES,
  maxSide = 1800
): Promise<Uint8Array> {
  if (file.size <= limitBytes && file.type === "image/jpeg") {
    return new Uint8Array(await file.arrayBuffer());
  }

  const bmp = await createImageBitmap(file);
  const ratio = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * ratio);
  const h = Math.round(bmp.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);

  let q = 0.9;
  const minQ = 0.25;
  let blob: Blob;

  do {
    blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b as Blob), "image/jpeg", q)
    );
    if (blob.size <= limitBytes || q <= minQ) break;
    q -= 0.05;
  } while (true);

  return new Uint8Array(await blob.arrayBuffer());
}

async function rasterisePdfToJpegs(
  file: File,
  limitBytes = LIMIT_BYTES
): Promise<Uint8Array[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const perPageBudget = Math.floor((limitBytes * 0.95) / doc.numPages);
  const pages: Uint8Array[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport })
      .promise;

    let q = 0.9;
    const minQ = 0.25;
    let blob: Blob;
    do {
      blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b as Blob), "image/jpeg", q)
      );
      if (blob.size <= perPageBudget || q <= minQ) break;
      q -= 0.05;
    } while (true);

    pages.push(new Uint8Array(await blob.arrayBuffer()));
  }
  return pages;
}

export async function mergeFilesToPdf(
  files: File[],
  limitMB = LIMIT_MB
): Promise<{ blob: Blob; skipped: string[] }> {
  const limitBytes = limitMB * 1024 * 1024;
  const merged = await PDFDocument.create();
  const skipped: string[] = [];

  for (const f of files) {
    if (f.type === "application/pdf") {
      try {
        if (f.size <= limitBytes) {
          const src = await PDFDocument.load(await f.arrayBuffer());
          const copied = await merged.copyPages(src, src.getPageIndices());
          copied.forEach((p) => merged.addPage(p));
        } else {
          const jpegPages = await rasterisePdfToJpegs(f, limitBytes);
          for (const jpegBytes of jpegPages) {
            const img = await merged.embedJpg(jpegBytes);
            merged.addPage([img.width, img.height]).drawImage(img, {
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
            });
          }
        }
      } catch {
        skipped.push(f.name);
      }
      continue;
    }

    if (f.type.startsWith("image/")) {
      try {
        const imgBytes = await compressImage(f, limitBytes);
        const img = await merged.embedJpg(imgBytes);
        merged.addPage([img.width, img.height]).drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      } catch {
        skipped.push(f.name);
      }
    } else {
      skipped.push(f.name);
    }
  }

  const bytes = Uint8Array.from(await merged.save());
  return { blob: new Blob([bytes], { type: "application/pdf" }), skipped };
}
