import React, { useState, useRef, useEffect } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Send } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const HRChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const endpoint = threadId
        ? `http://localhost:3000/chat/${threadId}`
        : 'http://localhost:3000/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      setThreadId(data.threadId);

      const newAssistantMessage = {
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl h-[600px] flex flex-col bg-white overflow-hidden">
  <CardHeader>
    <CardTitle>HR Assistant</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 flex flex-col overflow-hidden">
    {/* Message container */}
    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.role === 'assistant' ? (
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 text-gray-900">
            Thinking...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
    {/* Input form */}
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        aria-busy={isLoading}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  </CardContent>
</Card>
  );
};

export default HRChatbot;
