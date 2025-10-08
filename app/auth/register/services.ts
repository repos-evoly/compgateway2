// app/auth/register/services.ts
import type {
  TAttachment,
  TCompanyRegistrationInfo,
  TEditCompanyInfoPayload,
  TKycResponse,
  TRegisterFields,
  TRegisterResponse,
} from "./types";

const API_ROOT = "/Companygw/api" as const;

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

const withDefaults = (init: RequestInit = {}): RequestInit => ({
  cache: "no-store",
  credentials: "include",
  ...init,
});

export async function getKycByCode(code: string): Promise<TKycResponse> {
  const response = await fetch(
    `${API_ROOT}/companies/kyc/${encodeURIComponent(code)}`,
    withDefaults({ method: "GET" })
  );

  if (!response.ok) {
    throw new Error(await readServerError(response));
  }

  return response.json();
}

export async function registerCompany(
  data: TRegisterFields
): Promise<TRegisterResponse> {
  const response = await fetch(`${API_ROOT}/companies/register`, {
    ...withDefaults({
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
    }),
  });

  if (!response.ok) {
    throw new Error(await readServerError(response));
  }

  return response.json();
}

export async function uploadDocuments(
  code: string,
  email: string,
  passportFiles: File[],
  birthFiles: File[]
): Promise<void> {
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
  allFiles.forEach((file, index) => {
    formData.append("files", file);
    formData.append("Subject", subjects[index]);
    formData.append("Description", descriptions[index]);
  });
  formData.append("CreatedBy", email);

  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments/UploadBatch`,
    withDefaults({ method: "POST", body: formData })
  );

  if (!response.ok) {
    throw new Error(`Failed to upload documents. ${await readServerError(response)}`);
  }
}

export async function uploadSingleDocument(
  code: string,
  file: File,
  options: {
    subject?: string;
    description?: string;
    createdBy?: string;
  } = {}
): Promise<string | undefined> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const formData = new FormData();
  formData.append("files", file);
  formData.append("Subject", options.subject ?? "Logo");
  formData.append("Description", options.description ?? "Company logo");
  if (options.createdBy && options.createdBy.trim()) {
    formData.append("CreatedBy", options.createdBy.trim());
  }

  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments/UploadBatch`,
    withDefaults({ method: "POST", body: formData })
  );

  if (!response.ok) {
    throw new Error(`Failed to upload document. ${await readServerError(response)}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.json()) as { id?: string } | null;
      return payload?.id;
    } catch (error) {
      console.warn("uploadSingleDocument: response parsing failed", error);
    }
  }

  return undefined;
}

export async function getCompanyRegistrationInfoByCode(
  code: string
): Promise<TCompanyRegistrationInfo> {
  const response = await fetch(
    `${API_ROOT}/companies/getInfo/${encodeURIComponent(code)}`,
    withDefaults({ method: "GET" })
  );

  if (!response.ok) {
    throw new Error(await readServerError(response));
  }

  return response.json();
}

export async function editCompanyInfo(
  userId: string,
  data: TEditCompanyInfoPayload
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/companies/public/users/${encodeURIComponent(userId)}`,
    {
      ...withDefaults({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to edit company info. ${await readServerError(response)}`);
  }
}

export async function getCompanyAttachments(code: string): Promise<TAttachment[]> {
  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments`,
    withDefaults({ method: "GET" })
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch attachments. ${await readServerError(response)}`);
  }

  return response.json() as Promise<TAttachment[]>;
}

export async function deleteAttachment(
  code: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments/${encodeURIComponent(attachmentId)}`,
    withDefaults({ method: "DELETE" })
  );

  if (!response.ok) {
    throw new Error(`Failed to delete attachment. ${await readServerError(response)}`);
  }
}
