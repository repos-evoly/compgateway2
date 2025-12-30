"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InternalForm from "../components/InternalForm";
import { getTransferById } from "../services";
import type { InternalFormValues } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";
import Cookies from "js-cookie";

// Match the cookie-reading logic used elsewhere for permissions
const COOKIE_CANDIDATES: ReadonlyArray<string> = [
  "permissions",
  "userPermissions",
  "claims",
  "scopes",
  "perms",
];

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tryParseStringArray(value: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed as string[];
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function readPermissionsFromCookies(): Set<string> {
  for (const key of COOKIE_CANDIDATES) {
    const raw = Cookies.get(key);
    if (!raw) continue;

    const decoded = safeDecodeURIComponent(raw);

    const parsed = tryParseStringArray(decoded);
    if (parsed) return new Set(parsed.map((p) => p.toLowerCase()));

    // Fallback: handle CSV-ish or bracketed ["A","B"] forms
    const cleaned = decoded.replace(/^\s*\[|\]\s*$/g, "");
    const csv = cleaned
      .split(",")
      .map((s) => s.trim().replace(/^"+|"+$/g, ""))
      .filter((s) => s.length > 0);
    if (csv.length > 0) return new Set(csv.map((p) => p.toLowerCase()));
  }
  return new Set<string>();
}

export default function InternalTransferDetailsPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale ?? "ar";
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<InternalFormValues | null>(null);

  // permissions from cookie
  const canPostTransfer = useMemo(() => {
    const perms = readPermissionsFromCookies();
    return perms.has("canposttransfer");
  }, []);

  /* ---------------------- fetch by id --------------------- */
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
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
          onClick={() => router.push(`/${locale}/transfers/internal`)}
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
      <InternalForm
        initialData={initial}
        viewOnly
        transferId={Number(id)}
        canPostTransfer={canPostTransfer}
      />
    </div>
  );
}
