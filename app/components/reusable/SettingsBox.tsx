"use client";

import React from "react";

type SettingsBoxProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Determines if this box is for a switch or an input. */
  controlType: "switch" | "input";
  /** The actual Formik control (Switch or Input) to render. */
  control: React.ReactNode;
};

/**
 * A reusable box that shows:
 *  - A large icon on the left.
 *  - A title and either a switch or input on the right.
 *  - A description beneath (with layout varying by controlType).
 */
const SettingsBox: React.FC<SettingsBoxProps> = ({
  title,
  description,
  icon,
  controlType,
  control,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Large icon on the left */}
        <div className="flex items-center justify-center p-3 rounded-xl bg-gray-50">
          {icon}
        </div>

        {/* Right side content: differs if it's a switch or input */}
        {controlType === "switch" ? (
          /* SWITCH LAYOUT:
             Title and switch on the same line, description below */
          <div className=" flex justify-between w-full">
            <div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
                  {title}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <div> {control}</div>
          </div>
        ) : (
          /* INPUT LAYOUT:
             Title on top, then input, then description below */
          <div className=" flex justify-between w-full">
            <div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{description}</p>
              </div>
              <div>{control}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsBox;
