import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';


const Chat = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("Disconnected");
  const [userId, setUserId] = useState<string>("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (ws) ws.close();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ws]);

  const connect = () => {
    if (!username) {
      alert("Please enter a username");
      return;
    }
    
    const socket = new WebSocket("ws://localhost:3500");
    setWs(socket);

    // Generate a unique user ID
    const newUserId = Date.now().toString();
    setUserId(newUserId);

    socket.onopen = () => {
      setStatus("Connected");
      // Send authentication
      const authPayload = {
        type: "auth",
        user: { 
          userId: newUserId, 
          userName: username
        },
        roomId
      };
      
      console.log("Sending auth:", authPayload);
      socket.send(JSON.stringify(authPayload));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
      
      switch (data.type) {
        case "message":
          if (data.message) {
            // Try to extract username from multiple possible locations
            let senderName = "unknown";
            
            if (data.message.userName) {
              senderName = data.message.userName;
            } else if (data.user && data.user.userName) {
              senderName = data.user.userName;
            }
            
            setMessages((prev) => [...prev, `${senderName}: ${data.message.content}`]);
          }
          break;
        case "join":
          const joinUsername = data.user.userName || "Someone";
          setMessages((prev) => [...prev, `${joinUsername} joined the chat`]);
          break;
        case "leave":
          const leaveUsername = data.user.userName || "Someone";
          setMessages((prev) => [...prev, `${leaveUsername} left the chat`]);
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(leaveUsername);
            return newSet;
          });
          break;
        case "typing":
          // Only process typing events from other users
          if (data.user && data.user.userId !== userId) {  // Keep this check
            const typingUsername = data.user.userName;
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              if (data.isTyping) {
                newSet.add(typingUsername);
              } else {
                newSet.delete(typingUsername);
              }
              return newSet;
            });
          }
          break;
      }
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      setWs(null);
      setTypingUsers(new Set());
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Error connecting");
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
    }
    setStatus("Disconnected");
    setWs(null);
    setTypingUsers(new Set());
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && message && ws.readyState === WebSocket.OPEN) {
      
      const messageObj = {
        content: message,
        timestamp: Date.now(),
        userId: userId,
        userName: username,
        roomId: roomId
      };

      // Log what we're sending
      console.log("Sending message:", messageObj);

      // Send message event
      ws.send(
        JSON.stringify({
          type: "message",
          user: { 
            userId, 
            userName: username
          },
          message: messageObj,
          roomId
        })
      );
      
      setMessage("");
      
      // Clear typing indicator after sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Send typing stopped event
      ws.send(
        JSON.stringify({
          type: "typing",
          user: { 
            userId, 
            userName: username
          },
          isTyping: false,
          roomId
        })
      );
    }
  };

  const handleTyping = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Clear previous typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing started event
      ws.send(
        JSON.stringify({
          type: "typing",
          user: { 
            userId, 
            userName: username
          },
          isTyping: true,
          roomId
        })
      );
      
      // Set timeout to clear typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "typing",
              user: { 
                userId, 
                userName: username
              },
              isTyping: false,
              roomId
            })
          );
        }
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const refreshChat = () => {
    setMessages([]);
  };

  const viewHistory = () => {
    navigate('/history', '_blank');
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Chat Application
          </Typography>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            disabled={status === "Connected"}
          />
          <TextField
            label="Room ID"
            fullWidth
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            margin="normal"
            disabled={status === "Connected"}
          />
          <Button 
            onClick={connect} 
            disabled={status === "Connected"} 
            variant="contained" 
            color="primary"
            sx={{ mt: 1, mb: 2 }}
          >
            Connect
          </Button>
          <Button 
            onClick={disconnect} 
            disabled={status !== "Connected"} 
            variant="contained" 
            color="secondary"
            sx={{ mt: 1, mb: 2, ml: 1 }}
          >
            Disconnect
          </Button>
          <Typography variant="body2" color="textSecondary">
            Status: {status}
          </Typography>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <Button 
              onClick={refreshChat}
              disabled={status !== "Connected"}
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
            >
              Clear Chat
            </Button>
            <Button 
              onClick={viewHistory}
              variant="outlined"
              color="primary"
              endIcon={<HistoryIcon />}
            >
              View History
            </Button>
          </div>
          <div 
            style={{ 
              borderTop: "1px solid #ccc", 
              paddingTop: "10px", 
              marginTop: "10px", 
              height: "200px", 
              overflowY: "scroll" 
            }}
          >
            {messages.map((msg, index) => (
              <Typography 
                key={index} 
                variant="body1" 
                style={{ 
                  padding: "5px", 
                  borderBottom: "1px solid #eee" 
                }}
              >
                {msg}
              </Typography>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {typingUsers.size > 0 && (
            <Typography 
              variant="body2" 
              style={{ 
                color: "red", 
                fontStyle: "italic", 
                height: "20px", 
                marginTop: "8px" 
              }}
            >
              {(() => {
                const otherTypingUsers = Array.from(typingUsers).filter(user => user !== username);
                if (otherTypingUsers.length === 0) return null;
                
                return (
                  <>
                    {otherTypingUsers.join(", ")}
                    {` ${otherTypingUsers.length === 1 ? "is" : "are"} typing...`}
                  </>
                );
              })()}
            </Typography>
          )}
          <form 
            onSubmit={sendMessage} 
            style={{ 
              display: "flex", 
              marginTop: "10px", 
              gap: "8px" 
            }}
          >
            <TextField
              label="Type a message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={() => handleTyping()}
              disabled={status !== "Connected"}
            />
            <Button 
              type="submit" 
              disabled={!message || status !== "Connected"} 
              variant="contained" 
              color="primary"
            >
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
