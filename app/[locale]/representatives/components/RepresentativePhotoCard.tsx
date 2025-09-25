"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FiEye, FiDownload, FiX, FiImage, FiEdit } from "react-icons/fi";

type RepresentativePhotoCardProps = {
  src?: string | null;
  title?: string;
  className?: string;
  /** Called when user picks a new image; pass the file upward (Formik will store it). */
  onPick?: (file: File | null) => void;
};

export default function RepresentativePhotoCard({
  src,
  title = "Representative Photo",
  className,
  onPick,
}: RepresentativePhotoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(
    typeof src === "string" && src.trim().length > 0 ? src : null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // update preview when src prop changes (e.g., initial load)
    setLocalPreview(
      typeof src === "string" && src.trim().length > 0 ? src : null
    );
  }, [src]);

  // cleanup object URLs if any
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const hasSrc =
    typeof localPreview === "string" && localPreview.trim().length > 0;

  const handlePreview = () => {
    if (!hasSrc) return;
    setModalOpen(true);
  };

  const handleDownload = () => {
    if (!hasSrc || !localPreview) return;
    const a = document.createElement("a");
    a.href = localPreview;
    a.download = "representative-photo.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerPick = () => {
    inputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // Preview
    const url = URL.createObjectURL(f);
    // Revoke old blob if present
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(url);
    // lift to parent (Formik will store in values.photo[0])
    onPick?.(f);
    // reset input so picking same file again still triggers change
    e.currentTarget.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${
          className ?? ""
        }`}
      >
        <div className="aspect-[4/3] relative flex items-center justify-center bg-gray-50">
          {hasSrc ? (
            <Image
              src={localPreview as string}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FiImage className="w-12 h-12" />
              <span className="mt-2 text-sm">No photo</span>
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerPick}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                title="Edit"
              >
                <FiEdit className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                title="Preview"
                disabled={!hasSrc}
              >
                <FiEye className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                title="Download"
                disabled={!hasSrc}
              >
                <FiDownload className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h3>
          {/* If a new file was picked (blob preview), hint that it will be saved on Update */}
          {localPreview?.startsWith("blob:") && (
            <p className="mt-1 text-xs text-amber-700">
              New image selected — it will be uploaded on save.
            </p>
          )}
        </div>
      </div>

      {/* Modal preview */}
      {modalOpen && hasSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={localPreview as string}
              alt={title}
              fill
              unoptimized
              className="object-contain rounded-lg shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute -top-3 -right-3 rounded-full bg-white p-1.5 text-black shadow"
              aria-label="Close"
              title="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
