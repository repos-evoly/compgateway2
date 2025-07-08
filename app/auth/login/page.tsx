"use client";

export const dynamic = "force-dynamic";
// pages/login.tsx
import React from "react";
import { FiLogIn } from "react-icons/fi"; // Import login icon
import LoginForm from "@/app/auth/login/components/LoginForm";
import AuthHeader from "../components/AuthHeader"; // Import the new header component

const LoginPage = () => {
  return (
    <div className="w-full">
      {/* Auth Header with Login Icon, Title, and Subtitle */}
      <AuthHeader
        icon={<FiLogIn />}
        title="تسجيل الدخول"
        subtitle="قم بتسجيل الدخول إلى حسابك"
      />

      {/* Login Form */}
      <LoginForm />
    </div>
  );
};

export default LoginPage;
