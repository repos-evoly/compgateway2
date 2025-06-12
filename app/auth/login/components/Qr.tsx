"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import VerificationForm from "@/app/auth/login/components/VerificationForm";

const BASE_URL = "http://10.3.3.11/compauthapi";

// Simple modal wrapper
const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl">{children}</div>
    </div>
  );
};

const QRCodeDisplay: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [qrCodePath, setQrCodePath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    // Clear any existing QR code when component mounts
    setQrCodePath(null);

    const storedEmail = localStorage.getItem("auth_login");
    if (storedEmail) {
      console.log("Retrieved email from local storage:", storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (!email) return;

    const fetchQRCode = async () => {
      try {
        console.log("Fetching QR code for email:", email);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/enable-2fa`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "فشل تحميل رمز الاستجابة السريعة. يرجى المحاولة مرة أخرى."
          );
        }

        const data = await response.json();
        const timestamp = new Date().getTime();
        setQrCodePath(`${BASE_URL}${data.qrCodePath}?t=${timestamp}`);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [email]);

  if (!email) {
    return (
      <p className="text-gray-600 text-lg font-semibold text-center" dir="rtl">
        جارٍ تحميل البريد الإلكتروني...
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-gray-600 text-lg font-semibold text-center" dir="rtl">
        جارٍ تحميل رمز الاستجابة السريعة...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-lg font-semibold text-center" dir="rtl">
        {error}
      </p>
    );
  }

  return (
    <div
      className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md text-center"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        امسح رمز الاستجابة السريعة
      </h2>

      <div className="flex justify-center">
        {qrCodePath ? (
          <Image
            src={qrCodePath}
            alt="رمز الاستجابة السريعة"
            width={250}
            height={250}
            className="rounded-lg border-2 border-gray-300 shadow-md"
            // Add key prop to force re-render when QR code changes
            key={qrCodePath}
            // Disable Next.js image caching
            unoptimized={true}
          />
        ) : (
          <p className="text-gray-600">لا يوجد رمز الاستجابة السريعة متاح.</p>
        )}
      </div>

      <p className="text-gray-700 text-lg mt-4">
        لمسح الرمز، استخدم تطبيق{" "}
        <span className="font-semibold text-blue-600">
          Google Authenticator
        </span>{" "}
        للحصول على رمز مكوّن من 6 أرقام.
      </p>

      <p className="text-gray-600 text-sm mt-2">
        بعد المسح، انقر على الزر التالي لإدخال الرمز المكوّن من 6 أرقام.
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold"
      >
        إدخال الرمز
      </button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <VerificationForm
            onClose={() => setShowModal(false)}
            sourcePage="qr"
          />
        </Modal>
      )}
    </div>
  );
};

export default QRCodeDisplay;
