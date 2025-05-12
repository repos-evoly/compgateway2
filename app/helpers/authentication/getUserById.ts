import { User } from "@/types";
import { getAccessTokenFromCookies } from "../tokenHandler";

export async function getUserById(userId: number): Promise<User> {
    const token = getAccessTokenFromCookies();
    if (!token) {
      throw new Error("No access token found in cookies.");
    }
  
    const baseUrl = process.env.NEXT_PUBLIC_DEFINITIONS_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_DEFINITIONS_URL is not defined in environment variables."
      );
    }
  
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
    console.log(data);
    return data as User;
  }