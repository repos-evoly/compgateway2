import React from "react";

type DividerProps = {
  className?: string; // Optional additional classes for customization
};

const Divider: React.FC<DividerProps> = ({ className = "" }) => {
  return <div className={`h-px w-full bg-gray-500 mb-1 ${className}`}></div>;
};

export default Divider;
