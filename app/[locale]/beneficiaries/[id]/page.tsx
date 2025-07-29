"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BeneficiaryForm from "../components/BeneficiaryForm";
import { getBeneficiaryById } from "../services";
import type { BeneficiaryFormValues } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";

export default function BeneficiaryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<BeneficiaryFormValues | null>(null);

  /* ---------------------- fetch by id --------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getBeneficiaryById(Number(id));
        /* map API response → BeneficiaryFormValues */
        if (res.type === "local") {
          setInitial({
            id: res.id,
            type: "local",
            name: res.name,
            accountNumber: res.accountNumber,
            bank: res.bank,
            amount: res.amount,
          });
        } else {
          setInitial({
            id: res.id,
            type: "international",
            name: res.name,
            accountNumber: res.accountNumber,
            address: res.address,
            country: res.country,
            intermediaryBankSwift: res.intermediaryBankSwift,
            intermediaryBankName: res.intermediaryBankName,
          });
        }
      } catch (err) {
        console.error("Fetch beneficiary failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!initial) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Beneficiary not found</h2>
        <button
          onClick={() => router.push("/beneficiaries")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* viewOnly disables all inputs & buttons */}
      <BeneficiaryForm initialData={initial} viewOnly />
    </div>
  );
} 