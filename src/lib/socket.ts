import { io, Socket } from "socket.io-client";

// Get API base URL (remove /api/v1 if present, we'll add /members namespace)
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
  try {
    // Remove /api/v1 and protocol, then reconstruct
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    // Fallback if URL parsing fails
    const baseUrl = apiUrl.replace(/\/api\/v1$/, "").replace(/\/$/, "");
    return baseUrl || "http://localhost:3000";
  }
};

// Create socket connection
let socket: Socket | null = null;

export const connectSocket = (memberId?: string): Socket => {
  if (socket?.connected) {
    // If memberId is provided and socket is already connected, subscribe to member events
    if (memberId) {
      socket.emit("subscribe:member-events", { memberId });
    }
    return socket;
  }

  const socketUrl = getSocketUrl();
  socket = io(`${socketUrl}/members`, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
    // Subscribe to admin member events
    socket?.emit("subscribe:members");
    // If memberId is provided, also subscribe to member-specific events
    if (memberId) {
      socket?.emit("subscribe:member-events", { memberId });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.emit("unsubscribe:members");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

// Event types
export interface MemberRegisteredEvent {
  event: "member:registered";
  data: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    membershipPackage?: any;
    createdAt: string;
  };
  timestamp: string;
}

export interface MemberApprovalStatusChangedEvent {
  event: "member:approval-status-changed";
  data: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
    membershipPackage?: any;
    changedAt: string;
  };
  timestamp: string;
}

export interface MemberApprovedEvent {
  event: "member:approved";
  data: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
    membershipPackage?: any;
    approvedAt: string;
  };
  timestamp: string;
}

export interface MemberRejectedEvent {
  event: "member:rejected";
  data: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    rejectedAt: string;
  };
  timestamp: string;
}

