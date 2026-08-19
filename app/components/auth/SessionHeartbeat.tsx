"use client";

import { useEffect } from "react";
import {
  classifySessionHeartbeat,
  type SessionHeartbeatPayload,
} from "@/app/lib/sessionHeartbeat";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const HEARTBEAT_REQUEST_TIMEOUT_MS = 15 * 1000;
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000, 60_000] as const;
const LOGIN_URL = "/Companygw/auth/login";

function redirectToLogin(): void {
  window.location.replace(LOGIN_URL);
}

export default function SessionHeartbeat() {
  useEffect(() => {
    let stopped = false;
    let redirecting = false;
    let inFlight = false;
    let pendingImmediateRun = false;
    let failedAttempts = 0;
    let heartbeatTimer: number | undefined;
    let requestTimeout: number | undefined;
    let activeController: AbortController | null = null;

    const clearHeartbeatTimer = () => {
      if (heartbeatTimer !== undefined) {
        window.clearTimeout(heartbeatTimer);
        heartbeatTimer = undefined;
      }
    };

    const retryDelay = () => {
      const delay =
        RETRY_DELAYS_MS[
          Math.min(failedAttempts, RETRY_DELAYS_MS.length - 1)
        ];
      failedAttempts += 1;
      return delay;
    };

    const scheduleHeartbeat = (delay: number) => {
      if (stopped || redirecting) return;

      clearHeartbeatTimer();
      heartbeatTimer = window.setTimeout(() => {
        heartbeatTimer = undefined;
        void sendHeartbeat();
      }, delay);
    };

    const sendHeartbeat = async () => {
      if (stopped || redirecting) return;

      if (inFlight) {
        pendingImmediateRun = true;
        return;
      }

      if (!navigator.onLine) {
        scheduleHeartbeat(retryDelay());
        return;
      }

      inFlight = true;
      let nextDelay = HEARTBEAT_INTERVAL_MS;
      const controller = new AbortController();
      activeController = controller;
      requestTimeout = window.setTimeout(
        () => controller.abort(),
        HEARTBEAT_REQUEST_TIMEOUT_MS
      );

      try {
        const response = await fetch("/Companygw/api/auth/session/heartbeat", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        let data: SessionHeartbeatPayload | null = null;
        try {
          const value: unknown = await response.json();
          data =
            value && typeof value === "object" && !Array.isArray(value)
              ? (value as SessionHeartbeatPayload)
              : null;
        } catch {
          data = null;
        }

        const heartbeatResult = classifySessionHeartbeat(response.status, data);

        if (!stopped && heartbeatResult === "invalid") {
          redirecting = true;
          clearHeartbeatTimer();
          redirectToLogin();
          return;
        }

        if (heartbeatResult === "healthy") {
          failedAttempts = 0;
        } else {
          nextDelay = retryDelay();
        }
      } catch {
        if (!stopped) {
          nextDelay = retryDelay();
        }
      } finally {
        if (requestTimeout !== undefined) {
          window.clearTimeout(requestTimeout);
          requestTimeout = undefined;
        }
        if (activeController === controller) {
          activeController = null;
        }
        inFlight = false;

        if (stopped || redirecting) return;

        if (pendingImmediateRun) {
          pendingImmediateRun = false;
          scheduleHeartbeat(0);
        } else {
          scheduleHeartbeat(nextDelay);
        }
      }
    };

    const requestImmediateHeartbeat = () => {
      if (stopped || redirecting) return;

      if (inFlight) {
        pendingImmediateRun = true;
        return;
      }

      scheduleHeartbeat(0);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestImmediateHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", requestImmediateHeartbeat);
    window.addEventListener("online", requestImmediateHeartbeat);
    window.addEventListener("pageshow", requestImmediateHeartbeat);

    requestImmediateHeartbeat();

    return () => {
      stopped = true;
      clearHeartbeatTimer();
      if (requestTimeout !== undefined) {
        window.clearTimeout(requestTimeout);
      }
      activeController?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", requestImmediateHeartbeat);
      window.removeEventListener("online", requestImmediateHeartbeat);
      window.removeEventListener("pageshow", requestImmediateHeartbeat);
    };
  }, []);

  return null;
}
