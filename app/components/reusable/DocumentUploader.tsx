// =============================================================
// DocumentUploader.tsx – v10 (Next-Image compliant)
// • Label lives inside the drop-zone
// • After first pick → drop-zone hides, “+” button appears
// • “+” disappears at maxFiles; reappears if files removed
// • Previews rendered with next/image (unoptimized) to avoid build errors
// • React-Icons only, strict types, 1 MB rule preserved
// =============================================================

"use client";

import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  DragEvent,
  HTMLAttributes,
} from "react";
import Image from "next/image";
import { useField } from "formik";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import {
  FiUpload,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiImage,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker as string;

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */
const ACCEPT =
  "application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif" as const;
const LIMIT_MB = 1;
const LIMIT_BYTES = LIMIT_MB * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
export type DocumentUploaderProps = {
  name: string;
  maxFiles: number;
  className?: string;
  label?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export const DocumentUploader = ({
  name,
  maxFiles,
  className,
  label = "Documents",
}: DocumentUploaderProps) => {
  /* ---------- Formik ---------- */
  const [field, meta, helpers] = useField<File[]>({ name });
  const files = field.value ?? [];

  /* ---------- State ---------- */
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /* ---------- Refs ---------- */
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- Clean up Object URLs ---------- */
  useEffect(
    () => () =>
      previews.forEach(
        (url) => url && url.startsWith("blob:") && URL.revokeObjectURL(url)
      ),
    [previews]
  );

  /* ---------------------------------------------------------------- */
  /* File ingestion                                                    */
  /* ---------------------------------------------------------------- */
  const handleFiles = async (picked: File[]) => {
    if (picked.length === 0) return;

    const allowed: File[] = [];
    const rejected: string[] = [];
    const newPrev: (string | null)[] = [];

    for (const f of picked) {
      if (f.size > LIMIT_BYTES * 25) {
        rejected.push(f.name);
        continue;
      }
      allowed.push(f);
      newPrev.push(await generatePreview(f));
    }

    setNotice(rejected.length ? `${rejected.join(", ")} too large` : null);

    const nextFiles = [...files, ...allowed].slice(0, maxFiles);
    const nextPrev = [...previews, ...newPrev].slice(0, maxFiles);

    helpers.setValue(nextFiles);
    setPreviews(nextPrev);
    if (nextFiles.length > 0) setShowFiles(true);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []));
    e.target.value = ""; // allow same file re-select later
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const openDialog = () => inputRef.current?.click();

  /* ---------------------------------------------------------------- */
  /* Remove one                                                       */
  /* ---------------------------------------------------------------- */
  const removeAt = (idx: number) => {
    const nextFiles = [...files];
    const nextPrev = [...previews];

    const url = nextPrev[idx];
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);

    nextFiles.splice(idx, 1);
    nextPrev.splice(idx, 1);

    helpers.setValue(nextFiles);
    setPreviews(nextPrev);
    if (nextFiles.length === 0) setShowFiles(false);
  };

  /* ---------------------------------------------------------------- */
  /* Helpers                                                          */
  /* ---------------------------------------------------------------- */
  const formatSize = (b: number): string =>
    b < 1024
      ? `${b} B`
      : b < 1_048_576
      ? `${Math.round(b / 1024)} KB`
      : `${(b / 1_048_576).toFixed(1)} MB`;

  const error = meta.error as string | undefined;

  /* ---------------------------------------------------------------- */
  /* Drop-zone                                                         */
  /* ---------------------------------------------------------------- */
  const DropZone = (props: HTMLAttributes<HTMLDivElement>) => (
    <div
      {...props}
      className={`relative flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-3 text-xs transition ${
        dragActive ? "border-primary bg-primary/10" : "border-gray-300"
      }`}
      onClick={openDialog}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
    >
      <FiUpload className="h-4 w-4 opacity-70" />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[10px] opacity-80">
        Click or drop&nbsp;({maxFiles} max)
      </span>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* UI                                                               */
  /* ---------------------------------------------------------------- */
  return (
    <div className={className}>
      {/* hidden input (for drop-zone and “+” button) */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={onInputChange}
        className="hidden"
      />

      {/* initial drop-zone */}
      {files.length === 0 && <DropZone />}

      {/* meta row */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {files.length}/{maxFiles}
          </span>

          <button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
          >
            {showFiles ? (
              <>
                <FiChevronUp className="h-3 w-3" />
                Hide
              </>
            ) : (
              <>
                <FiChevronDown className="h-3 w-3" />
                Show
              </>
            )}
          </button>

          {files.length < maxFiles && (
            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>
      )}

      {/* file list */}
      {files.length > 0 && showFiles && (
        <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded bg-gray-50 p-2 text-xs">
          {files.map((file, i) => {
            const previewSrc = previews[i];
            return (
              <li key={`${file.name}-${i}`} className="flex items-center gap-2">
                {/* preview */}
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt={file.name}
                    width={32}
                    height={32}
                    className="rounded-sm border object-cover"
                    unoptimized
                  />
                ) : file.type === "application/pdf" ? (
                  <FiFileText className="h-8 w-8 flex-shrink-0 text-red-500" />
                ) : (
                  <FiImage className="h-8 w-8 flex-shrink-0 text-blue-500" />
                )}

                {/* name & size */}
                <div className="flex-1 truncate">
                  <span className="truncate font-medium">{file.name}</span>{" "}
                  <span className="text-gray-500">
                    ({formatSize(file.size)})
                  </span>
                  {file.size > LIMIT_BYTES && (
                    <span className="ml-0.5 text-amber-600">*</span>
                  )}
                </div>

                {/* remove */}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
          {files.some((f) => f.size > LIMIT_BYTES) && (
            <p className="pt-1 text-[10px] text-amber-600">
              * files &gt; 1 MB will be compressed
            </p>
          )}
        </ul>
      )}

      {/* alerts */}
      {notice && (
        <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                       PREVIEW / COMPRESSION UTILITIES                      */
/* -------------------------------------------------------------------------- */
const generatePreview = async (file: File): Promise<string | null> => {
  if (file.type.startsWith("image/")) return URL.createObjectURL(file);

  if (file.type === "application/pdf") {
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.25 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport })
        .promise;
      return canvas.toDataURL("image/jpeg");
    } catch {
      return null;
    }
  }
  return null;
};

/* ---------------- compression & merge helpers (unchanged) ---------------- */
type Uint8ArrayPromise = Promise<Uint8Array>;

const compressImage = async (
  file: File,
  limitBytes: number = LIMIT_BYTES,
  maxSide: number = 1800
): Uint8ArrayPromise => {
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
};

const rasterisePdfToJpegs = async (
  file: File,
  limitBytes: number = LIMIT_BYTES
): Promise<Uint8Array[]> => {
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
};

export const mergeFilesToPdf = async (
  files: File[],
  limitMB: number = LIMIT_MB
): Promise<{ blob: Blob; skipped: string[] }> => {
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
            merged
              .addPage([img.width, img.height])
              .drawImage(img, {
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
        merged
          .addPage([img.width, img.height])
          .drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } catch {
        skipped.push(f.name);
      }
    } else {
      skipped.push(f.name);
    }
  }

  const bytes = Uint8Array.from(await merged.save());
  return { blob: new Blob([bytes], { type: "application/pdf" }), skipped };
};
