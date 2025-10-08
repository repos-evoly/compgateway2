/* --------------------------------------------------------------------------
   components/SingleCompanyPage/HeaderSection.tsx
   – Logo uploader / cropper with “Replace” button inside modal.
   -------------------------------------------------------------------------- */
"use client";

import React, {
  JSX,
  useState,
  useRef,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import NextImage from "next/image";
import Cropper from "react-easy-crop";
import {
  FiUpload,
  FiCheck,
  FiX,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

import type { Company } from "../types";
import {
  deleteAttachment,
  uploadSingleDocument,
} from "@/app/auth/register/services";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const getCropped = async (
  src: string,
  area: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const image = await loadImage(src);
  const SIZE = 256;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  canvas.width = SIZE;
  canvas.height = SIZE;
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    SIZE,
    SIZE
  );
  return canvas.toDataURL("image/png", 0.92);
};

/* ------------------------------------------------------------------ */
type HeaderSectionProps = {
  company: Company;
  getStatusBadge: (status: string) => JSX.Element;
  initialLogoUrl?: string | null;
  logoId?: string | null;
};

/* ------------------------------------------------------------------ */
export default function HeaderSection({
  company,
  getStatusBadge,
  initialLogoUrl = null,
  logoId = null,
}: HeaderSectionProps): JSX.Element {
  const t = useTranslations("profile.headerSection");

  console.log("initialLogoUrl:", initialLogoUrl);
  console.log("logoId:", logoId);
  /* logo preview & id */
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [currentLogoId, setCurrentLogoId] = useState<string | null>(logoId);

  /* modal & cropper state */
  const [modalOpen, setModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedArea, setCroppedArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  /* refs */
  const inputRef = useRef<HTMLInputElement>(null);

  /* cleanup blob URLs */
  useEffect(
    () => () => {
      if (fileUrl?.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    },
    [fileUrl]
  );

  /* pick file */
  const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      alert("PNG, JPG, or WEBP required");
      return;
    }
    setSelectedFile(file);
    setFileUrl(URL.createObjectURL(file));
    if (!modalOpen) setModalOpen(true);
  };

  /* crop complete */
  const onCropComplete = useCallback(
    (
      _: unknown,
      area: { x: number; y: number; width: number; height: number }
    ) => setCroppedArea(area),
    []
  );

  /* save logo & upload */
  const saveLogo = async (): Promise<void> => {
    if (!fileUrl || !croppedArea || !selectedFile) return;
    const preview = await getCropped(fileUrl, croppedArea);
    setLogoUrl(preview);
    setModalOpen(false);

    /* company code from cookies */
    const raw = Cookies.get("companyCode") ?? "";
    const code = decodeURIComponent(raw).replace(/^"|"$/g, "");
    if (!code) return;

    try {
      if (currentLogoId) {
        await deleteAttachment(code, currentLogoId);
        setCurrentLogoId(null);
      }
      const newId = await uploadSingleDocument(code, selectedFile);
      if (newId) {
        setCurrentLogoId(newId);
      }
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Failed to upload new company logo"
      );
    }
  };

  /* open cropper */
  const openUploader = (): void => {
    if (logoUrl) {
      setFileUrl(logoUrl);
      setModalOpen(true);
    } else {
      inputRef.current?.click();
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* hidden input for new selections */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {/* header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={openUploader}
                className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-info-dark group"
              >
                {logoUrl ? (
                  <NextImage
                    src={logoUrl}
                    alt="Company logo"
                    width={48}
                    height={48}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FiUpload className="text-white text-xl group-hover:scale-110 transition" />
                )}
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-500">
                    {t("code")} {company.code}
                  </span>
                  {getStatusBadge(company.registrationStatus)}
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <HiOutlineOfficeBuilding className="text-info-dark text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {modalOpen && fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Adjust Logo</h3>
              <div className="flex gap-2">
                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Choose another image"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Close"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative w-full h-72 bg-gray-100 rounded-md overflow-hidden">
              <Cropper
                image={fileUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  aria-label="Zoom out"
                >
                  <FiZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  aria-label="Zoom in"
                >
                  <FiZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCrop({ x: 0, y: 0 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  aria-label="Reset crop"
                >
                  <FiRotateCw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={saveLogo}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1"
              >
                <FiCheck className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
