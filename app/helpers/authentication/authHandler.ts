// // /app/helpers/authentication/authHandler.ts

// import Cookies from "js-cookie";
// import { parseJwt } from "../tokenHandler"; // Adjust path if needed
// import { getUserById } from "@/app/helpers/authentication/getUserById"; // Adjust path if needed

// type SimpleRouter = {
//   push: (url: string) => void;
// };

// type OnCompanyNotApproved = (status: string, msg: string) => void;


// export type LoginFormValues = {
//   login: string;
//   password: string;
// };

// export type ForgotPasswordValues = {
//   email: string;
// };

// export type ResetPasswordValues = {
//   passwordToken: string;
//   password: string;
//   confirmPassword: string;
// };

// export type ResetPasswordHandlerOptions = {
//   onSuccess?: () => void;
//   onError?: (msg: string) => void;
// };

// type LoginHandlerOptions = {
//   router: SimpleRouter;
//   onTwoFactorRequired?: () => void;
//   onError?: (msg: string) => void;
//   onCompanyNotApproved?: (status: string, msg: string) => void;
// };
// export async function loginHandler(
//   values: LoginFormValues,
//   { router, onTwoFactorRequired, onError, onCompanyNotApproved }: LoginHandlerOptions
// ) {
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(values),
//     });

//     if (!response.ok) {
//       throw new Error("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
//     }

//     const data = await response.json();

//     // Save login in local storage so the verification form can retrieve it
//     localStorage.setItem("auth_login", values.login);

//     // 1) 2FA checks
//     if (data.requiresTwoFactorEnable) {
//       // If user must enable 2FA, redirect to /auth/qr
//       router.push("/auth/qr");
//       return;
//     } else if (data.requiresTwoFactor) {
//       // If user must do 2FA, invoke callback or handle it
//       if (onTwoFactorRequired) {
//         onTwoFactorRequired();
//       }
//       return;
//     }

//     // 2) If tokens exist => call helper function
//     if (data.accessToken && data.refreshToken && data.kycToken) {
//       await loginRoutingHandler(
//         data.accessToken,
//         data.refreshToken,
//         data.kycToken,
//         router,
//         onCompanyNotApproved
//       );
//     } else {
//       // Missing tokens => error
//       throw new Error("استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى.");
//     }
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       if (onError) {
//         onError(err.message);
//       }
//     } else {
//       if (onError) {
//         onError("حدث خطأ غير متوقع");
//       }
//     }
//   }
// }

// type ForgotPasswordHandlerOptions = {
//   onSuccess?: (login: string) => void;
//   onError?: (msg: string) => void;
// };

// /**
//  * Sends a forgot-password request to /forgot-password
//  */
// export async function forgotPasswordHandler(
//   values: ForgotPasswordValues,
//   { onSuccess, onError }: ForgotPasswordHandlerOptions
// ) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_AUTH_API}/customer-forgot-password`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("فشل إرسال طلب إعادة تعيين كلمة المرور.");
//     }

//     alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");

//     if (onSuccess) {
//       onSuccess(values.email);
//     }
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       if (onError) {
//         onError(err.message);
//       } else {
//         alert(err.message);
//       }
//     } else {
//       if (onError) {
//         onError("حدث خطأ غير متوقع.");
//       } else {
//         alert("حدث خطأ غير متوقع.");
//       }
//     }
//   }
// }

// /**
//  * Resets the user's password by calling /reset-password
//  */
// export async function resetPasswordHandler(
//   values: ResetPasswordValues,
//   { onSuccess, onError }: ResetPasswordHandlerOptions
// ) {
//   try {
//     const payload = {
//       passwordToken: values.passwordToken,
//       password: values.password,
//       confirmPassword: values.confirmPassword,
//     };

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_AUTH_API}/reset-password`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("فشل إعادة تعيين كلمة المرور.");
//     }

//     alert("تم تغيير كلمة المرور بنجاح.");

//     if (onSuccess) {
//       onSuccess();
//     }
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       if (onError) {
//         onError(err.message);
//       } else {
//         alert(err.message);
//       }
//     } else {
//       if (onError) {
//         onError("حدث خطأ غير متوقع.");
//       } else {
//         alert("حدث خطأ غير متوقع.");
//       }
//     }
//   }
// }





// export async function loginRoutingHandler(
//   accessToken: string,
//   refreshToken: string,
//   kycToken: string,
//   router: SimpleRouter,
//   onCompanyNotApproved?: OnCompanyNotApproved
// ): Promise<void> {
  
//   // Store tokens in Cookies
//   // Cookies.set("accessToken", accessToken, {
//   //   expires: 7,
//   //   secure: true,
//   //   httpOnly: false,
//   //   path: "/Companygw"
//   // });
//   // Cookies.set("refreshToken", refreshToken, {
//   //   expires: 7,
//   //   secure: true,
//   //   httpOnly: false,
//   //   path: "/Companygw"
//   // });
//   // Cookies.set("kycToken", kycToken, {
//   //   expires: 7,
//   //   secure: true,
//   //   httpOnly: false,
//   //   path: "/Companygw"
//   // });


//   console.log("handler before parsing token ");
//   // Parse the token to get user ID
//   const parsed = parseJwt(accessToken);
//   if (!parsed || !parsed.nameid) {
//     throw new Error("Failed to parse user ID from the access token.");
//   }

//   console.log("token after parsing in the login hbandler ", parsed);

//   const userId = parseInt(parsed.nameid, 10);


//   // Fetch user data (role, companyStatus, etc.)
//   const userData = await getUserById(userId);
//   console.log("User data fetched:", userData);

//   // If userData.accounts, store them
//   if (userData.accounts) {
//     Cookies.set("statementAccounts", JSON.stringify(userData.accounts), {
//       expires: 7,
//       secure: true,
//       httpOnly: false,
//       path: "/Companygw"
//     });
//   }

//   Cookies.set("isCompanyAdmin", JSON.stringify(userData.isCompanyAdmin), {
//     expires: 7,
//     secure: true,
//     httpOnly: false,
//     path: "/Companygw"
//   });

//   // Store other user data in cookies
//   Cookies.set("companyCode", JSON.stringify(userData.companyCode), {
//     expires: 7,
//     secure: true,
//     httpOnly: false,
//     path: "/Companygw"
//   });
//   Cookies.set("permissions", JSON.stringify(userData.permissions), {
//     expires: 7,
//     secure: true,
//     httpOnly: false,
//     path: "/Companygw"
//   });
//   Cookies.set("servicePackageId", JSON.stringify(userData.servicePackageId), {
//     expires: 7,
//     secure: true,
//     httpOnly: false,
//     path: "/Companygw"
//   });

//   Cookies.set("enabledTransactionCategories", JSON.stringify(userData.enabledTransactionCategories), {
//     expires: 7,
//     secure: true,
//     httpOnly: false,
//     path: "/Companygw"
//   });
  
  

//   // Route based on companyStatus
//   if (
//     userData.companyStatus === "approved" &&
//     (userData.isCompanyAdmin || userData.isActive)
//   ) {
//     const localeCookie = Cookies.get("NEXT_LOCALE");
//     const locale =
//       (localeCookie?.split("-")[0]?.toLowerCase() === "en" ? "en" : "ar");
//     router.push(`/${locale}/dashboard`);
//   }
  
//   /* NEW branch – non-admin & inactive */
//   else if (!userData.isCompanyAdmin && !userData.isActive) {
//     if (onCompanyNotApproved) {
//       onCompanyNotApproved(
//         "inactiveUser",                 // any tag you like
//         "حساب المستخدم غير نشط"         // message: user is not active
//       );
//     }
//   }
  
//   /* Existing branches stay the same */
//   else if (
//     userData.companyStatus === "missingInformation" &&
//     userData.isCompanyAdmin
//   ) {
//     const encodedMsg = encodeURIComponent(userData.companyStatusMessage || "");
//     router.push(`/auth/register/${userData.companyCode}?msg=${encodedMsg}`);
//   } else if (
//     userData.companyStatus === "missingsDocuments" &&
//     userData.isCompanyAdmin
//   ) {
//     const encodedMsg = encodeURIComponent(userData.companyStatusMessage || "");
//     router.push(
//       `/auth/register/uploadDocuments/${userData.companyCode}?msg=${encodedMsg}`
//     );
//   } else {
//     console.log("company status not approved", userData);
//     if (onCompanyNotApproved) {
//       onCompanyNotApproved(
//         userData.companyStatus!,
//         userData.companyStatusMessage || "حالة الشركة غير مقبولة"
//       );
//     }
//   }
  
// }


/* ──────────────────────────────────────────────────────────────────────────────
   /app/helpers/authentication/authHandler.ts
   - Client-only helpers that call SAME-ORIGIN Next.js API routes
   - Avoids CSP issues (connect-src 'self')
   - Uses HttpOnly cookies set by server for tokens
────────────────────────────────────────────────────────────────────────────── */

import Cookies from "js-cookie";

type SimpleRouter = { push: (url: string) => void };
type OnCompanyNotApproved = (status: string, msg: string) => void;

export type LoginFormValues = { login: string; password: string };

export type ForgotPasswordValues = { email: string };

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

type LoginUpstream = {
  requiresTwoFactorEnable?: boolean;
  requiresTwoFactor?: boolean;
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  companyStatus?: string;
  companyStatusMessage?: string;
  isCompanyAdmin?: boolean;
  isActive?: boolean;
  companyCode?: string | null;
  permissions?: unknown;
  servicePackageId?: number | null;
  enabledTransactionCategories?: unknown;
};

export async function loginHandler(
  values: LoginFormValues,
  { router, onTwoFactorRequired, onError, onCompanyNotApproved }: LoginHandlerOptions
): Promise<void> {
  try {
    const response = await fetch(`/Companygw/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "include", // ensure cookies from API response are stored
    });

    if (!response.ok) {
      throw new Error("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
    }

    const data: LoginUpstream = await response.json();

    // Save login so verification form can reuse it (if needed)
    localStorage.setItem("auth_login", values.login);

    // 1) 2FA flows
    if (data.requiresTwoFactorEnable) {
      router.push("/auth/qr");
      return;
    }
    if (data.requiresTwoFactor) {
      if (onTwoFactorRequired) {
        onTwoFactorRequired();
      }
      return;
    }

    // 2) Tokens are already set in HttpOnly cookies by the API.
    //    We still need to route based on company status…
    await loginRoutingHandler(router, onCompanyNotApproved);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    if (onError) {
      onError(msg);
    }
  }
}

type ForgotPasswordHandlerOptions = {
  onSuccess?: (login: string) => void;
  onError?: (msg: string) => void;
};

export async function forgotPasswordHandler(
  values: ForgotPasswordValues,
  { onSuccess, onError }: ForgotPasswordHandlerOptions
): Promise<void> {
  try {
    const res = await fetch(`/Companygw/api/auth/customer-forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("فشل إرسال طلب إعادة تعيين كلمة المرور.");
    }

    alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    if (onSuccess) {
      onSuccess(values.email);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
    if (onError) {
      onError(msg);
    } else {
      alert(msg);
    }
  }
}

export async function resetPasswordHandler(
  values: ResetPasswordValues,
  { onSuccess, onError }: ResetPasswordHandlerOptions
): Promise<void> {
  try {
    const res = await fetch(`/Companygw/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("فشل إعادة تعيين كلمة المرور.");
    }
    alert("تم تغيير كلمة المرور بنجاح.");
    if (onSuccess) {
      onSuccess();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
    if (onError) {
      onError(msg);
    } else {
      alert(msg);
    }
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
   Login routing helper
   - Uses data fetched server-side via /Companygw/api/users/me
   - Keeps your existing cookies you set for UI logic (non-sensitive)
────────────────────────────────────────────────────────────────────────────── */

type DetailedUser = {
  id: number;
  isCompanyAdmin: boolean;
  isActive: boolean;
  companyStatus: "approved" | "missingInformation" | "missingsDocuments" | string;
  companyStatusMessage?: string | null;
  companyCode?: string | null;
  permissions?: unknown;
  servicePackageId?: number | null;
  accounts?: unknown;
  enabledTransactionCategories?: unknown;
};

export async function loginRoutingHandler(
  router: SimpleRouter,
  onCompanyNotApproved?: OnCompanyNotApproved
): Promise<void> {
  // Ask server for "who am I" using token in HttpOnly cookies:
  const me = await getUserByIdViaApi(); // calls /Companygw/api/users/me (see API routes)

  // Cache some non-sensitive UI data in JS cookies (optional)
  if (me.accounts) {
    Cookies.set("statementAccounts", JSON.stringify(me.accounts));
  }
  Cookies.set("isCompanyAdmin", JSON.stringify(me.isCompanyAdmin));
  Cookies.set("companyCode", JSON.stringify(me.companyCode ?? ""));
  Cookies.set("permissions", JSON.stringify(me.permissions ?? []));
  Cookies.set("servicePackageId", JSON.stringify(me.servicePackageId ?? null));
  Cookies.set(
    "enabledTransactionCategories",
    JSON.stringify(me.enabledTransactionCategories ?? [])
  );

  if (me.companyStatus === "approved" && (me.isCompanyAdmin || me.isActive)) {
    const localeCookie = Cookies.get("NEXT_LOCALE");
    const locale = localeCookie?.split("-")[0]?.toLowerCase() === "en" ? "en" : "ar";
    router.push(`/${locale}/dashboard`);
    return;
  }

  if (!me.isCompanyAdmin && !me.isActive) {
    if (onCompanyNotApproved) {
      onCompanyNotApproved("inactiveUser", "حساب المستخدم غير نشط");
    }
    return;
  }

  if (me.companyStatus === "missingInformation" && me.isCompanyAdmin) {
    const msg = encodeURIComponent(me.companyStatusMessage ?? "");
    router.push(`/auth/register/${me.companyCode}?msg=${msg}`);
    return;
  }

  if (me.companyStatus === "missingsDocuments" && me.isCompanyAdmin) {
    const msg = encodeURIComponent(me.companyStatusMessage ?? "");
    router.push(`/auth/register/uploadDocuments/${me.companyCode}?msg=${msg}`);
    return;
  }

  if (onCompanyNotApproved) {
    onCompanyNotApproved(me.companyStatus, me.companyStatusMessage || "حالة الشركة غير مقبولة");
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
   getUserByIdViaApi (client → server proxy)
   - Prefer /Companygw/api/users/me (server derives userId from JWT)
────────────────────────────────────────────────────────────────────────────── */

export async function getUserByIdViaApi(): Promise<DetailedUser> {
  const res = await fetch(`/Companygw/api/users/me`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch current user: ${res.status} ${res.statusText}`);
  }
  const data: DetailedUser = await res.json();
  return data;
}
