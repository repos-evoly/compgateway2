import { getAccessTokenFromCookies } from "@/app/helpers/tokenHandler";
import { Company } from "./types";

const token = getAccessTokenFromCookies();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

export function getCompannyInfoByCode(code:string):Promise<Company>{

    if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_BASE_API is not set.");
    }
    
    const url = `${BASE_URL}/companies/getInfo/${code}`;
    
    return fetch(url, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch company info for code: ${code}`);
        }
        return res.json();
        })
        .then((data) => data as Company);
}