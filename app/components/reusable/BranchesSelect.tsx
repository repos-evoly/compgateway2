/* --------------------------------------------------------------------------
   app/components/reusable/BranchesSelect.tsx
   – Drop-in Formik field that shows the list of branches returned by getBranches
     inside the existing InputSelectCombo.
   – Uses branchName for label/value AND carries branchNum (branchNumber) on each
     option. Automatically sets a hidden Formik field "branchNum" whenever the
     selected branch changes.
   – Strict TypeScript, ready to copy-paste.
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormikContext } from "formik";
import InputSelectCombo, {
  type InputSelectComboOption,
  type InputSelectComboProps,
} from "../FormUI/InputSelectCombo";
import { type Branch, getBranches } from "@/app/helpers/getBranches";

/* ------------------------------------------------------------------ */
/* Props and local types                                               */
/* ------------------------------------------------------------------ */
type BranchesSelectProps = Omit<
  InputSelectComboProps,
  "options" | "maskingFormat"
>;

/** Extends the base option with the branch number we need to submit */
type BranchOption = InputSelectComboOption & {
  branchNum: string; // branchNumber from the API
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const BranchesSelect: React.FC<BranchesSelectProps> = ({
  name,
  label,
  placeholder = "Select branch…",
  disabled = false,
  width = "w-full",
  titleColor = "text-black",
}) => {
  const [options, setOptions] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Access Formik to derive and set branchNum (hidden) from the selected branch
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();

  useEffect(() => {
    const fetchBranches = async (): Promise<void> => {
      setLoading(true);
      try {
        const branches: Branch[] = await getBranches();

        // Map into options: label/value = branchName, plus branchNum = branchNumber
        const mapped: BranchOption[] = branches.map((b) => ({
          label: b.branchName,
          value: b.branchName,
          branchNum: b.branchNumber,
        }));
        setOptions(mapped);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchBranches();
  }, []);

  // Whenever the selected branch changes, update the hidden "branchNum" field
  const selectedBranchName = useMemo<string>(
    () => (typeof values?.[name] === "string" ? (values[name] as string) : ""),
    [values, name]
  );

  useEffect(() => {
    if (!selectedBranchName) {
      void setFieldValue("branchNum", "");
      return;
    }
    const match = options.find(
      (opt) =>
        opt.value === selectedBranchName || opt.label === selectedBranchName
    );
    if (match) {
      void setFieldValue("branchNum", match.branchNum);
    }
  }, [selectedBranchName, options, setFieldValue]);

  return (
    <InputSelectCombo
      name={name}
      label={label}
      options={options}
      placeholder={loading ? "Loading…" : placeholder}
      disabled={disabled || loading}
      width={width}
      titleColor={titleColor}
    />
  );
};

export default BranchesSelect;
