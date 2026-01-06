import { useState, useEffect, useRef } from "react";
import { Box, Paper, TextField, IconButton, Typography, Avatar } from "@mui/material";
import { Send, Close, Chat } from "@mui/icons-material";
import { useGlobal } from "../../hooks/useGlobal";
import socketService from "../../services/socketService";

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export default function Chatbox() {
  const { isLogin, user } = useGlobal();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && isLogin) {
      socketService.joinRoom("support");

      const handleMessage = (data: unknown) => {
        const message = data as Message;
        setMessages((prev) => [...prev, message]);
      };

      socketService.on("chat_message", handleMessage);

      return () => {
        socketService.off("chat_message", handleMessage);
        socketService.leaveRoom("support");
      };
    }
  }, [open, isLogin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !isLogin) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: String(user?.id || ""),
      userName: user?.fullName || user?.email || "User",
      message: inputMessage,
      timestamp: new Date(),
    };

    // Gửi message qua socket (backend sẽ xử lý)
    socketService.emit("chat_message", message);

    setMessages((prev) => [...prev, message]);
    setInputMessage("");
  };

  if (!isLogin) return null;

  return (
    <>
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            zIndex: 1000,
          }}
        >
          <Chat />
        </IconButton>
      )}

      {open && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 350,
            height: 500,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Hỗ trợ khách hàng</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                  flexDirection: msg.userId === String(user?.id || "") ? "row-reverse" : "row",
                }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{msg.userName[0]}</Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {msg.userName}
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: msg.userId === String(user?.id || "") ? "primary.light" : "grey.200" }}>
                    <Typography variant="body2">{msg.message}</Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
