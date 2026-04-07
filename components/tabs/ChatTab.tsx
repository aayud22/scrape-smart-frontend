import React, { RefObject } from "react";
import AnimatedButton from "@/components/AnimatedButton";
import ChatMessage from "@/components/ChatMessage";
import LoadingIndicator from "@/components/LoadingIndicator";

export type ChatRole = "user" | "bot";

export type ChatItem = {
  role: ChatRole;
  text: string;
  timestamp: number;
};

interface ChatTabProps {
  chatHistory: ChatItem[];
  isLoading: boolean;
  suggestedQuestions: string[];
  handleAskQuestion: (q: string) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatTab({
  chatHistory,
  isLoading,
  suggestedQuestions,
  handleAskQuestion,
  messagesEndRef,
}: ChatTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {chatHistory.length === 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {suggestedQuestions.map((q, idx) => (
            <AnimatedButton
              key={q}
              variant="secondary"
              size="sm"
              onClick={() => handleAskQuestion(q)}
              className="animate-slide-up"
              style={{ animation: `slideUp 0.4s ease-out ${idx * 0.1}s both` }}
            >
              {q}
            </AnimatedButton>
          ))}
        </div>
      )}
      {chatHistory.map((chat, index) => (
        <ChatMessage key={chat.timestamp} message={chat} index={index} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
