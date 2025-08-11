"use client";

import React, { JSX } from "react";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

export type ActionBarProps = {
  isEditing: boolean;
  canPost: boolean;
  posting: boolean;
  showPost: boolean;

  labels: {
    edit: string;
    save: string;
    post: string;
    posting: string;
    tooltipSaveToPost: string | undefined;
  };

  onEdit: () => void;
  // Save is handled by form submit; we just render the submit button in edit mode
  onPost: () => void;
  saveDisabled?: boolean;
};

export default function ActionBar({
  isEditing,
  canPost,
  posting,
  showPost,
  labels,
  onEdit,
  onPost,
  saveDisabled = false,
}: ActionBarProps): JSX.Element {
  return (
    <div className="flex gap-2">
      {isEditing ? (
        <SubmitButton
          title={labels.save}
          color="info-dark"
          disabled={saveDisabled}
          fullWidth={false}
        />
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="rounded bg-info-dark px-4 py-2 text-white hover:opacity-90 border border-white hover:border-transparent hover:bg-warning-light hover:text-info-dark"
        >
          {labels.edit}
        </button>
      )}

      {showPost && !isEditing && (
        <button
          type="button"
          onClick={onPost}
          disabled={!canPost || posting}
          className={`rounded px-4 py-2 border ${
            !canPost || posting
              ? "bg-slate-300 text-slate-600 cursor-not-allowed border-slate-300"
              : "bg-info-dark text-white hover:opacity-90 border-white hover:border-transparent hover:bg-warning-light hover:text-info-dark"
          }`}
          title={!canPost ? labels.tooltipSaveToPost : undefined}
        >
          {posting ? labels.posting : labels.post}
        </button>
      )}

      {showPost && isEditing && (
        <button
          type="button"
          disabled
          className="rounded px-4 py-2 bg-slate-300 text-slate-600 cursor-not-allowed"
          title={labels.tooltipSaveToPost}
        >
          {labels.post}
        </button>
      )}
    </div>
  );
}
