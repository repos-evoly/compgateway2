"use client";

import React, { useState } from "react";
import { FaTrash, FaEye, FaTimes, FaFile } from "react-icons/fa";
import Image from "next/image";
import { buildImageProxyUrl } from "@/app/utils/imageProxy";

// Mock data for demonstration
const mockAttachments = [
  {
    id: "1",
    attUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    attOriginalFileName: "mountain-landscape.jpg",
    attMime: "image/jpeg",
    attSubject: "صورة المناظر الطبيعية",
    description: "منظر جبلي جميل مع السماء الزرقاء",
    attSize: 245,
  },
  {
    id: "2",
    attUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    attOriginalFileName: "forest-path.jpg",
    attMime: "image/jpeg",
    attSubject: "مسار الغابة",
    description: "طريق متعرج عبر الغابة الخضراء",
    attSize: 189,
  },
  {
    id: "3",
    attUrl: "document.pdf",
    attOriginalFileName: "report.pdf",
    attMime: "application/pdf",
    attSubject: "تقرير سنوي",
    description: "التقرير السنوي للشركة",
    attSize: 1024,
  },
];

const resolveAttachmentUrl = (raw: string): string => {
  const normalized = raw.replace(/\\+/g, "/");
  return /^https?:\/\//i.test(normalized)
    ? normalized
    : buildImageProxyUrl(normalized);
};

type TAttachment = {
  id: string;
  attUrl: string;
  attOriginalFileName: string;
  attMime?: string;
  attSubject: string;
  description: string;
  attSize: number;
};

type ExistingAttachmentsListProps = {
  attachments?: TAttachment[];
  onDelete?: (attachmentId: string) => void;
};

export default function ExistingAttachmentsList({
  attachments = mockAttachments,
  onDelete = (id) => console.log("Delete:", id),
}: ExistingAttachmentsListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  const handleDelete = (attachmentId: string) => {
    onDelete(attachmentId);
  };

  const handleView = (attachment: TAttachment) => {
    if (attachment.attMime?.startsWith("image/")) {
      const imageUrl = resolveAttachmentUrl(attachment.attUrl);
      setSelectedImage(imageUrl);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border overflow-hidden mb-4"
        dir="rtl"
      >
        <div className="p-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {attachments.map((att) => {
              const imageUrl = resolveAttachmentUrl(att.attUrl);
              const isImage = att.attMime?.startsWith("image/");

              return (
                <div
                  key={att.id}
                  className="group bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Compact Image/File Preview Container */}
                  <div className="relative h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <Image
                        src={imageUrl}
                        alt={att.attOriginalFileName}
                        fill /* stretches inside the relative h-24 container */
                        unoptimized /* remote URL, skip Next.js optim-proxy */
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaFile className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">
                          {att.attMime?.split("/")[1]?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    )}

                    {/* Compact overlay with action buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        {isImage && (
                          <button
                            onClick={() => handleView(att)}
                            className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                            title="عرض الصورة"
                          >
                            <FaEye className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(att.id)}
                          className="bg-white text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                          title="حذف المرفق"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compact File Info */}
                  <div className="p-3">
                    <h3
                      className="font-medium text-sm text-gray-900 truncate mb-1"
                      title={att.attOriginalFileName}
                    >
                      {att.attOriginalFileName}
                    </h3>

                    <div className="space-y-0.5 text-xs text-gray-600">
                      <p className="truncate">
                        <span className="font-medium">الموضوع:</span>{" "}
                        {att.attSubject}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">الوصف:</span>{" "}
                        {att.description}
                      </p>
                      <p>
                        <span className="font-medium">الحجم:</span>{" "}
                        {att.attSize} KB
                      </p>
                    </div>

                    {/* Compact action buttons for mobile */}
                    <div className="flex gap-1 mt-2 sm:hidden">
                      {isImage && (
                        <button
                          onClick={() => handleView(att)}
                          className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-2 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          <FaEye className="w-2.5 h-2.5 inline ml-1" />
                          عرض
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(att.id)}
                        className="flex-1 bg-red-50 text-red-600 py-1.5 px-2 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <FaTrash className="w-2.5 h-2.5 inline ml-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              title="إغلاق"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <Image
              src={selectedImage}
              alt="Preview"
              width={800} /* any reasonable intrinsic size */
              height={600}
              unoptimized /* remote URL */
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
