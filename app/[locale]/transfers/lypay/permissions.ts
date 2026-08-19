"use client";

import Cookies from "js-cookie";

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const readPermissions = (): ReadonlySet<string> => {
  const raw = Cookies.get("permissions");
  if (!raw) return new Set<string>();

  const decoded = safeDecode(raw);
  try {
    const parsed: unknown = JSON.parse(decoded);
    if (Array.isArray(parsed)) {
      return new Set(
        parsed
          .filter((permission): permission is string =>
            typeof permission === "string"
          )
          .map((permission) => permission.trim().toLowerCase())
      );
    }
  } catch {
    // Fall through to support older comma-separated permission cookies.
  }

  return new Set(
    decoded
      .replace(/^\s*\[|\]\s*$/g, "")
      .split(",")
      .map((permission) =>
        permission.trim().replace(/^"+|"+$/g, "").toLowerCase()
      )
      .filter(Boolean)
  );
};

const hasAnyPermission = (permissionNames: readonly string[]): boolean => {
  const permissions = readPermissions();
  return permissionNames.some((permission) =>
    permissions.has(permission.toLowerCase())
  );
};

export const canCreateLyPayTransfer = (): boolean =>
  hasAnyPermission(["canCreateTransfer"]);

export const canApproveLyPayTransfer = (): boolean =>
  hasAnyPermission(["canposttransfer"]);
