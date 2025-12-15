export interface ChatMessage {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        fullname: string;
        email: string;
        avatar?: string;
      };
  message: string;
  senderType: "user" | "admin";
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  isTyping: boolean;
}
