"use client";

import { useState, useRef, useEffect } from "react";
import CameraView from "@/app/components/CameraView";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "👋 Hello! I'm your WarungVision AI Assistant. How can I help you with your inventory today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "";

      if (
        userMessage.toLowerCase().includes("scan") ||
        userMessage.toLowerCase().includes("photo")
      ) {
        response =
          "📸 To scan items, click the camera button on the main area. Take a photo of your shelf, then click 'Analyze' to detect products and their quantities.";
      } else if (
        userMessage.toLowerCase().includes("inventory") ||
        userMessage.toLowerCase().includes("stock")
      ) {
        response =
          "📦 You can view your complete inventory in the Inventory section. It shows all products, their current stock levels, and values.";
      } else if (
        userMessage.toLowerCase().includes("recommend") ||
        userMessage.toLowerCase().includes("restock")
      ) {
        response =
          "💡 Check the Restock Recommendations page for AI-powered suggestions based on your consumption trends and sales patterns.";
      } else if (
        userMessage.toLowerCase().includes("sales") ||
        userMessage.toLowerCase().includes("analytics")
      ) {
        response =
          "💰 View detailed sales analytics on the Sales page, including daily totals, top products, and spending estimates.";
      } else if (
        userMessage.toLowerCase().includes("alert") ||
        userMessage.toLowerCase().includes("low")
      ) {
        response =
          "🚨 The Low Stock page shows items below your threshold. You can customize the threshold to get alerts when you need them.";
      } else {
        response =
          "✨ I'm here to help! Try asking me about scanning, inventory, restocking, sales, or alerts. What would you like to know?";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setChatLoading(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-black">
      {/* Camera Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <CameraView />
      </div>

      {/* Chat Sidebar */}
      <div
        className={`${
          showChat ? "w-full sm:w-80" : "w-0"
        } bg-gray-900 border-l border-gray-700 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {showChat && (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">🤖 AI Assistant</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="bg-gray-800 border-t border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Chat Toggle & Navigation */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Dashboard Button */}
        <Link
          href="/dashboard"
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-2xl shadow-lg transition transform hover:scale-110"
          title="Go to Dashboard"
        >
          📊
        </Link>

        {/* Chat Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition transform hover:scale-110 ${
            showChat
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title="Toggle Chat"
        >
          💬
        </button>
      </div>
    </main>
  );
}
