"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";
import { useTranslations } from "next-intl";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Represents a single notification object (front‑end only). */
export type Notification = {
  id?: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  subject: string;
  message: string;
  link: string; // e.g. "transactions/6", "unblock/1", etc.
  isRead: boolean;
  createdAt: string;
};

/** Props for NotificationPanel */
export type NotificationPanelProps = {
  notifications: Notification[]; // provided by parent
  show: boolean; // whether to show the panel
  isRTL: boolean;
  onClose?: () => void;
  onMarkAsRead?: (index: number) => void;
  onNotificationsChange?: (updatedList: Notification[]) => void;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  show,
  isRTL,
  onClose,
  onMarkAsRead,
  onNotificationsChange,
}) => {
  const router = useRouter();
  const t = useTranslations("notifications");

  /* -------------------- local state ------------------------------------- */
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    []
  );
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread">("all");

  /* -------------------- sync props → local ------------------------------ */
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  /* -------------------- default tab when opened ------------------------- */
  useEffect(() => {
    if (show) setActiveTab("unread");
  }, [show]);

  /* -------------------- expand all on open ------------------------------ */
  useEffect(() => {
    if (show && localNotifications.length > 0) {
      const expanded: Record<number, boolean> = {};
      localNotifications.forEach((_, i) => (expanded[i] = true));
      setExpandedItems(expanded);
    }
  }, [show, localNotifications]);

  /* -------------------- helpers ---------------------------------------- */
  const panelPosition = isRTL
    ? "absolute top-2 right-full mr-2"
    : "absolute top-2 left-full ml-2";

  const arrowPosition = isRTL
    ? "absolute top-3 right-[-8px] border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#414141]"
    : "absolute top-3 left-[-8px] border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#414141]";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const toggleExpand = (idx: number) =>
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));

  /* -------------------- filtering -------------------------------------- */
  const filteredNotifications = localNotifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "read") return n.isRead;
    if (activeTab === "unread") return !n.isRead;
    return true;
  });

  /* -------------------- mark as read (front‑end only) ------------------- */
  const handleLocalMarkAsRead = (idx: number) => {
    const noti = filteredNotifications[idx];
    if (!noti) return;

    const globalIndex = localNotifications.findIndex((x) => x.id === noti.id);
    if (globalIndex >= 0) {
      const updated = [...localNotifications];
      updated[globalIndex] = { ...updated[globalIndex], isRead: true };
      setLocalNotifications(updated);
      onNotificationsChange?.(updated);
      onMarkAsRead?.(globalIndex);
    }
  };

  /* -------------------- navigation helper ------------------------------ */
  const handleViewDetails = (notiLink: string) => {
    const matchTx = notiLink.match(/^transactions\/(\d+)/);
    if (matchTx) {
      router.push(`/transactions?autoOpen=${matchTx[1]}`);
      return;
    }
    const matchUnblock = notiLink.match(/^unblock\/(\d+)/);
    if (matchUnblock) {
      router.push(`/unblock?autoOpen=${matchUnblock[1]}`);
      return;
    }
    router.push(`/${notiLink}`);
  };

  /* -------------------- early exit ------------------------------------- */
  if (!show) return null;

  /* -------------------- render ----------------------------------------- */
  return (
    <div
      className={`${panelPosition} w-80 bg-[#414141] text-white rounded-lg shadow-xl z-50 overflow-hidden`}
    >
      <div className={arrowPosition} />

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-600">
        <div className="font-medium text-sm">
          {t("title")}
          {localNotifications.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {localNotifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <IoClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        {(["all", "unread", "read"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-medium py-2 text-center transition-colors ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-300 hover:text-gray-100"
            }`}
          >
            {t(tab)}
            {tab !== "all" && (
              <span className="ml-1 text-xs">
                (
                {
                  localNotifications.filter((n) =>
                    tab === "unread" ? !n.isRead : n.isRead
                  ).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-gray-300">
            <div className="h-12 w-12 mb-2 flex items-center justify-center">
              <div className="relative inline-flex">
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 rounded-full" />
              </div>
            </div>
            <div className="text-sm font-medium">
              {activeTab === "all"
                ? "No notifications yet"
                : activeTab === "read"
                ? "No read notifications"
                : "No unread notifications"}
            </div>
            {activeTab === "all" && (
              <div className="text-xs mt-1">
                Well notify you when something arrives
              </div>
            )}
          </div>
        )}

        {filteredNotifications.map((notification, idx) => {
          const globalIndex = localNotifications.findIndex(
            (n) => n.id === notification.id
          );

          return (
            <div
              key={notification.id ?? idx}
              className={`border-b border-gray-600 transition-colors ${
                notification.isRead ? "opacity-60" : "opacity-100"
              } ${!notification.isRead && "bg-[#4d4d4d]"}`}
            >
              {/* Header */}
              <div
                className="p-3 flex justify-between items-start cursor-pointer"
                onClick={() => toggleExpand(globalIndex)}
              >
                <div className="flex-grow">
                  <div className="font-semibold text-sm truncate pr-2">
                    {notification.subject}
                  </div>
                  <div className="text-xs text-gray-300">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(globalIndex);
                  }}
                  className="text-gray-300 hover:text-white p-1 transition-colors flex-shrink-0"
                >
                  {expandedItems[globalIndex] ? (
                    <IoChevronUp className="h-4 w-4" />
                  ) : (
                    <IoChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Body */}
              {expandedItems[globalIndex] && (
                <div className="px-4 pb-3">
                  <div className="text-xs text-gray-300 mb-2">
                    From: {notification.fromUserName}
                  </div>
                  <div className="text-sm mb-3 text-gray-200">
                    {notification.message}
                  </div>
                  <div className="flex justify-between items-center">
                    {notification.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(notification.link);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline"
                      >
                        {t("viewDetails")}
                      </button>
                    )}

                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocalMarkAsRead(idx);
                        }}
                        className="text-xs bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white px-3 py-1 rounded-full transition-all"
                      >
                        {t("markAsRead")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;
