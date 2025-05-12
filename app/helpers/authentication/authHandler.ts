// /app/helpers/authentication/authHandler.ts

import Cookies from "js-cookie";
import { parseJwt } from "../tokenHandler"; // Adjust path
import { getUserById } from "@/app/helpers/authentication/getUserById"; // Adjust path as needed

type SimpleRouter = {
  push: (url: string) => void;
};

export type LoginFormValues = {
  login: string;
  password: string;
};

export type ForgotPasswordValues = {
  email: string;
};

export type ResetPasswordValues = {
  passwordToken: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordHandlerOptions = {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

type LoginHandlerOptions = {
  router: SimpleRouter;
  onTwoFactorRequired?: () => void;
  onError?: (msg: string) => void;
};

export async function loginHandler(
  values: LoginFormValues,
  { router, onTwoFactorRequired, onError }: LoginHandlerOptions
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error(
        "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك."
      );
    }

    const data = await response.json();

    // Save email in local storage so the verification form can retrieve it
    localStorage.setItem("auth_email", values.login);

    // Handle API response
    if (data.requiresTwoFactorEnable) {
      // If user must enable 2FA, redirect to /auth/qr
      router.push("/auth/qr");
    } else if (data.requiresTwoFactor) {
      // If user must do 2FA, invoke callback or handle it
      if (onTwoFactorRequired) {
        onTwoFactorRequired();
      }
    } else if (data.accessToken && data.refreshToken && data.kycToken) {
      // Set accessToken
      Cookies.set("accessToken", data.accessToken, {
        expires: 7, // 7 days
        secure: false,
        httpOnly: false,
      });


      // Set refreshToken
      Cookies.set("refreshToken", data.refreshToken, {
        expires: 7, // 7 days
        secure: false,
        httpOnly: false,
      });


      // If the API returns a KYC token, store it as well
      if (data.kycToken) {
        Cookies.set("kycToken", data.kycToken, {
          expires: 7,
          secure: false,
          httpOnly: false,
        });
      }

      // 1) Parse the JWT to get the user ID (usually "nameid" in the payload)
      const parsed = parseJwt(data.accessToken);
      if (!parsed || !parsed.nameid) {
        throw new Error("Failed to parse user ID from the access token.");
      }

      const userId = parseInt(parsed.nameid, 10);

      // 2) Use getUserById to fetch roleId, branchId, etc.
      const userData = await getUserById(userId);

      // 3) Store roleId, branchId, userId in cookies
      Cookies.set("roleId", String(userData.roleId), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });
      Cookies.set("branchId", String(userData.branchId), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });
      Cookies.set("areaId", String(userData.areaId), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });
      Cookies.set("userId", String(userData.userId), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });
      Cookies.set("role", String(userData.role), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });
      Cookies.set("permissions", JSON.stringify(userData.permissions), {
        expires: 7,
        secure: false,
        httpOnly: false,
      });

      // 4) Finally, push to dashboard
      router.push("/dashboard");
    } else {
      throw new Error("استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (onError) {
        onError(err.message);
      }
    } else {
      if (onError) {
        onError("An unexpected error occurred");
      }
    }
  }
}

type ForgotPasswordHandlerOptions = {
  onSuccess?: (email: string) => void;
  onError?: (msg: string) => void;
};

/**
 * Sends a forgot-password request to /forgot-password
 */
export async function forgotPasswordHandler(
  values: ForgotPasswordValues,
  { onSuccess, onError }: ForgotPasswordHandlerOptions
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      throw new Error("فشل إرسال طلب إعادة تعيين كلمة المرور.");
    }

    alert("يرجى التواصل مع الجهة المسؤولة للحصول على الرمز اللازم لتغيير كلمة المرور.");

    if (onSuccess) {
      onSuccess(values.email);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (onError) {
        onError(err.message);
      } else {
        alert(err.message);
      }
    } else {
      if (onError) {
        onError("حدث خطأ غير متوقع.");
      } else {
        alert("حدث خطأ غير متوقع.");
      }
    }
  }
}

/**
 * Resets the user's password by calling /reset-password
 */
export async function resetPasswordHandler(
  values: ResetPasswordValues,
  { onSuccess, onError }: ResetPasswordHandlerOptions
) {
  try {
    const payload = {
      passwordToken: values.passwordToken,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("فشل إعادة تعيين كلمة المرور.");
    }

    alert("تم تغيير كلمة المرور بنجاح.");

    if (onSuccess) {
      onSuccess();
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (onError) {
        onError(err.message);
      } else {
        alert(err.message);
      }
    } else {
      if (onError) {
        onError("حدث خطأ غير متوقع.");
      } else {
        alert("حدث خطأ غير متوقع.");
      }
    }
  }
}