"use client";

import React from "react";
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
  return (
    <div className="flex space-x-3">
      {actions.map((action) => (
        <Tooltip tooltip={action.tip} position="top" key={action.name}>
          {/*
            Priority:
            1) If action.selectProps is defined => render a <SelectWrapper/>
            2) Else if action.component is defined => render that component
            3) Else => render the default button
          */}
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
      ))}
    </div>
  );
};

export default ActionButtons;
