"use client";

import { Icons } from "@/components/Icons";
import { isValidUrl } from "@/utils/helpers";
import ChatMessage from "@/components/ChatMessage";
import { useState, useEffect, useRef } from "react";
import AnimatedInput from "@/components/AnimatedInput";
import AnimatedButton from "@/components/AnimatedButton";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function Home() {
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "bot"; text: string; timestamp: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Auto-scroll reference
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default Questions (Chips)
  const suggestedQuestions = [
    "Provide a brief summary of this website.",
    "What are the main services or products offered?",
    "Who is the target audience for this site?",
    "Are there any contact details available?",
  ];

  // When chat history or loading state changes, scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl.trim() === "") setUrlError("");
    else if (!isValidUrl(newUrl.trim()))
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
    else setUrlError("");
  };

  // Function now accepts a string parameter (for chips click)
  const handleAskQuestion = async (selectedQuestion?: string) => {
    const queryToAsk = selectedQuestion || question;

    setUrlError("");
    setGeneralError("");

    if (!url.trim()) return setUrlError("Please enter a URL");
    if (!isValidUrl(url.trim())) return setUrlError("Please enter a valid URL");
    if (!queryToAsk.trim()) return setGeneralError("Please ask a question");

    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: queryToAsk, timestamp: Date.now() },
    ]);
    setIsLoading(true);
    setQuestion("");

    try {
      const response = await fetch(
        "https://scrape-smart-api.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, question: queryToAsk }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setChatHistory((prev) => [
          ...prev,
          { role: "bot", text: data.bot_reply, timestamp: Date.now() },
        ]);
      } else {
        const errorMsg = data.detail || "Something went wrong";
        setGeneralError(errorMsg);
        setChatHistory((prev) => [
          ...prev,
          { role: "bot", text: `Error: ${errorMsg}`, timestamp: Date.now() },
        ]);
      }
    } catch (error) {
      const fetchError = "Server connection failed. Please try again.";
      setGeneralError(fetchError);
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: fetchError, timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans transition-colors duration-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 animate-fade-in">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 transition-colors duration-300 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            ScrapeSmart AI
          </div>
          <span className="text-sm font-medium text-slate-400">v1.0</span>
        </div>

        <AnimatedButton
          onClick={() => {
            setIsDarkMode(!isDarkMode);
          }}
          variant="ghost"
          size="sm"
          className="p-2"
          title="Toggle dark mode"
        >
          <span className="transition-transform duration-300 hover:rotate-180">
            {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
          </span>
        </AnimatedButton>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 pb-32 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Welcome / URL Config Screen */}
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-10">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
              <Icons.Link />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
              Connect a Website
            </h2>
            <p className="max-w-md text-slate-500 dark:text-slate-400">
              Enter any URL below to start analyzing its content. ScrapeSmart AI
              will read the page and answer your questions.
            </p>

            <AnimatedInput
              type="url"
              label="Website URL"
              placeholder="Paste URL here (e.g., https://example.com)"
              value={url}
              onChange={(value) => {
                const newUrl = value;
                setUrl(newUrl);

                if (newUrl.trim() === "") setUrlError("");
                else if (!isValidUrl(newUrl.trim()))
                  setUrlError(
                    "Please enter a valid URL (e.g., https://example.com)",
                  );
                else setUrlError("");
              }}
              error={urlError}
              className="max-w-md"
            />

            {/* Suggested Questions Section */}
            {url && !urlError && (
              <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
                {suggestedQuestions.map((q, idx) => (
                  <AnimatedButton
                    key={idx}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAskQuestion(q)}
                    className="animate-slide-up"
                    style={{
                      animation: `slideUp 0.4s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    {q}
                  </AnimatedButton>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        {chatHistory?.map((chat, index) => (
          <ChatMessage
            key={index}
            message={chat}
            index={index}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full pt-6 pb-6 px-4 transition-colors duration-300 bg-linear-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900">
        <div className="max-w-3xl mx-auto flex gap-2 items-center border shadow-sm rounded-full p-2 pl-4 pr-2 transition-colors bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <input
            type="text"
            className="flex-1 bg-transparent py-2 px-2 outline-none text-[15px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder={
              urlError
                ? "Please fix the URL error first"
                : url
                  ? "Ask ScrapeSmart..."
                  : "Please set a URL first..."
            }
            value={question}
            disabled={!url || !!urlError}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (generalError) setGeneralError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
          />

          <button
            className="p-2.5 rounded-full transition cursor-not-allowed text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700"
            title="Voice input coming soon"
          >
            <Icons.Mic />
          </button>

          <button
            onClick={() => handleAskQuestion()}
            disabled={isLoading || !url || !!urlError || !question.trim()}
            className="p-2.5 rounded-full transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white disabled:hover:bg-blue-600"
          >
            <Icons.Send />
          </button>
        </div>

        {/* Error Messages */}
        {generalError && (
          <div className="max-w-3xl mx-auto mt-3">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm">
              {generalError}
            </div>
          </div>
        )}
        <div className="text-center mt-3 text-xs text-slate-400 dark:text-slate-500">
          ScrapeSmart AI can make mistakes. Consider verifying important
          information.
        </div>
      </div>
    </div>
  );
}
