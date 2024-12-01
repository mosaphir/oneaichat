import { useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessages = [...messages, { sender: 'user', text: input, time: timestamp }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`https://chat.onedevai.workers.dev/?prompt=${encodeURIComponent(input)}`);
      const data = await response.text();

      setMessages([
        ...newMessages,
        { sender: 'bot', text: data, time: new Date().toLocaleTimeString() },
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

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="container">
        <header className="header">
          <h1>AI Chatbot</h1>
          <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <div className="chat-box">
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
            <div className="message bot">
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
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--background-color);
          color: var(--text-color);
          font-family: Arial, sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: var(--header-background);
        }
        .toggle-mode {
          background: var(--button-background);
          color: var(--button-text);
          border: none;
          padding: 10px;
          cursor: pointer;
        }
        .chat-box {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--chat-background);
        }
        .message {
          display: flex;
          align-items: center;
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
          background: var(--message-background);
          color: var(--message-text);
          padding: 10px;
          border-radius: 10px;
          max-width: 60%;
        }
        .timestamp {
          font-size: 10px;
          text-align: right;
          margin-top: 5px;
          color: var(--timestamp-color);
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
          font-size: 16px;
        }
        .input-area button {
          margin-left: 10px;
          padding: 10px 20px;
          background: var(--button-background);
          color: var(--button-text);
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .dark {
          --background-color: #121212;
          --text-color: #ffffff;
          --header-background: #1e1e1e;
          --chat-background: #1e1e1e;
          --message-background: #333333;
          --message-text: #ffffff;
          --timestamp-color: #aaaaaa;
          --input-background: #1e1e1e;
          --input-border: #333333;
          --button-background: #333333;
          --button-text: #ffffff;
        }
        :not(.dark) {
          --background-color: #f9f9f9;
          --text-color: #000000;
          --header-background: #ffffff;
          --chat-background: #ffffff;
          --message-background: #f1f1f1;
          --message-text: #000000;
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
