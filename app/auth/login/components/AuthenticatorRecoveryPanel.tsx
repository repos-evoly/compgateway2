"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";

type RecoveryStatus = { status: "none" | "requested" | "approved" | "completed"; requestId?: string; alreadyRequested?: boolean; canContinue?: boolean };
type RecoverySetup = { qrCodeImageBase64: string; secretKey: string };

class RecoveryError extends Error {
  constructor(public readonly status: number, public readonly code?: string) { super("Authenticator recovery failed."); }
}

async function recoveryRequest(action: "request" | "status" | "setup" | "complete", attempt: string, code?: string, signal?: AbortSignal) {
  const response = await fetch(`/Companygw/api/auth/2fa-recovery/${action}`, {
    method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attempt, code }), signal,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RecoveryError(response.status, data?.code);
  if (!data || typeof data !== "object") throw new RecoveryError(502);
  return data;
}

export default function AuthenticatorRecoveryPanel({ attempt, onSetup, onBackToSignIn }: {
  attempt: string; onSetup: () => void; onBackToSignIn: () => void;
}) {
  const t = useTranslations("authenticatorRecovery");
  const [status, setStatus] = useState<RecoveryStatus>();
  const [setup, setSetup] = useState<RecoverySetup>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [error, setError] = useState<"error" | "invalidCode" | "rateLimit">();
  const pending = status?.status === "requested";

  useEffect(() => {
    if (busy || setup || expired || completed) return;
    const controller = new AbortController();
    let checking = false;
    async function check() {
      if (document.visibilityState === "hidden" || checking) return;
      checking = true;
      try {
        const result = await recoveryRequest("status", attempt, undefined, controller.signal);
        if (!controller.signal.aborted) setStatus(result);
      } catch (error) {
        if (!controller.signal.aborted && error instanceof RecoveryError && error.status === 401) setExpired(true);
      } finally {
        checking = false;
      }
    }
    void check();
    document.addEventListener("visibilitychange", check);
    const timer = pending ? window.setInterval(check, 20_000) : undefined;
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", check);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [attempt, busy, completed, expired, pending, setup]);

  async function run(action: "request" | "setup" | "complete") {
    if (busy || expired) return;
    setBusy(true);
    setError(undefined);
    try {
      const result = await recoveryRequest(action, attempt, action === "complete" ? code : undefined);
      if (action === "request") {
        setStatus(result);
        setAlreadySent(result.alreadyRequested === true);
      } else if (action === "setup") {
        if (typeof result.qrCodeImageBase64 !== "string" || !result.qrCodeImageBase64.startsWith("data:image/png;base64,") || typeof result.secretKey !== "string")
          throw new RecoveryError(502);
        setSetup(result);
        onSetup();
      } else {
        if (result.status !== "completed") throw new RecoveryError(502);
        setSetup(undefined);
        setCode("");
        setCompleted(true);
      }
    } catch (failure) {
      if (failure instanceof RecoveryError && failure.status === 401) {
        setSetup(undefined);
        setExpired(true);
      } else if (failure instanceof RecoveryError && failure.status === 429) setError("rateLimit");
      else if (failure instanceof RecoveryError && failure.code === "invalid_recovery_otp") setError("invalidCode");
      else setError("error");
    } finally {
      setBusy(false);
    }
  }

  const button = "rounded-lg border border-info-dark px-3 py-2 font-semibold text-info-dark hover:bg-gray-50 disabled:opacity-50";

  return (
    <section className="space-y-3 border-t border-gray-200 p-5 text-start text-sm">
      {error && <p role="alert" className="text-red-700">{t(error)}</p>}
      {expired || completed ? (
        <>
          <p role="status">{completed ? t("completed") : t("expired")}</p>
          <button type="button" className={button} onClick={onBackToSignIn}>{t("signIn")}</button>
        </>
      ) : setup ? (
        <form className="space-y-3" onSubmit={(event: FormEvent) => { event.preventDefault(); void run("complete"); }}>
          <p>{t("scan")}</p>
          <Image unoptimized className="mx-auto" src={setup.qrCodeImageBase64} width={176} height={176} alt={t("qrLabel")} />
          <details>
            <summary className="cursor-pointer">{t("setupKey")}</summary>
            <p className="break-all font-mono" dir="ltr">{setup.secretKey}</p>
          </details>
          <label className="block">
            {t("code")}
            <input type="text" className="mt-1 w-full rounded-lg border border-gray-300 p-2" dir="ltr"
              inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
          </label>
          <button type="submit" className={button} disabled={code.length !== 6 || busy}>{busy ? t("busy") : t("confirm")}</button>
        </form>
      ) : (
        <>
          {pending && <p role="status">{alreadySent ? t("alreadySent") : t("waiting")}</p>}
          {status?.status === "approved" && <p role="status">{status.canContinue ? t("approved") : t("originalBrowser")}</p>}
          {status?.requestId && (pending || status.status === "approved") && <p dir="ltr" className="break-all font-mono text-xs">{status.requestId}</p>}
          <button type="button" className={button} disabled={busy || (status?.status === "approved" && !status.canContinue)}
            onClick={() => void run(status?.canContinue ? "setup" : "request")}>
            {busy ? t("busy") : status?.canContinue ? t("setup") : t("recover")}
          </button>
        </>
      )}
    </section>
  );
}
