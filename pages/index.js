import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, AppBar, Toolbar, IconButton, Paper } from '@mui/material';
import { Send, Brightness4, Brightness7 } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatBoxRef = useRef(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessages = [...messages, { sender: 'user', text: input, time: timestamp }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/chat?prompt=${encodeURIComponent(input)}`);
      const data = await response.json();

      if (data.error || !Array.isArray(data)) throw new Error(data.error || 'Invalid API response');

      const botResponse = data[0]?.response?.response || 'No response received.';
      setMessages([
        ...newMessages,
        { sender: 'bot', text: botResponse, time: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: 'bot', text: 'Error: Unable to fetch response.', time: timestamp },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Scroll to the latest message
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        {/* Header */}
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              AI Chatbot
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Chat Area */}
        <Box
          ref={chatBoxRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((msg, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                p: 2,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.200',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                maxWidth: '70%',
                borderRadius: '10px',
              }}
            >
              <Typography>{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'right', mt: 1 }}
              >
                {msg.time}
              </Typography>
            </Paper>
          ))}
          {loading && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Bot is typing...
            </Typography>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            display: 'flex',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyPress}
            placeholder="Type your message..."
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={loading}
            startIcon={<Send />}
          >
            {loading ? '...' : 'Send'}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
