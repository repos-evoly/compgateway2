"use client";

import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import Modal from "@/app/components/reusable/Modal";

type HintProps = {
  hint: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
};

const Hint: React.FC<HintProps> = ({
  hint,
  ariaLabel = "Show hint",
  className = "",
  iconClassName = "text-info-dark",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-center rounded-full p-1 bg-gray-100 ${className}`}
      >
        <FiInfo className={`text-xl ${iconClassName}`} />
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} >
          <div className="text-black text-sm leading-6">{hint}</div>
        </Modal>
      )}
    </>
  );
};

export default Hint;

