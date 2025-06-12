"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InternalForm from "../components/InternalForm";
import { getTransferById } from "../services";
import type { InternalFormValues } from "../types";

export default function InternalTransferDetailsPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();

  const [loading, setLoading]       = useState(true);
  const [initial, setInitial]       = useState<InternalFormValues | null>(null);

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
        });
      } catch (err) {
        console.error("Fetch transfer failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-gray-600">Loading transfer …</p>
      </div>
    );
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
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">
        Transfer&nbsp;Details&nbsp;#{id}
      </h2>

      {/* viewOnly disables all inputs & buttons */}
      <InternalForm initialData={initial} viewOnly />
    </div>
  );
}
