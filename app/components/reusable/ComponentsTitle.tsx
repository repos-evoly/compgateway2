import React from "react";

interface ComponentsTitleProps {
  title: string; // Title to be displayed
  subtitle?: string; // Optional subtitle to be displayed below the title
}

const ComponentsTitle: React.FC<ComponentsTitleProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="text-center my-4">
      {/* Title */}
      <div className="text-2xl font-semibold text-gray-800">{title}</div>
      {/* Subtitle */}
      {subtitle && <div className="text-sm text-gray-600 mt-2">{subtitle}</div>}
    </div>
  );
};

export default ComponentsTitle;
