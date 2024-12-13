import { useTranslations } from "next-intl";
import React from "react";

const InfoBox: React.FC = () => {
  const t = useTranslations("cblForm");
  const infoBox = t.raw("infoBox"); // Retrieve the raw "infoBox" object

  // Separate ordered and unordered lists
  const orderedList = Object.entries(infoBox).filter(
    ([key]) => /^[1-9]$|^10$/.test(key) // Matches keys 1 to 10
  );

  const unorderedList = Object.entries(infoBox).filter(
    ([key]) => /^n[1-4]$/.test(key) // Matches keys n1 to n4
  );

  return (
    <div className="mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-300">
      {/* Ordered List */}
      <ol className="list-decimal ltr:pl-5 rtl:pr-5 text-text-dark">
        {orderedList.map(([key, value]) => (
          <li key={key} className="mb-1">
            {value as string}
          </li>
        ))}
      </ol>

      {/* Subtitle */}
      <div className="mt-4 text-lg font-bold text-secondary-dark">
        {infoBox.note as string}
      </div>

      {/* Unordered List */}
      <ul className="list-disc ltr:pl-5 rtl:pr-5 mt-2 text-text-dark">
        {unorderedList.map(([key, value]) => (
          <li key={key} className="mb-1">
            {value as string}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoBox;
