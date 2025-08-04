/* --------------------------------------------------------------------------
   components/LogoUploader.tsx
   – In-browser square-cropper that exports a 256 × 256 PNG.
   – Uses react-easy-crop. No <any>, no interface.
   -------------------------------------------------------------------------- */
"use client";

import React, { useCallback, useRef, useState, ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import {
  FiUpload,
  FiCheck,
  FiX,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Props = {
  /** Existing logo (absolute URL) or undefined. */
  initialUrl?: string;
  /** Called with the final 256 × 256 dataURL when the user clicks Save. */
  onSave: (dataUrl: string) => Promise<void>;
  /** Optional: show a toast or state outside while upload is pending. */
  onCancel?: () => void;
};

/* ---------- helper to create an HTMLImage from a blob URL ---------- */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });

/* ---------- helper that returns a 256×256 dataURL ------------------ */
const getCroppedImage = async (
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const size = 256;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, size, size);

  /* Draw cropped square scaled down/up to 256×256 */
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    size,
    size
  );

  return canvas.toDataURL("image/png", 0.92);
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function LogoUploader({ initialUrl, onSave, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  /* local URL of selected file */
  const [imageSrc, setImageSrc] = useState<string | undefined>(initialUrl);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedPixels, setCroppedPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  /* ---------- handle file selection ---------- */
  const onFileChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      alert("Please select a PNG, JPG, or WEBP image");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  /* ---------- crop complete callback ---------- */
  const onCropComplete = useCallback(
    (
      _: unknown,
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => setCroppedPixels(croppedAreaPixels),
    []
  );

  /* ---------- save cropped ---------- */
  const handleSave = async (): Promise<void> => {
    if (!imageSrc || !croppedPixels) return;
    const dataUrl = await getCroppedImage(imageSrc, crop, zoom, croppedPixels);
    await onSave(dataUrl);
  };

  /* ---------- reset ---------- */
  const reset = (): void => {
    if (imageSrc?.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
    setImageSrc(undefined);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedPixels(null);
    onCancel?.();
  };

  return (
    <div className="w-full">
      {/* File input – hidden */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {/* If no image chosen yet -------------------------------------- */}
      {!imageSrc ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-info-main text-white rounded-xl hover:bg-info-dark transition"
        >
          <FiUpload className="w-5 h-5" />
          <span>Upload Logo (PNG/JPG)</span>
        </button>
      ) : (
        /* Cropper & controls ---------------------------------------- */
        <div className="relative h-72 w-full bg-gray-100 rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
          />

          {/* Controls */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white/70 backdrop-blur rounded-lg p-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCrop({ x: 0, y: 0 })}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FiRotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow"
              title="Save"
            >
              <FiCheck className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={reset}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow"
              title="Cancel"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
