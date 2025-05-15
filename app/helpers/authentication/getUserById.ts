import { getAccessTokenFromCookies } from "../tokenHandler";
import { DetailedUser } from "@/types"; // or wherever you placed DetailedUser

/**
 * Fetch a user from /users/by-auth/{userId}
 * and return the full DetailedUser shape.
 */
export async function getUserById(userId: number): Promise<DetailedUser> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No access token found in cookies.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  console.log("Base URL:", baseUrl);
  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_DEFINITIONS_URL is not defined in environment variables."
    );
  }

  // GET /users/by-auth/{userId}
  const response = await fetch(`${baseUrl}/users/by-auth/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user with ID ${userId}: ` + response.statusText
    );
  }

  const data = await response.json();
  console.log("User from API:", data);

  // Cast to our new type
  return data as DetailedUser;
}
