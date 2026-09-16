"use client";

import type {
  ActivationCodeResult,
  CreateActivationCodeRequest,
  MobileDevice,
  MobileDevicePage,
} from "./types";

const API_ROOT = "/Companygw/api/mobile-access";

const parseResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  const text = await response.text();
  let payload: unknown;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? (payload as { detail?: unknown }).detail
        : undefined;
    throw new Error(typeof detail === "string" && detail.trim() ? detail : fallback);
  }

  return payload as T;
};

const request = (path: string, init: RequestInit = {}) =>
  fetch(`${API_ROOT}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

export async function listMobileDevices(
  page: number,
  limit: number,
  status?: string
): Promise<MobileDevicePage> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set("status", status);

  return parseResponse<MobileDevicePage>(
    await request(`/devices?${query.toString()}`),
    "Failed to load registered mobile devices."
  );
}

export async function createActivationCode(
  payload: CreateActivationCodeRequest
): Promise<ActivationCodeResult> {
  return parseResponse<ActivationCodeResult>(
    await request("/activation-codes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Failed to generate an activation code."
  );
}

async function changeDeviceStatus(
  deviceId: string,
  action: "approve" | "revoke"
): Promise<MobileDevice> {
  return parseResponse<MobileDevice>(
    await request(`/devices/${encodeURIComponent(deviceId)}/${action}`, {
      method: "POST",
    }),
    `Failed to ${action} the mobile device.`
  );
}

export const approveMobileDevice = (deviceId: string) =>
  changeDeviceStatus(deviceId, "approve");

export const revokeMobileDevice = (deviceId: string) =>
  changeDeviceStatus(deviceId, "revoke");
