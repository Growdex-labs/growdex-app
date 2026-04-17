"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

// ─── Notification type ──────────────────────────────────────────────────────

export type Notification = {
  id: string;
  content: string;
  action: string;
  time: string;       // formatted time string e.g. "12:50pm"
  date: string;       // date label e.g. "Today", "Tuesday", "24 Mar"
  isRead: boolean;
};

// ─── Context shape ───────────────────────────────────────────────────────────

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return target.toLocaleDateString("en-US", { weekday: "long" }); // "Tuesday"
  }
  return target.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); // "18 Mar"
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

// ─── Seed data (static historical notifications) ─────────────────────────────

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "seed-1",
    content: "You got a new request for customer to sign in.",
    action: "Mark as read",
    time: "12:50pm",
    date: "Today",
    isRead: false,
  },
  {
    id: "seed-2",
    content: "You missed some AI optimization opportunities in Campaigns. See them here.",
    action: "Mark as read",
    time: "10:50am",
    date: "Today",
    isRead: false,
  },
  {
    id: "seed-3",
    content: "You got a new request for customer sign in.",
    action: "Mark as read",
    time: "9:00am",
    date: formatDateLabel(new Date(Date.now() - 2 * 86400000)), // 2 days ago → e.g. "Tuesday"
    isRead: true,
  },
  {
    id: "seed-4",
    content: "Campaign 'Summer Sale' has been paused due to low budget.",
    action: "Mark as read",
    time: "3:15pm",
    date: formatDateLabel(new Date(Date.now() - 2 * 86400000)),
    isRead: true,
  },
];

// ─── Provider ────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.connect();

    s.on("connect", () => {
      setIsConnected(true);
      // Backend Spec Step 2: Mandatory Identity Event
      s.emit("identity", {});
    });

    s.on("disconnect", () => setIsConnected(false));

    // Listen for Incoming Server Pushes (Backend Spec Step 3)
    s.on("notification", (data: any) => {
      console.log("New Notification Received:", data);
      
      const now = data.timestamp ? new Date(data.timestamp) : new Date();
      
      const newNotif: Notification = {
        id: data.id ?? `notif-${Date.now()}`,
        content: data.content?.message || data.content?.title || "New notification",
        action: "Mark as read", // Default action
        time: formatTime(now),
        date: formatDateLabel(now),
        isRead: false,
      };
      
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("notification");
      disconnectSocket();
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, unreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
