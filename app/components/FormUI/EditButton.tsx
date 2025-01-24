import React from "react";
import { FaEdit } from "react-icons/fa"; // Import the edit icon from react-icons

type EditButtonProps = {
  fieldsDisabled: boolean;
  setFieldsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditButton = ({ fieldsDisabled, setFieldsDisabled }: EditButtonProps) => {
  const handleToggle = () => setFieldsDisabled((prev) => !prev);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 bg-info-dark text-white rounded hover:bg-warning-light hover:text-info-dark transition"
    >
      <FaEdit className="w-5 h-5" /> {/* Fixed icon */}
      {fieldsDisabled ? "Edit" : "Cancel"}
    </button>
  );
};

export default EditButton;
