// /app/helpers/authentication/authHandler.ts

import Cookies from "js-cookie";
import { parseJwt } from "../tokenHandler"; // Adjust path if needed
import { getUserById } from "@/app/helpers/authentication/getUserById"; // Adjust path if needed

type SimpleRouter = {
  push: (url: string) => void;
};

type OnCompanyNotApproved = (status: string, msg: string) => void;


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
  onCompanyNotApproved?: (status: string, msg: string) => void;
};
export async function loginHandler(
  values: LoginFormValues,
  { router, onTwoFactorRequired, onError, onCompanyNotApproved }: LoginHandlerOptions
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
    }

    const data = await response.json();

    // Save login in local storage so the verification form can retrieve it
    localStorage.setItem("auth_login", values.login);

    // 1) 2FA checks
    if (data.requiresTwoFactorEnable) {
      // If user must enable 2FA, redirect to /auth/qr
      router.push("/auth/qr");
      return;
    } else if (data.requiresTwoFactor) {
      // If user must do 2FA, invoke callback or handle it
      if (onTwoFactorRequired) {
        onTwoFactorRequired();
      }
      return;
    }

    // 2) If tokens exist => call helper function
    if (data.accessToken && data.refreshToken && data.kycToken) {
      await loginRoutingHandler(
        data.accessToken,
        data.refreshToken,
        data.kycToken,
        router,
        onCompanyNotApproved
      );
    } else {
      // Missing tokens => error
      throw new Error("استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (onError) {
        onError(err.message);
      }
    } else {
      if (onError) {
        onError("حدث خطأ غير متوقع");
      }
    }
  }
}

type ForgotPasswordHandlerOptions = {
  onSuccess?: (login: string) => void;
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
      `${process.env.NEXT_PUBLIC_AUTH_API}/customer-forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      throw new Error("فشل إرسال طلب إعادة تعيين كلمة المرور.");
    }

    alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");

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





export async function loginRoutingHandler(
  accessToken: string,
  refreshToken: string,
  kycToken: string,
  router: SimpleRouter,
  onCompanyNotApproved?: OnCompanyNotApproved
): Promise<void> {
  
  // Store tokens in Cookies
  Cookies.set("accessToken", accessToken, {
    expires: 7,
    secure: false,
    httpOnly: false,
  });
  Cookies.set("refreshToken", refreshToken, {
    expires: 7,
    secure: false,
    httpOnly: false,
  });
  Cookies.set("kycToken", kycToken, {
    expires: 7,
    secure: false,
    httpOnly: false,
  });

  // Parse the token to get user ID
  const parsed = parseJwt(accessToken);
  if (!parsed || !parsed.nameid) {
    throw new Error("Failed to parse user ID from the access token.");
  }

  const userId = parseInt(parsed.nameid, 10);

  // Fetch user data (role, companyStatus, etc.)
  const userData = await getUserById(userId);
  console.log("User data fetched:", userData);

  // If userData.accounts, store them
  if (userData.accounts) {
    Cookies.set("statementAccounts", JSON.stringify(userData.accounts), {
      expires: 7,
      secure: false,
      httpOnly: false,
    });
  }

  Cookies.set("isCompanyAdmin", JSON.stringify(userData.isCompanyAdmin), {
    expires: 7,
    secure: false,
    httpOnly: false,
  });

  // Store other user data in cookies
  Cookies.set("companyCode", JSON.stringify(userData.companyCode), {
    expires: 7,
    secure: false,
    httpOnly: false,
  });
  Cookies.set("permissions", JSON.stringify(userData.permissions), {
    expires: 7,
    secure: false,
    httpOnly: false,
  });
  Cookies.set("servicePackageId", JSON.stringify(userData.servicePackageId), {
    expires: 7,
    secure: false,
    httpOnly: false,
  });

  Cookies.set("enabledTransactionCategories", JSON.stringify(userData.enabledTransactionCategories), {
    expires: 7,
    secure: false,
    httpOnly: false,
  });
  
  

  // Route based on companyStatus
  if (
    userData.companyStatus === "approved" &&
    (userData.isCompanyAdmin || userData.isActive)
  ) {
    router.push("/dashboard");
  }
  
  /* NEW branch – non-admin & inactive */
  else if (!userData.isCompanyAdmin && !userData.isActive) {
    if (onCompanyNotApproved) {
      onCompanyNotApproved(
        "inactiveUser",                 // any tag you like
        "حساب المستخدم غير نشط"         // message: user is not active
      );
    }
  }
  
  /* Existing branches stay the same */
  else if (
    userData.companyStatus === "missingInformation" &&
    userData.isCompanyAdmin
  ) {
    const encodedMsg = encodeURIComponent(userData.companyStatusMessage || "");
    router.push(`/auth/register/${userData.companyCode}?msg=${encodedMsg}`);
  } else if (
    userData.companyStatus === "missingsDocuments" &&
    userData.isCompanyAdmin
  ) {
    const encodedMsg = encodeURIComponent(userData.companyStatusMessage || "");
    router.push(
      `/auth/register/uploadDocuments/${userData.companyCode}?msg=${encodedMsg}`
    );
  } else {
    console.log("company status not approved", userData);
    if (onCompanyNotApproved) {
      onCompanyNotApproved(
        userData.companyStatus!,
        userData.companyStatusMessage || "حالة الشركة غير مقبولة"
      );
    }
  }
  
}