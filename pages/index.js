import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, AppBar, Toolbar, IconButton, Paper, CircularProgress, Grid, useMediaQuery } from '@mui/material';
import { Send, Brightness4, Brightness7 } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatBoxRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

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
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      const data = await response.json();

      const botResponse = data?.response || 'No response from the bot.';

      setMessages([
        ...newMessages,
        { sender: 'bot', text: botResponse, time: new Date().toLocaleTimeString() },
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
            paddingBottom: isMobile ? '10px' : '20px',
          }}
        >
          {messages.length === 0 && !loading && (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Start typing to begin the conversation!
            </Typography>
          )}

          {messages.map((msg, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                p: 2,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                maxWidth: '80%',
                borderRadius: '12px',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Typography>{msg.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                {msg.time}
              </Typography>
            </Paper>
          ))}
          
          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={30} color="primary" />
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
            gap: 2,
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyPress}
            placeholder="Type your message..."
            sx={{
              borderRadius: '20px',
              padding: '10px 15px',
              flexGrow: 1,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={loading}
            startIcon={<Send />}
            sx={{
              borderRadius: '20px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
