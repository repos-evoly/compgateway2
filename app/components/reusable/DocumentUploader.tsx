// =============================================================
// DocumentUploader.tsx – v19
// • Modal preview now limited to 50 % of viewport (less blur)
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
  FiImage,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiX,
  FiEdit,
  FiDownload,
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
  initialPreviewUrl?: string;
  initialPreviewUrls?: string[]; // Added for multiple initial preview URLs
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canDownload?: boolean;
  disabled?: boolean;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export const DocumentUploader = ({
  name,
  maxFiles,
  className,
  label = "Documents",
  initialPreviewUrl,
  initialPreviewUrls,
  canView,
  canEdit,
  canDelete,
  canDownload,
  disabled,
}: DocumentUploaderProps) => {
  /* ---------- Action guards ---------- */
  const allowView = Boolean(canView);
  const allowEdit = Boolean(canEdit);
  const allowDelete = Boolean(canDelete);
  const allowDownload = Boolean(canDownload);

  /* ---------- Formik ---------- */
  const [field, meta, helpers] = useField<File[]>({ name });
  const files = field.value ?? [];

  /* ---------- State ---------- */
  // Initialize previews with initialPreviewUrls or initialPreviewUrl
  const initialPreviews = initialPreviewUrls || (initialPreviewUrl ? [initialPreviewUrl] : []);
  const [previews, setPreviews] = useState<(string | null)[]>(initialPreviews);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(Boolean(initialPreviews.length));
  const [dragActive, setDragActive] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  /* ---------- Refs ---------- */
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- Cleanup ---------- */
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

    if (editIdx !== null) {
      const nextPrev = [...previews];
      const nextFiles = [...files];

      const initialCount = initialPreviewUrls?.length || (initialPreviewUrl ? 1 : 0);
      if (editIdx < initialCount) {
        nextPrev[editIdx] = newPrev[0];
      } else {
        const fileOffset = editIdx - initialCount;
        nextFiles[fileOffset] = allowed[0];
        nextPrev[editIdx] = newPrev[0];
      }

      helpers.setValue(nextFiles);
      setPreviews(nextPrev);
      setEditIdx(null);
      return;
    }

    const nextFiles = [...files, ...allowed].slice(0, maxFiles);
    const nextPrev = [...previews.filter(Boolean), ...newPrev].slice(
      0,
      maxFiles
    );

    helpers.setValue(nextFiles);
    setPreviews(nextPrev);
    setShowFiles(true);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const openDialog = () => inputRef.current?.click();
  const startEdit = (idx: number) => {
    setEditIdx(idx);
    openDialog();
  };

  /* ---------------------------------------------------------------- */
  /* Remove                                                            */
  /* ---------------------------------------------------------------- */
  const removeAt = (idx: number) => {
    const nextFiles = [...files];
    const nextPrev = [...previews];

    const initialCount = initialPreviewUrls?.length || (initialPreviewUrl ? 1 : 0);
    if (idx >= initialCount) {
      const fileIdx = idx - initialCount;
      nextFiles.splice(fileIdx, 1);
      helpers.setValue(nextFiles);
    }

    const url = nextPrev[idx];
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);

    nextPrev.splice(idx, 1);
    setPreviews(nextPrev);
    if (nextPrev.length === 0) setShowFiles(false);
  };

  /* Helpers --------------------------------------------------------- */
  const formatSize = (b: number): string =>
    b < 1024
      ? `${b} B`
      : b < 1_048_576
      ? `${Math.round(b / 1024)} KB`
      : `${(b / 1_048_576).toFixed(1)} MB`;

  /* Drop‑zone component -------------------------------------------- */
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
        Click or drop&nbsp;({maxFiles} max)
      </span>
    </div>
  );

  /* UI -------------------------------------------------------------- */
  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={editIdx === null}
        onChange={onInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!disabled && previews.length === 0 && <DropZone />}
      {disabled && previews.length === 0 && (
        <div className="relative flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-3 text-xs border-gray-300 bg-gray-50">
          <FiUpload className="h-4 w-4 opacity-50" />
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <span className="text-[10px] opacity-60 text-gray-400">
            Read-only mode
          </span>
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {previews.length}/{maxFiles}
          </span>
          <button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
          >
            {showFiles ? (
              <>
                <FiChevronUp className="h-3 w-3" /> Hide
              </>
            ) : (
              <>
                <FiChevronDown className="h-3 w-3" /> Show
              </>
            )}
          </button>
          {!disabled && allowEdit && previews.length < maxFiles && (
            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="h-3 w-3" /> Add
            </button>
          )}
        </div>
      )}

      {previews.length > 0 && showFiles && (
        <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded bg-gray-50 p-2 text-xs">
          {previews.map((src, i) => {
            const initialCount = initialPreviewUrls?.length || (initialPreviewUrl ? 1 : 0);
            const isInitial = i < initialCount;
            const fileIdx = isInitial ? -1 : i - initialCount;
            const fileObj = fileIdx >= 0 ? files[fileIdx] : null;
            const isPdf = fileObj?.type === "application/pdf";

            const handleOpen = () => {
              if (!allowView || !src) return;
              if (isPdf && fileObj) {
                const pdfUrl = URL.createObjectURL(fileObj);
                window.open(pdfUrl, "_blank", "noopener,noreferrer");
              } else {
                setModalUrl(src);
              }
            };

            const downloadHref =
              isPdf && fileObj ? URL.createObjectURL(fileObj) : src;

            return (
              <li key={src ?? i} className="flex items-center gap-2">
                {src ? (
                  allowView ? (
                    <button
                      type="button"
                      onClick={handleOpen}
                      className="rounded-sm border focus:outline-none"
                    >
                      <Image
                        src={src}
                        alt="preview"
                        width={32}
                        height={32}
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ) : (
                    <div className="rounded-sm border">
                      <Image
                        src={src}
                        alt="preview"
                        width={32}
                        height={32}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )
                ) : (
                  <FiImage className="h-8 w-8 flex-shrink-0 text-blue-500" />
                )}

                <div className="flex-1 truncate">
                  {src?.startsWith("blob:") ? (
                    <>
                      <span className="truncate font-medium">
                        {fileObj?.name ?? "file"}
                      </span>{" "}
                      {fileObj && (
                        <span className="text-gray-500">
                          ({formatSize(fileObj.size)})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-medium">
                      {isPdf ? "current-document" : "current-photo"}
                    </span>
                  )}
                </div>

                {src && allowView && (
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="hover:text-blue-700"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                )}
                {src && allowDownload && (
                  <a
                    href={downloadHref ?? undefined}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-800"
                  >
                    <FiDownload className="h-4 w-4" />
                  </a>
                )}
                {src && allowEdit && (
                  <button
                    type="button"
                    onClick={() => startEdit(i)}
                    className="hover:text-amber-700"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                )}
                {allowDelete && (
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
          {files.some((f) => f.size > LIMIT_BYTES) && (
            <p className="pt-1 text-[10px] text-amber-600">
              * files &gt; 1 MB will be compressed
            </p>
          )}
        </ul>
      )}

      {notice && (
        <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
          {notice}
        </p>
      )}
      {meta.error && (
        <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
          {meta.error as string}
        </p>
      )}

      {modalUrl && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="relative" style={{ width: "50vw", height: "50vh" }}>
            <Image
              src={modalUrl}
              alt="large preview"
              fill
              className="object-contain rounded-lg"
              unoptimized
              sizes="50vw"
            />
            <button
              type="button"
              onClick={() => setModalUrl(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-black shadow"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
 * PREVIEW / COMPRESSION UTILITIES
 * ----------------------------------------------------------------------- */
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
