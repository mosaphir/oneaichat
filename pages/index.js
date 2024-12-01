import { useState, useEffect, useRef } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatBoxRef = useRef(null);

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
    <div className={darkMode ? 'dark' : ''}>
      <div className="chat-container">
        <header className="chat-header">
          <h1>AI Chatbot</h1>
          <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
            >
              <div className="avatar">
                {msg.sender === 'user' ? '🧑' : '🤖'}
              </div>
              <div className="text-content">
                <p>{msg.text}</p>
                <span className="timestamp">{msg.time}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot typing">
              <div className="avatar">🤖</div>
              <div className="text-content">
                <p>Typing...</p>
              </div>
            </div>
          )}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--background-color);
          color: var(--text-color);
        }
        .chat-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--header-background);
        }
        .toggle-mode {
          background: var(--button-background);
          color: var(--button-text);
          border: none;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
        }
        .chat-box {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: var(--chat-background);
        }
        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .message.user {
          justify-content: flex-end;
        }
        .message.bot {
          justify-content: flex-start;
        }
        .avatar {
          font-size: 24px;
        }
        .text-content {
          max-width: 70%;
          padding: 10px;
          background: var(--message-background);
          border-radius: 10px;
        }
        .timestamp {
          font-size: 10px;
          margin-top: 5px;
          color: var(--timestamp-color);
          text-align: right;
        }
        .input-area {
          display: flex;
          padding: 10px;
          background: var(--input-background);
        }
        .input-area input {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--input-border);
          border-radius: 5px;
        }
        .input-area button {
          margin-left: 10px;
          padding: 10px 20px;
          background: var(--button-background);
          color: var(--button-text);
          border: none;
          border-radius: 5px;
        }
        .dark {
          --background-color: #121212;
          --text-color: #ffffff;
          --header-background: #1e1e1e;
          --chat-background: #1e1e1e;
          --message-background: #333333;
          --timestamp-color: #aaaaaa;
          --input-background: #1e1e1e;
          --input-border: #333333;
          --button-background: #555555;
          --button-text: #ffffff;
        }
        :not(.dark) {
          --background-color: #f9f9f9;
          --text-color: #000000;
          --header-background: #ffffff;
          --chat-background: #ffffff;
          --message-background: #f1f1f1;
          --timestamp-color: #666666;
          --input-background: #ffffff;
          --input-border: #cccccc;
          --button-background: #007bff;
          --button-text: #ffffff;
        }
      `}</style>
    </div>
  );
}
