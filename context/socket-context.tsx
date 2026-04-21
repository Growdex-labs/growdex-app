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
import { useMe } from "@/context/me-context";
import { apiFetch } from "@/lib/auth";

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

// ─── Provider ────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { me } = useMe();

  // Root teardown: only null the singleton when the provider unmounts entirely
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // Socket Connection & Listener Lifecycle
  useEffect(() => {
    if (!me) {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("notification");
        socket.disconnect(); // Disconnect current session, don't null the singleton
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const s = getSocket();
    setSocket(s);

    if (!s.connected) {
      s.connect();
    }

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
      s.disconnect(); // Simply disconnect the instance, singleton cleanup is handled by root effect
    };
  }, [me, socket]);

  // Fetch Notification History on Login
  useEffect(() => {
    if (!me) return;

    const fetchNotifications = async () => {
      try {
        const res = await apiFetch("/notifications/history", { method: "GET" });
        if (!res.ok) return;

        const data = await res.json();
        const history = Array.isArray(data) ? data : data.notifications || [];

        const mapped: Notification[] = history.map((item: any) => {
          const timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
          return {
            id: item.id || `notif-${Date.now()}-${Math.random()}`,
            content: item.content?.message || item.content?.title || item.message || "Notification",
            action: "Mark as read",
            time: formatTime(timestamp),
            date: formatDateLabel(timestamp),
            isRead: item.isRead ?? false,
          };
        });

        setNotifications(mapped);
      } catch (err) {
        console.error("Failed to fetch notification history:", err);
      }
    };

    fetchNotifications();
  }, [me]);

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