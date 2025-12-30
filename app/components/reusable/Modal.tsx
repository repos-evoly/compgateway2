"use client";
import React from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-[calc(100vw-2rem)] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-info-dark flex justify-end items-center p-3 rounded-t-2xl shrink-0">
          <button onClick={onClose} aria-label="Close dialog">
            <FiX className="text-white text-2xl" />
          </button>
        </div>
        <div className="p-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
