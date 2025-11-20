// frontend/src/components/AIAgentChat.jsx - MINIMAL WORKING VERSION
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AIAgentChat.css";

export default function AIAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      console.log("🔵 Sending to backend:", userMsg);
      
      // Call Python backend directly with axios
      const response = await axios.post(
        "http://localhost:8000/api/concierge/chat",
        {
          message: userMsg,
          context: {}
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("🟢 Backend response:", response.data);

      // Add AI response
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response || "I received your message!"
      }]);

    } catch (error) {
      console.error("🔴 Error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Show error to user
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${error.response?.data?.detail || error.message || "Connection failed. Is the Python server running on port 8000?"}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="ai-agent-button"
          onClick={() => setIsOpen(true)}
          title="AI Travel Assistant"
        >
          🤖
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="ai-agent-panel">
          {/* Header */}
          <div className="ai-agent-header">
            <div>
              <h5 className="mb-0">🤖 AI Travel Assistant</h5>
              <small className="text-white-50">Testing Mode</small>
            </div>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="ai-agent-messages">
            {messages.length === 0 && (
              <div className="text-center text-muted p-4">
                <h6>👋 AI Chat Test</h6>
                <p className="small">Type a message to test the connection</p>
                <div className="alert alert-info small">
                  <strong>Debug Mode:</strong>
                  <br />• Python server: localhost:8000
                  <br />• Check console (F12) for logs
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.role === "user" ? "message-user" : "message-assistant"
                }`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message message-assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-agent-input">
            <textarea
              className="form-control"
              placeholder="Type a test message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="2"
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}