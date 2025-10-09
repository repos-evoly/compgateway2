"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

const InfoBox: React.FC = () => {
  const t = useTranslations("cblForm");
  const infoBox = t.raw("infoBox") as Record<string, string>;

  const orderedList = useMemo(
    () =>
      Object.entries(infoBox).filter(([key]) => /^[1-9]$|^10$/.test(key)),
    [infoBox]
  );

  const unorderedList = useMemo(
    () => Object.entries(infoBox).filter(([key]) => /^n[1-4]$/.test(key)),
    [infoBox]
  );

  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 640);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const orderedPreviewCount = 4;
  const notesPreviewCount = 2;

  const visibleOrdered =
    isMobile && !showAll
      ? orderedList.slice(0, orderedPreviewCount)
      : orderedList;

  const visibleUnordered =
    isMobile && !showAll
      ? unorderedList.slice(0, notesPreviewCount)
      : unorderedList;

  const canToggle =
    isMobile &&
    (orderedList.length > orderedPreviewCount ||
      unorderedList.length > notesPreviewCount);

  const toggleLabel = showAll
    ? t("showLess", { defaultValue: "Show less" })
    : t("showMore", { defaultValue: "Show more" });

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-info-light bg-white/95 p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-info-dark sm:text-xl">
        {t("infoBoxTitle", { defaultValue: "Important Attachments" })}
      </h3>

      <ol className="mt-4 space-y-3 text-text-dark">
        {visibleOrdered.map(([key, value]) => {
          const numberLabel = Number.parseInt(key, 10);
          return (
            <li
              key={key}
              className="flex items-start gap-3 rounded-xl bg-info-light/20 px-3 py-2 sm:px-4 sm:py-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info-dark text-sm font-semibold text-white">
                {Number.isNaN(numberLabel) ? key : numberLabel}
              </span>
              <span className="text-sm leading-relaxed sm:text-base">
                {value as string}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-xl bg-warning-light/40 px-4 py-3 text-sm font-semibold text-secondary-dark sm:text-base">
        {infoBox.note as string}
      </div>

      <ul className="mt-3 space-y-2 text-text-dark">
        {visibleUnordered.map(([key, value]) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-xl bg-gray-100 px-3 py-2 text-sm leading-relaxed sm:px-4 sm:py-3 sm:text-base"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary-dark" />
            <span>{value as string}</span>
          </li>
        ))}
      </ul>

      {canToggle && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          aria-expanded={showAll}
          className="mt-4 w-full rounded-lg bg-info-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-warning-light hover:text-info-dark sm:w-auto"
        >
          {toggleLabel}
        </button>
      )}
    </div>
  );
};

export default InfoBox;
