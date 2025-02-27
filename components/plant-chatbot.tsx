import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import styles from "./plant-chatbot.module.css";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

interface PlantChatbotProps {
  plantContext?: string;
}

export default function PlantChatbot({ plantContext }: PlantChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Hi! I'm PlantPal. Ask me any questions about plants or gardening!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          context: plantContext
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }
      
      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: data.reply
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Sorry, I couldn't process your question. Please try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <Bot className={styles.botIcon} />
        <h2>Plant Assistant</h2>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`${styles.message} ${
              message.type === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            {message.text}
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Ask a question about plants..."
          className={styles.chatInput}
          disabled={isTyping}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!input.trim() || isTyping}
          className={styles.sendButton}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}