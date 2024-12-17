import React, { ReactNode } from "react";

const ErrorMessage = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-200 text-red-700 rounded-md">
      {children}
    </div>
  );
};

export default ErrorMessage;
