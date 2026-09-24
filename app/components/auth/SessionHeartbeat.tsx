"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;
const LOGIN_URL = "/Companygw/auth/login";

type HeartbeatResponse = {
  success?: boolean;
  status?: number;
  code?: string;
};

function redirectToLogin(): void {
  window.location.replace(LOGIN_URL);
}

export default function SessionHeartbeat() {
  useEffect(() => {
    let stopped = false;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch("/Companygw/api/auth/session/heartbeat", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        let data: HeartbeatResponse | null = null;
        try {
          data = (await response.json()) as HeartbeatResponse;
        } catch {
          data = null;
        }

        if (!stopped && (!response.ok || data?.success === false)) {
          redirectToLogin();
        }
      } catch {
        // Network hiccups should not force logout. The backend idle timeout is authoritative.
      }
    };

    // Refresh the session as soon as the authenticated shell mounts. Waiting
    // here can let the first protected page requests race the idle timeout.
    void sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
