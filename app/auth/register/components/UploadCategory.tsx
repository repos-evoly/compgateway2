"use client";

import React from "react";
import {
  FiCheck,
  FiUpload,
  FiPaperclip,
  FiX,
  FiImage,
  FiFileText,
  FiFile,
} from "react-icons/fi";

/**
 * Props:
 * - `files`: array of `File`, provided by Formik's state
 * - `onChangeFiles(newFiles)`: callback to update that state
 */
type UploadCategoryProps = {
  title: string;
  subtitle: string;
  description: string;
  files: File[]; // from Formik
  onChangeFiles: (newFiles: File[]) => void; // calls formik.setFieldValue
};

export default function UploadCategory({
  title,
  subtitle,
  description,
  files,
  onChangeFiles,
}: UploadCategoryProps) {
  const [dragOver, setDragOver] = React.useState<boolean>(false);

  // Handle <input> selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedArray = Array.from(event.target.files);
    onChangeFiles([...files, ...selectedArray]);
  };

  // Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onChangeFiles([...files, ...droppedFiles]);
  };

  // Remove single file
  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChangeFiles(updated);
  };

  // Helper to get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <FiImage className="w-4 h-4 text-blue-500" />;
    } else if (extension === "pdf") {
      return <FiFileText className="w-4 h-4 text-red-500" />;
    }
    return <FiFile className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header => "bg-info-dark" */}
      <div className="bg-info-dark px-6 py-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse text-white">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <FiFile className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-white/80">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">{description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4 rtl:space-x-reverse">
            <span>• أنواع الملفات: JPG, PNG, PDF</span>
            <span>• الحد الأقصى: 10MB لكل ملف</span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragOver
              ? "bg-blue-50 scale-[1.02]"
              : files.length > 0
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-info-dark hover:bg-info-main"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Icon => "bg-info-main" + "text-info-dark" */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-info-main transition-colors duration-300">
              {files.length > 0 ? (
                <FiCheck className="w-8 h-8 text-info-dark" />
              ) : (
                <FiUpload className="w-8 h-8 text-info-dark" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {files.length > 0
                  ? "تم اختيار الملفات بنجاح"
                  : "اسحب الملفات هنا أو اضغط للاختيار"}
              </h3>
              <p className="text-gray-500">
                {files.length > 0
                  ? `${files.length} ملف مختار`
                  : "اختر ملفات متعددة أو اسحبها إلى هذه المنطقة"}
              </p>
            </div>

            {/* File input button => "bg-info-dark text-white" */}
            <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-info-dark text-white rounded-xl hover:bg-info-dark/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 space-x-2 rtl:space-x-reverse">
              <FiPaperclip className="w-5 h-5" />
              <span className="font-medium">اختيار الملفات</span>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
