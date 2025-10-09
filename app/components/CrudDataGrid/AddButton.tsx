import React from "react";

type AddButtonProps = {
  label?: string;
  onClick: () => void;
};

const AddButton: React.FC<AddButtonProps> = ({ label = "إضافة", onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-center gap-2 whitespace-nowrap border border-white px-4 py-2 text-white ring-offset-2 transition hover:border-warning-light hover:bg-warning-light hover:text-info-dark focus:outline-none focus:ring-2 focus:ring-warning-light sm:w-auto"
  >
    <span>{label}</span>
    <span aria-hidden="true" className="text-lg leading-none">
      +
    </span>
  </button>
);

export default AddButton;
