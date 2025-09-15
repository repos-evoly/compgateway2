// app/auth/register/services.ts
import {
  TKycResponse,
  TRegisterFields,
  TRegisterResponse,
  TCompanyRegistrationInfo,
  TEditCompanyInfoPayload,
  TAttachment,
} from "./types";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

function requireBaseApi(): string {
  if (!BASE_API || BASE_API.trim().length === 0) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  return BASE_API;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

async function readServerError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body: unknown = await response.json();

    if (body && typeof body === "object") {
      const obj = body as Record<string, unknown>;

      if (typeof obj.message === "string" && obj.message.trim().length > 0) {
        return obj.message;
      }
      if (typeof obj.error === "string" && obj.error.trim().length > 0) {
        return obj.error;
      }

      if (Array.isArray(obj.errors) && isStringArray(obj.errors)) {
        return obj.errors.join(" • ");
      }
      if (obj.errors && typeof obj.errors === "object") {
        const entries = Object.entries(obj.errors as Record<string, unknown>);
        const parts: string[] = [];
        for (const [key, val] of entries) {
          if (isStringArray(val)) {
            parts.push(`${key}: ${val.join(", ")}`);
          } else if (typeof val === "string") {
            parts.push(`${key}: ${val}`);
          }
        }
        if (parts.length > 0) return parts.join(" • ");
      }

      if (typeof obj.title === "string" && obj.title.trim().length > 0) {
        return obj.title;
      }
      if (typeof obj.detail === "string" && obj.detail.trim().length > 0) {
        return obj.detail;
      }
    }
  }

  const fallbackText = (await response.text()).trim();
  if (fallbackText.length > 0) return fallbackText;

  return `Request failed with status ${response.status}`;
}

export async function getKycByCode(code: string): Promise<TKycResponse> {
  const api = requireBaseApi();
  const response = await fetch(`${api}/companies/kyc/${encodeURIComponent(code)}`, {
    method: "GET",
  });
  if (!response.ok) {
    const msg = await readServerError(response);
    throw new Error(msg);
  }
  return response.json();
}

export async function registerCompany(
  data: TRegisterFields
): Promise<TRegisterResponse> {
  const api = requireBaseApi();
  const response = await fetch(`${api}/companies/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyCode: data.companyCode,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      roleId: data.roleId,
    }),
  });

  if (!response.ok) {
    const message = await readServerError(response);
    throw new Error(message);
  }

  return response.json();
}

export async function uploadDocuments(
  code: string,
  email: string,
  passportFiles: File[],
  birthFiles: File[]
): Promise<void> {
  const api = requireBaseApi();

  const allFiles = [...passportFiles, ...birthFiles];
  if (allFiles.length === 0) {
    throw new Error("No files selected for upload.");
    }

  const subjects: string[] = [];
  const descriptions: string[] = [];

  passportFiles.forEach(() => {
    subjects.push("Passport");
    descriptions.push("Passport document");
  });
  birthFiles.forEach(() => {
    subjects.push("Birth");
    descriptions.push("Certified birth statement");
  });

  const formData = new FormData();
  allFiles.forEach((file, i) => {
    formData.append("files", file);
    formData.append("Subject", subjects[i]);
    formData.append("Description", descriptions[i]);
  });
  formData.append("CreatedBy", email);

  const url = `${api}/companies/${encodeURIComponent(code)}/attachments/UploadBatch`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const msg = await readServerError(res);
    throw new Error(`Failed to upload documents. ${msg}`);
  }
}

export async function getCompanyRegistrationInfoByCode(
  code: string
): Promise<TCompanyRegistrationInfo> {
  const api = requireBaseApi();
  const response = await fetch(`${api}/companies/getInfo/${encodeURIComponent(code)}`, {
    method: "GET",
  });
  if (!response.ok) {
    const msg = await readServerError(response);
    throw new Error(msg);
  }
  return response.json();
}

export async function editCompanyInfo(
  userId: string,
  data: TEditCompanyInfoPayload
): Promise<void> {
  const api = requireBaseApi();
  const response = await fetch(`${api}/companies/public/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const msg = await readServerError(response);
    throw new Error(`Failed to edit company info. ${msg}`);
  }
}

export async function getCompanyAttachments(code: string): Promise<TAttachment[]> {
  const api = requireBaseApi();
  const url = `${api}/companies/${encodeURIComponent(code)}/attachments`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const msg = await readServerError(response);
    throw new Error(`Failed to fetch attachments. ${msg}`);
  }

  return response.json() as Promise<TAttachment[]>;
}

export async function deleteAttachment(code: string, attachmentId: string): Promise<void> {
  const api = requireBaseApi();
  const url = `${api}/companies/${encodeURIComponent(code)}/attachments/${encodeURIComponent(attachmentId)}`;
  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    const msg = await readServerError(response);
    throw new Error(`Failed to delete attachment. ${msg}`);
  }
}

export async function uploadSingleDocument(
  code: string,
  file: File
): Promise<void> {
  const api = requireBaseApi();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("Subject", "logo");
  formData.append("Description", "logo");

  const url = `${api}/companies/${encodeURIComponent(code)}/attachments`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const msg = await readServerError(res);
    throw new Error(`Failed to upload document. ${msg}`);
  }
}
