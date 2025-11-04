"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";

import { documentUploadDefinitions } from "./data";

import type {
  TEdfaaliFormValues,
  TEdfaaliListItem,
  EdfaaliRequestApiItem,
  EdfaaliRequestsList,
  EdfaaliRequestsListApiResponse,
  DocumentType,
} from "./types";

const API_ROOT = "/Companygw/api/edfaalirequests" as const;

const withDefaults = (init: RequestInit = {}): RequestInit => ({
  cache: "no-store",
  credentials: "include",
  ...init,
});

const orderedDocumentTypes: DocumentType[] = documentUploadDefinitions.map(
  (definition) => definition.type
);

const identificationTypeMap: Record<string, string> = {
  nationalId: "NationalID",
  passport: "Passport",
  commercialLicense: "CommercialLicense",
};

const mapIdentificationType = (value: string): string =>
  identificationTypeMap[value] ?? value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitize = (value: string | null | undefined): string =>
  typeof value === "string" ? value.trim() : "";

const isApiItem = (value: unknown): value is EdfaaliRequestApiItem =>
  isRecord(value) &&
  ("representativeId" in value ||
    "accountNumber" in value ||
    "identificationNumber" in value);

const buildFormData = (values: TEdfaaliFormValues): FormData => {
  const dto = {
    representativeId: sanitize(values.representativeId),
    nationalId: sanitize(values.nationalId),
    identificationNumber: sanitize(values.identificationNumber),
    identificationType: mapIdentificationType(values.identificationType ?? ""),
    companyEnglishName: sanitize(values.companyEnglishName),
    workAddress: sanitize(values.workAddress),
    storeAddress: sanitize(values.storeAddress),
    city: sanitize(values.city),
    area: sanitize(values.area),
    street: sanitize(values.street),
    mobileNumber: sanitize(values.mobileNumber),
    servicePhoneNumber: sanitize(values.servicePhoneNumber),
    bankAnnouncementPhoneNumber: sanitize(
      values.bankAnnouncementPhoneNumber
    ),
    email: sanitize(values.email),
    accountNumber: sanitize(values.accountNumber),
  } as const;

  const formData = new FormData();
  formData.append("Dto", JSON.stringify(dto));

  const fileByType = new Map<DocumentType, File>();

  values.documents.forEach((document) => {
    if (document?.file) {
      fileByType.set(document.type, document.file);
    }
  });

  orderedDocumentTypes.forEach((type) => {
    const file = fileByType.get(type);
    if (file) {
      formData.append(type, file, file.name);
    }
  });

  return formData;
};

const mapApiItemToListItem = (
  item: EdfaaliRequestApiItem,
  fallback?: TEdfaaliListItem
): TEdfaaliListItem => {
  const id = item.id ?? fallback?.id ?? Date.now();
  const representativeId =
    item.representativeId ?? fallback?.representativeId ?? "";

  return {
    id: String(id),
    representativeId,
    representativeName:
      item.representativeName ?? fallback?.representativeName ?? representativeId,
    nationalId: item.nationalId ?? fallback?.nationalId ?? "",
    identificationNumber:
      item.identificationNumber ?? fallback?.identificationNumber ?? "",
    identificationType:
      item.identificationType ?? fallback?.identificationType ?? "",
    companyEnglishName:
      item.companyEnglishName ?? fallback?.companyEnglishName ?? "",
    workAddress: item.workAddress ?? fallback?.workAddress ?? "",
    storeAddress: item.storeAddress ?? fallback?.storeAddress ?? "",
    city: item.city ?? fallback?.city ?? "",
    area: item.area ?? fallback?.area ?? "",
    street: item.street ?? fallback?.street ?? "",
    mobileNumber: item.mobileNumber ?? fallback?.mobileNumber ?? "",
    servicePhoneNumber:
      item.servicePhoneNumber ?? fallback?.servicePhoneNumber ?? "",
    bankAnnouncementPhoneNumber:
      item.bankAnnouncementPhoneNumber ??
      fallback?.bankAnnouncementPhoneNumber ??
      "",
    email: item.email ?? fallback?.email ?? "",
    accountNumber: item.accountNumber ?? fallback?.accountNumber ?? "",
    createdAt: item.createdAt ?? fallback?.createdAt,
  };
};

const extractListPayload = (
  payload: EdfaaliRequestsListApiResponse | undefined
): {
  items: EdfaaliRequestApiItem[];
  meta: Pick<EdfaaliRequestsList, "page" | "limit" | "totalPages" | "totalRecords">;
} => {
  if (Array.isArray(payload)) {
    return { items: payload, meta: {} };
  }

  if (isRecord(payload)) {
    const data = Array.isArray(payload.data)
      ? (payload.data.filter((entry) => isApiItem(entry)) as EdfaaliRequestApiItem[])
      : [];

    return {
      items: data,
      meta: {
        page: typeof payload.page === "number" ? payload.page : undefined,
        limit: typeof payload.limit === "number" ? payload.limit : undefined,
        totalPages:
          typeof payload.totalPages === "number" ? payload.totalPages : undefined,
        totalRecords:
          typeof payload.totalRecords === "number"
            ? payload.totalRecords
            : undefined,
      },
    };
  }

  return { items: [], meta: {} };
};

const extractSingleItem = (
  payload: unknown
): EdfaaliRequestApiItem | undefined => {
  if (isApiItem(payload)) return payload;

  if (Array.isArray(payload)) {
    const first = payload.find((entry) => isApiItem(entry));
    if (first) return first;
  }

  if (isRecord(payload) && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (isApiItem(data)) return data;
    if (Array.isArray(data)) {
      const first = data.find((entry) => isApiItem(entry));
      if (first) return first;
    }
  }

  return undefined;
};

export async function getEdfaaliRequests(): Promise<EdfaaliRequestsList> {
  const response = await fetch(
    API_ROOT,
    withDefaults({ method: "GET" })
  );

  const payload = await handleApiResponse<EdfaaliRequestsListApiResponse | undefined>(
    response,
    "Failed to load Edfaali requests."
  );

  const { items, meta } = extractListPayload(payload);
  const data = items.map((item) => mapApiItemToListItem(item));

  return {
    data,
    ...meta,
  };
}

export async function createEdfaaliRequest(
  values: TEdfaaliFormValues
): Promise<TEdfaaliListItem> {
  const formData = buildFormData(values);

  const fallbackItem: TEdfaaliListItem = {
    id: String(Date.now()),
    representativeId: sanitize(values.representativeId),
    representativeName: sanitize(values.representativeId),
    nationalId: sanitize(values.nationalId),
    identificationNumber: sanitize(values.identificationNumber),
    identificationType: mapIdentificationType(values.identificationType ?? ""),
    companyEnglishName: sanitize(values.companyEnglishName),
    workAddress: sanitize(values.workAddress),
    storeAddress: sanitize(values.storeAddress),
    city: sanitize(values.city),
    area: sanitize(values.area),
    street: sanitize(values.street),
    mobileNumber: sanitize(values.mobileNumber),
    servicePhoneNumber: sanitize(values.servicePhoneNumber),
    bankAnnouncementPhoneNumber: sanitize(
      values.bankAnnouncementPhoneNumber
    ),
    email: sanitize(values.email),
    accountNumber: sanitize(values.accountNumber),
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(
    API_ROOT,
    withDefaults({
      method: "POST",
      body: formData,
    })
  );

  const payload = await handleApiResponse<unknown>(
    response,
    "Failed to create Edfaali request."
  );

  const apiItem = extractSingleItem(payload);

  if (apiItem) {
    return mapApiItemToListItem(apiItem, fallbackItem);
  }

  // Fallback to submitted values if API does not return the created entity
  return fallbackItem;
}
