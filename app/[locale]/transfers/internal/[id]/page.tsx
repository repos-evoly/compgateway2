"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InternalForm from "../components/InternalForm";
import { getTransferById } from "../services";
import type { InternalFormValues } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";

export default function InternalTransferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<InternalFormValues | null>(null);

  /* ---------------------- fetch by id --------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getTransferById(Number(id));
        /* map API response → InternalFormValues */
        setInitial({
          from: res.fromAccount,
          to: res.toAccount,
          value: res.amount,
          description: res.description,
          economicSectorId: res.economicSectorId,
        });
      } catch (err) {
        console.error("Fetch transfer failed:", err);
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
        <h2 className="text-xl font-bold">Transfer not found</h2>
        <button
          onClick={() => router.push("/transfers/internal")}
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
      <InternalForm initialData={initial} viewOnly />
    </div>
  );
}
