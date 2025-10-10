"use client";

import { handleApiResponse } from "@/app/helpers/apiResponse";
import { DetailedUser } from "@/types";

export async function getUserById(userId: number): Promise<DetailedUser> {
  const response = await fetch(`/Companygw/api/users/by-auth/${userId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return handleApiResponse<DetailedUser>(
    response,
    `Failed to fetch user with ID ${userId}.`
  );
}
