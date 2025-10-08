"use client";

import { throwApiError } from "@/app/helpers/handleApiError";
import type {
  Representative,
  RepresentativeFormValues,
  RepresentativesResponse,
} from "./types";

const API_BASE = "/Companygw/api/representatives" as const;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  credentials: "include",
  cache: "no-store",
  ...init,
});

const buildListUrl = (page: number, limit: number, search?: string): string => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    params.set("search", search);
  }
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
};

export const getRepresentatives = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<RepresentativesResponse> => {
  const response = await fetch(buildListUrl(page, limit, search), withCredentials());

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch representatives");
  }

  return (await response.json()) as RepresentativesResponse;
};

const buildFormData = (values: RepresentativeFormValues): FormData => {
  const formData = new FormData();
  formData.append("Name", values.name);
  formData.append("Number", values.number);
  formData.append("PassportNumber", values.passportNumber);
  formData.append("IsActive", String(values.isActive));
  if (values.photo && values.photo[0]) {
    formData.append("Photo", values.photo[0]);
  }
  return formData;
};

export const createRepresentative = async (
  values: RepresentativeFormValues
): Promise<Representative> => {
  const response = await fetch(
    API_BASE,
    withCredentials({
      method: "POST",
      body: buildFormData(values),
    })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to create representative");
  }

  return (await response.json()) as Representative;
};

export const updateRepresentative = async (
  id: number,
  values: RepresentativeFormValues
): Promise<Representative> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({
      method: "PUT",
      body: buildFormData(values),
    })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to update representative");
  }

  return (await response.json()) as Representative;
};

export const getRepresentativeById = async (id: number): Promise<Representative> => {
  const response = await fetch(`${API_BASE}/${id}`, withCredentials());

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch representative by ID");
  }

  return (await response.json()) as Representative;
};

export const deleteRepresentative = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/${id}`,
    withCredentials({ method: "DELETE" })
  );

  if (!response.ok) {
    await throwApiError(response, "Failed to delete representative");
  }
};

export const toggleRepresentativeStatus = async (
  id: number
): Promise<Representative> => {
  const current = await getRepresentativeById(id);

  const nextValues: RepresentativeFormValues = {
    name: current.name,
    number: current.number,
    passportNumber: current.passportNumber ?? "",
    isActive: !current.isActive,
  };

  return updateRepresentative(id, nextValues);
};
