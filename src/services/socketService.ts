import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../config";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const socketUrl = API_BASE_URL.replace("/api", "");

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
    });

    // Lắng nghe notification
    this.socket.on("notification", (notification) => {
      this.emitToListeners("notification", notification);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emitToListeners(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_room", room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave_room", room);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for emitting events)
  get socketInstance(): Socket | null {
    return this.socket;
  }

  // Emit event to server
  emit(event: string, data: unknown) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
