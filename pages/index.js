import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, AppBar, Toolbar, IconButton, Paper, CircularProgress } from '@mui/material';
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
      const response = await fetch(`https://chat.onedevai.workers.dev/?prompt=${encodeURIComponent(input)}`);
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      const data = await response.json();

      // Extract and join all response texts
      const botResponses = data.map((item) => item.response?.response).join(' ');

      setMessages([
        ...newMessages,
        { sender: 'bot', text: botResponses, time: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages([
        ...newMessages,
        { sender: 'bot', text: `Error: Unable to fetch response.`, time: timestamp },
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
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
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
            bgcolor: 'background.paper',
          }}
        >
          {messages.map((msg, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                p: 2,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                maxWidth: '70%',
                borderRadius: msg.sender === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0',
              }}
            >
              <Typography>{msg.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                {msg.time}
              </Typography>
            </Paper>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            display: 'flex',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
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
            Send
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
