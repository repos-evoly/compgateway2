import React from "react";
import Tooltip from "../reusable/Tooltip";

type ActionButtonsProps = {
  actions: { name: string; icon: React.ReactNode; tip: string }[]; // Array of action objects with name and icon
  onActionClick?: (action: string) => void; // Callback for button clicks
};

// Reusable ActionButton Component
const ActionButton: React.FC<{
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ name, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
      aria-label={name}
    >
      {icon}
    </button>
  );
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onActionClick,
}) => {
  return (
    <div className="flex space-x-3">
      {actions.map((action) => (
        <Tooltip tooltip={action.tip} position="top" key={action.name}>
          <ActionButton
            name={action.name}
            icon={action.icon}
            onClick={() => onActionClick && onActionClick(action.name)}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default ActionButtons;
