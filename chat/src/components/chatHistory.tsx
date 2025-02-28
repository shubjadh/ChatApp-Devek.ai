import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Card, CardContent, List, 
         ListItem, ListItemText, Divider, CircularProgress, Box, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChatMessage } from '../types/types';

const ChatHistory: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to fetch history for a specific room
  const fetchRoomHistory = async () => {
    if (!roomId.trim()) {
      setError('Please enter a valid room ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3500/api/chat/${roomId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get username from message
  const getUserName = (msg: ChatMessage): string => {
    return msg.username || "Unknown User";
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Navigate back to chat
  const goBackToChat = () => {
    navigate('/');
  };

  // Fetch messages on initial load
  useEffect(() => {
    fetchRoomHistory();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={goBackToChat}
              color="primary"
              sx={{ mr: 2 }}
            >
              Back to Chat
            </Button>
            <Typography variant="h5">Chat History</Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Enter a room ID to view its chat history
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                label="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                variant="outlined"
                fullWidth
              />
              <Button 
                onClick={fetchRoomHistory} 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'View History'}
              </Button>
            </Box>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>

          {messages.length > 0 ? (
            <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
              <List>
                {messages.map((msg, index) => (
                  <React.Fragment key={msg.id || index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography 
                            component="span" 
                            variant="body1" 
                            color="text.primary"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {getUserName(msg)}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {msg.content}
                            </Typography>
                            <Typography
                              component="div"
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {formatTimestamp(msg.timestamp)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ) : (
            <Box 
              sx={{ 
                py: 4, 
                display: 'flex', 
                justifyContent: 'center',
                border: '1px dashed #ccc',
                borderRadius: 1
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {loading ? 'Loading messages...' : 'No messages to display. Enter a room ID and click "View History".'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistory;