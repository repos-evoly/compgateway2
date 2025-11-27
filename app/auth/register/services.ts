// app/auth/register/services.ts
import { handleApiResponse, ensureApiSuccess } from "@/app/helpers/apiResponse";
import type {
  TAttachment,
  TCompanyRegistrationInfo,
  TEditCompanyInfoPayload,
  TKycResponse,
  TRegisterFields,
  TRegisterResponse,
} from "./types";

const API_ROOT = "/Companygw/api" as const;

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

  return handleApiResponse<TKycResponse>(
    response,
    "Failed to fetch KYC details."
  );
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

  return handleApiResponse<TRegisterResponse>(
    response,
    "Failed to register company."
  );
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

  await ensureApiSuccess(response, "Failed to upload documents.");
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

  const payload = await handleApiResponse<{ id?: string } | undefined>(
    response,
    "Failed to upload document."
  );

  return payload?.id;
}

export async function getCompanyRegistrationInfoByCode(
  code: string
): Promise<TCompanyRegistrationInfo> {
  const response = await fetch(
    `${API_ROOT}/companies/getInfo/${encodeURIComponent(code)}`,
    withDefaults({ method: "GET" })
  );

  return handleApiResponse<TCompanyRegistrationInfo>(
    response,
    "Failed to fetch company info."
  );
}

export async function editCompanyInfo(
  userId: string,
  data: TEditCompanyInfoPayload
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/companies/public/users/${encodeURIComponent(userId)}/update`,
    {
      ...withDefaults({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    }
  );

  await ensureApiSuccess(response, "Failed to edit company info.");
}

export async function getCompanyAttachments(code: string): Promise<TAttachment[]> {
  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments`,
    withDefaults({ method: "GET" })
  );

  return handleApiResponse<TAttachment[]>(
    response,
    "Failed to fetch attachments."
  );
}

export async function deleteAttachment(
  code: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_ROOT}/companies/${encodeURIComponent(code)}/attachments/${encodeURIComponent(attachmentId)}/delete`,
    withDefaults({ method: "POST" })
  );

  await ensureApiSuccess(response, "Failed to delete attachment.");
}
