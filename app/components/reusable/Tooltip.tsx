import React, { ReactNode, useRef, useState } from "react";

type TooltipProps = {
  children: ReactNode;
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number; // px gap between tooltip & target
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  tooltip,
  position = "top",
  offset = 8,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left;

    switch (position) {
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      default: // "top"
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
    }

    setCoords({ top, left });
    setVisible(true);
  };

  const hideTooltip = () => setVisible(false);

  /** Transform helpers for centering */
  const transform = {
    top: "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
  }[position];

  return (
    <>
      {/* Tooltip itself */}
      {visible && coords && (
        <div
          className="fixed z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform,
          }}
        >
          {tooltip}
        </div>
      )}

      {/* Target element */}
      <div
        ref={wrapperRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
    </>
  );
};

export default Tooltip;
