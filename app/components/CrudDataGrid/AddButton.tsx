import React from "react";

type AddButtonProps = {
  label?: string;
  onClick: () => void;
};

const AddButton: React.FC<AddButtonProps> = ({ label = "إضافة", onClick }) => (
  <button
    onClick={onClick}
    className="border border-white text-white px-4 py-2 rounded hover:bg-warning-light hover:text-info-dark hover:border-warning-light"
  >
    {label} +
  </button>
);

export default AddButton;
