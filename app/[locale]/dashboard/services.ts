import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { Dashboard } from "./types";


const token = getAccessTokenFromCookies();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;


export async function getDashboardData(code:string): Promise<Dashboard>{

    if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_BASE_API is not defined");
    }

    if (!token) {
        throw new Error("No access token found in cookies");
    }

    const url = `${BASE_URL}/companies/${code}/dashboard`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch dashboard data. Status: ${res.status}`);
    }

    const data = await res.json();
    return data as Dashboard;
}