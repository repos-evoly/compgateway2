import { NextRequest } from "next/server";
import { handleTwoFactorVerification } from "@/app/api/auth/_twoFactorProxy";

export async function POST(req: NextRequest) {
  return handleTwoFactorVerification(req, "verify-initial-2fa");
}
