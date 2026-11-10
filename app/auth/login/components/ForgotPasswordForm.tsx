"use client";

import React, { useEffect, useRef, useState } from "react";
import { completePasswordRecovery, RecoveryError, verifyPasswordRecovery } from "@/app/helpers/authentication/passwordRecovery";

const text = {
  ar: {
    title: "استعادة كلمة المرور", intro: "أدخل اسم المستخدم أو البريد الإلكتروني ورمز تطبيق المصادقة المرتبط بحسابك.",
    login: "اسم المستخدم أو البريد الإلكتروني", code: "رمز تطبيق المصادقة (6 أرقام)", verify: "تحقق من الرمز",
    password: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور", save: "تغيير كلمة المرور", busy: "جارٍ التحقق...",
    help: "إذا لم تقم بإعداد تطبيق المصادقة أو فقدت الوصول إليه، تواصل مع الدعم للتحقق من هويتك واستعادة الحساب.",
    verified: "تم التحقق. أكمل تغيير كلمة المرور خلال خمس دقائق.", show: "إظهار كلمات المرور", hide: "إخفاء كلمات المرور",
    invalid: "تعذر التحقق. راجع اسم المستخدم أو البريد الإلكتروني واستخدم رمزاً جديداً من تطبيق المصادقة.",
    limited: "محاولات كثيرة لاستعادة كلمة المرور. حاول مجدداً بعد 15 دقيقة.",
    tooLong: "كلمة المرور طويلة جداً. استخدم كلمة مرور أقصر.",
    policy: "يجب أن تتطابق كلمتا المرور وأن تحتوي كلمة المرور على 8 أحرف على الأقل.",
    unavailable: "تعذر إكمال الطلب. حاول مجدداً.", expired: "انتهت صلاحية التحقق. أدخل رمزاً جديداً للمتابعة.",
    done: "تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة ورمز جديد من تطبيق المصادقة.",
    back: "العودة لتسجيل الدخول", restart: "بدء التحقق من جديد",
  },
  en: {
    title: "Recover your password", intro: "Enter your username or email and a code from the authenticator already linked to your account.",
    login: "Username or email", code: "Authenticator code (6 digits)", verify: "Verify code",
    password: "New password", confirm: "Confirm new password", save: "Change password", busy: "Processing...",
    help: "If you have not enrolled an authenticator or have lost access to it, contact support for verified account recovery.",
    verified: "Verified. Complete your password reset within five minutes.", show: "Show passwords", hide: "Hide passwords",
    invalid: "Unable to verify. Check your username or email and use a new authenticator code.",
    limited: "Too many recovery attempts. Try again in 15 minutes.",
    tooLong: "This password is too long. Use a shorter password.",
    policy: "Passwords must match and contain at least 8 characters.",
    unavailable: "Unable to complete your request. Please try again.", expired: "Verification expired. Enter a new authenticator code to continue.",
    done: "Password changed. Sign in with your new password and a new authenticator code.",
    back: "Back to login", restart: "Verify again",
  },
};

export default function ForgotPasswordForm({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  useEffect(() => { setLanguage(document.documentElement.lang.startsWith("en") ? "en" : "ar"); }, []);
  const t = text[language];
  const [step, setStep] = useState<"verify" | "reset" | "done">("verify");
  const [login, setLogin] = useState("");
  const [code, setCode] = useState("");
  const [grant, setGrant] = useState<{ token: string; expires: number } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const resetVerification = () => { setGrant(null); setCode(""); setPassword(""); setConfirm(""); setStep("verify"); };
  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-info-dark";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (step === "reset" && (!grant || Date.now() >= grant.expires)) { resetVerification(); setError(t.expired); return; }
    if (step === "reset" && new TextEncoder().encode(password).length > 72) { setError(t.tooLong); return; }
    if (step === "reset" && (password.length < 8 || password !== confirm)) { setError(t.policy); return; }
    submitting.current = true; setBusy(true);
    try {
      if (step === "verify") {
        const result = await verifyPasswordRecovery(login, code);
        setGrant({ token: result.resetToken, expires: Date.now() + result.expiresIn * 1000 });
        setCode(""); setStep("reset");
      } else if (grant) {
        await completePasswordRecovery(grant.token, password, confirm);
        setGrant(null); setPassword(""); setConfirm(""); setStep("done");
      }
    } catch (exception) {
      const kind = exception instanceof RecoveryError ? exception.code : "unavailable";
      if (kind === "invalid_recovery" && step === "reset") { resetVerification(); setError(t.expired); }
      else setError(kind === "recovery_rate_limited" ? t.limited : kind === "invalid_recovery" ? t.invalid : kind === "invalid_new_password" ? t.policy : t.unavailable);
    } finally { submitting.current = false; setBusy(false); }
  }
  return <div className="w-full max-w-md space-y-4 p-6" dir={language === "ar" ? "rtl" : "ltr"}>
    <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
    {step === "done" ? <><p role="status" className="text-green-700">{t.done}</p><button type="button" onClick={onClose} className="rounded-lg bg-info-dark px-4 py-2 text-white">{t.back}</button></> : <>
      <p className="text-sm text-gray-700">{step === "verify" ? t.intro : t.verified}</p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        {step === "verify" ? <>
          <label className="block text-sm text-gray-900">{t.login}<input name="login" autoComplete="username" dir="auto" required maxLength={150} value={login} onChange={e => setLogin(e.target.value)} className={inputClass} disabled={busy} /></label>
          <label className="block text-sm text-gray-900">{t.code}<input name="code" autoComplete="one-time-code" dir="ltr" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={e => setCode(e.target.value)} className={inputClass} disabled={busy} /></label>
        </> : <>
          <label className="block text-sm text-gray-900">{t.password}<input name="password" autoComplete="new-password" type={show ? "text" : "password"} minLength={8} maxLength={72} required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} disabled={busy} /></label>
          <label className="block text-sm text-gray-900">{t.confirm}<input name="confirmPassword" autoComplete="new-password" type={show ? "text" : "password"} minLength={8} maxLength={72} required value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} disabled={busy} /></label>
          <button type="button" onClick={() => setShow(!show)} className="text-sm text-info-dark">{show ? t.hide : t.show}</button>
        </>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-info-dark px-4 py-2 text-white disabled:opacity-50">{busy ? t.busy : step === "verify" ? t.verify : t.save}</button>
      </form>
      {step === "reset" && <button type="button" disabled={busy} onClick={resetVerification} className="text-sm text-info-dark">{t.restart}</button>}
      <p className="text-sm text-gray-600">{t.help}</p>
    </>}
  </div>;
}
