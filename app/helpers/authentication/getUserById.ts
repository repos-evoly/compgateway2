"use client";

import { DetailedUser } from "@/types";

export async function getUserById(userId: number): Promise<DetailedUser> {
  const response = await fetch(`/Companygw/api/users/by-auth/${userId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user with ID ${userId}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as DetailedUser;
}
