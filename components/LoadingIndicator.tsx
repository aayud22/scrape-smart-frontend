"use client";

import { Icons } from "./Icons";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export default function LoadingIndicator({ 
  message = "thinking", 
  className = "" 
}: LoadingIndicatorProps) {
  return (
    <div className={`flex w-full justify-start items-center gap-3 ${className}`}>
      {/* Avatar Container */}
      <div className="shrink-0 relative">
        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <div className="w-5 h-5 text-white">
            <Icons.Robot />
          </div>
        </div>
        
        {/* Pulsing Ring */}
        <div className="absolute inset-0 w-9 h-9 bg-blue-500 rounded-2xl animate-ping opacity-20" />
      </div>

      {/* Message Container */}
      <div className="flex flex-col gap-2">
        {/* Typing Dots Container */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-2xl rounded-bl-sm shadow-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>
        
        {/* Status Text */}
        <div className="text-xs text-slate-500 font-medium ml-1">
          {message}
        </div>
      </div>
    </div>
  );
}
