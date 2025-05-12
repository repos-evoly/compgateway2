"use client";
import React from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-lg">
        <div className="bg-info-dark flex justify-end items-center p-3 rounded-t-2xl">
          <button onClick={onClose}>
            <FiX className="text-white text-2xl" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
