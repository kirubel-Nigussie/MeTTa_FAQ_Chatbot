"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CHAT_API_URL } from "./constants";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "", isLoading: true }]);

      const response = await axios.post(
        CHAT_API_URL,
        { message: trimmedInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prevMessages) => [
        ...prevMessages.filter(msg => !msg.isLoading),
        {
          sender: "bot",
          text: response.data.response,
          sources: response.data.sources || null
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.filter(msg => !msg.isLoading),
        { sender: "bot", text: "I encountered an error connecting to the MeTTa knowledge base. Please ensure the backend is running." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatBotResponse = (text) => {
    if (!text) return null;
    const paragraphs = text.split("\n").filter((line) => line.trim() !== "");
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("• ")) {
        const items = paragraph.split("\n").filter((item) => item.trim() !== "");
        return (
          <ul key={index} className="list-disc list-inside space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-200">
                {item.replace(/^- |^• /, "")}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-gray-200 mb-2">
          {paragraph}
        </p>
      );
    });
  };

  const renderSources = (sources, messageIndex) => {
    if (!sources || !sources.concept) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="mb-4 flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
            Concept: {sources.concept}
          </span>
        </div>

        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => {
              const container = document.getElementById(`source-container-${messageIndex}`);
              const icon = document.getElementById(`toggle-icon-${messageIndex}`);
              if (container && icon) {
                container.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }
            }}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-gray-300 hover:bg-gray-800 transition duration-150 focus:outline-none"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View MeTTa Concept Details
            </span>
            <svg id={`toggle-icon-${messageIndex}`} className="w-4 h-4 transform transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id={`source-container-${messageIndex}`} className="hidden p-4 bg-gray-800 border-t border-gray-600">
            <div className="space-y-4 text-sm">
              {sources.description && (
                <div className="p-3 bg-gray-900 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-300 mb-1">Description</h4>
                  <p className="text-gray-400 italic">{sources.description}</p>
                </div>
              )}
              {sources.syntax && sources.syntax !== "N/A" && (
                <div className="p-3 bg-gray-900 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-bold text-gray-300 mb-1">Syntax</h4>
                  <code className="text-green-300 font-mono block bg-black p-2 rounded">{sources.syntax}</code>
                </div>
              )}
              {sources.related && sources.related.length > 0 && (
                <div className="p-3 bg-gray-900 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-300 mb-1">Related Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {sources.related.map((rel, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-900 text-purple-200 rounded text-xs border border-purple-700">
                        {rel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sources.inferred_relations && sources.inferred_relations.length > 0 && (
                <div className="p-3 bg-gray-900 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-bold text-gray-300 mb-1">Inferred Relations</h4>
                  <ul className="list-disc list-inside text-gray-400">
                    {sources.inferred_relations.map((rel, idx) => (
                      <li key={idx}>{rel}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131314] flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#131314] overflow-hidden">
      <div
        className={`bg-[#1f1f1f] text-gray-300 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-16"
          }`}
      >
        <div className="p-4 flex justify-center items-center border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className={`flex-grow p-4 overflow-y-auto ${!isSidebarOpen && "hidden"}`}>
          <h2 className="text-lg font-semibold mb-4">Chat History</h2>
          <ul>
            <li className="py-1 px-2 rounded hover:bg-gray-700 cursor-pointer text-sm truncate">
              Chat 1
            </li>
            <li className="py-1 px-2 rounded hover:bg-gray-700 cursor-pointer text-sm truncate">
              Previous discussion
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full text-left px-2 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto px-6 md:px-20 lg:px-32 py-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <h1 className="text-5xl font-medium text-gray-400 bg-gradient-to-r from-cyan-400 via-violet-500 to-lime-400 bg-clip-text text-transparent">
                  Welcome to MeTTa chatbot!
                </h1>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="flex flex-col">
                  {msg.sender === "user" && (
                    <div className="flex justify-end mb-4">
                      <div
                        className="px-5 py-3 rounded-xl shadow-lg text-white"
                        style={{
                          background: "linear-gradient(145deg, #2e2e2e, #1f1f1f)",
                          border: "1px solid #3a3a3a",
                          maxWidth: "90%",
                        }}
                      >
                        <span className="text-base">{msg.text}</span>
                      </div>
                    </div>
                  )}

                  {msg.sender === "bot" && (
                    <div className="flex justify-start mb-6">
                      <div className="px-6 py-5 rounded-xl w-full max-w-4xl mx-auto bg-[#1a1a1a] dark:bg-[#121212] text-gray-200 leading-relaxed shadow-md border border-gray-700">
                        {msg.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xl mb-3">✨</div>
                            <div className="whitespace-pre-wrap break-words text-[17px] font-normal">
                              {formatBotResponse(msg.text)}
                            </div>
                            {renderSources(msg.sources, index)}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="pb-4 pt-2 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="flex items-center bg-[#1f1f1f] p-2 rounded-full shadow-md border border-gray-700 w-full md:w-3/4 lg:w-1/2">
                <button className="p-2 text-gray-400 hover:text-gray-200 focus:outline-none flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about MeTTa Standard Library..."
                  className="flex-grow px-4 py-3 mx-2 bg-transparent text-gray-300 focus:outline-none min-h-[50px]"
                  disabled={isLoading}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full text-gray-400 flex-shrink-0 ${input.trim() && !isLoading ? "hover:bg-gray-600 hover:text-gray-200" : "opacity-50 cursor-not-allowed"
                    } focus:outline-none`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.11V3.89a1 1 0 00.894-.337l2-2a1 1 0 00-1.414-1.414l-1.47 1.47z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}