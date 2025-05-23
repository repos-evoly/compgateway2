import React, { ReactNode } from "react";

type Props = {
  className?: string; // TailwindCSS classes for styling
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"; // Variants to define tag types
  children: ReactNode;
};

const Description = ({
  variant = "h6", // Default to 'h6'
  children,
  className = "text-green-500", // Default styling using Tailwind
}: Props) => {
  return React.createElement(variant, { className }, children);
};

export default Description;
