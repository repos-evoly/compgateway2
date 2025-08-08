/* --------------------------------------------------------------------------
   components/BranchesSelect.tsx
   – Drop-in Formik field that shows the list of branches returned by getBranches
     inside the existing InputSelectCombo.
   – Uses branchName for both the option label and value, as requested.
   – No missing lines.  Strict TypeScript, ready to copy-paste.
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import InputSelectCombo, {
  InputSelectComboOption,
  InputSelectComboProps,
} from "../FormUI/InputSelectCombo";
import { Branch, getBranches } from "@/app/helpers/getBranches";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
type BranchesSelectProps = Omit<
  InputSelectComboProps,
  "options" | "maskingFormat"
>;

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
  const [options, setOptions] = useState<InputSelectComboOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const branches: Branch[] = await getBranches();
        const mapped: InputSelectComboOption[] = branches.map((b) => ({
          label: b.branchName,
          value: b.branchName,
        }));
        setOptions(mapped);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

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
