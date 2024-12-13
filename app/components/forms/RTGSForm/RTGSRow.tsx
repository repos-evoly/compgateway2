import React from "react";

interface RTGSRowProps {
  label: string; // The label for the row
  value?: string; // Static content to display if not editable
  editable?: boolean; // If true, render an input field
  onChange?: (value: string) => void; // Callback for input value changes
}

const RTGSRow: React.FC<RTGSRowProps> = ({
  label,
  value = "",
  editable = false,
  onChange,
}) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-300 py-2 px-4">
      {/* Label */}
      <span className="text-sm font-medium text-gray-700">{label}</span>

      {/* Value or Input */}
      {editable ? (
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1 text-sm w-2/3 focus:outline-none focus:ring focus:ring-blue-300"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      ) : (
        <span className="text-sm text-gray-600">{value}</span>
      )}
    </div>
  );
};

export default RTGSRow;
