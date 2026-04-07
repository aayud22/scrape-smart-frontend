"use client";

import { Icons } from "./Icons";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: {
    role: "user" | "bot";
    text: string;
    timestamp: number;
  };
  index: number;
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  return (
    <div
      className={`w-full animate-slide-up`}
      style={{ animation: `slideUp 0.3s ease-out ${index * 0.05}s both` }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5 animate-scale-in">
          {isUser ? (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shadow-sm ring-1 ring-slate-200/60 flex items-center justify-center">
              <span className="text-slate-700 text-sm font-semibold">You</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/10 flex items-center justify-center">
              <div className="w-5 h-5 text-white">
                <Icons.Robot />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm font-semibold text-slate-900">
              {isUser ? "You" : "ScrapeSmartAI"}
            </div>
            <div className="text-sm text-slate-400">{timeLabel}</div>
          </div>

          {/* Bubble */}
          <div
            className={`w-fit max-w-170 rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm ring-1 animate-fade-in ${
              isUser
                ? "bg-slate-100 text-slate-800 ring-slate-200/60"
                : "bg-white text-slate-700 ring-slate-200/70"
            }`}
          >
            {message.role === "bot" ? (
              <div className="prose prose-sm max-w-none prose-slate prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap wrap-break-word">{message.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
