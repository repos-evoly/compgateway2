"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
