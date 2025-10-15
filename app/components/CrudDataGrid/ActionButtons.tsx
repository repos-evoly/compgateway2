"use client";

import React, { useEffect, useState } from "react";
import Tooltip from "../reusable/Tooltip"; // Adjust import path if needed
import SelectWrapper from "@/app/components/FormUI/Select"; // <--- Import your SelectWrapper
import { ActionButtonsProps } from "@/types"; // <--- The updated types

// A reusable ActionButton for normal button actions
const ActionButton: React.FC<{
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ name, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
    aria-label={name}
  >
    {icon}
  </button>
);

const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onActionClick,
}) => {
  // Detect direction (LTR/RTL)
  const [isRTL, setIsRTL] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsRTL(document.dir === "rtl" || document.body.dir === "rtl");
    }
  }, []);

  return (
    <div
      className={`flex ${
        isRTL ? "flex-row-reverse justify-center" : "flex-row justify-center"
      } gap-3`}
    >
      {actions.map((action) => (
        <div key={action.name} className="flex items-center justify-center">
          <Tooltip tooltip={action.tip} position="top">
            {action.selectProps ? (
              <SelectWrapper
                name={action.selectProps.name}
                label={action.selectProps.label}
                options={action.selectProps.options}
                disabled={action.selectProps.disabled}
                width={action.selectProps.width}
                height={action.selectProps.height}
              />
            ) : action.component ? (
              <div>{action.component}</div>
            ) : (
              <ActionButton
                name={action.name}
                icon={action.icon!}
                onClick={() => onActionClick && onActionClick(action.name)}
              />
            )}
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default ActionButtons;
