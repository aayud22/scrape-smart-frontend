"use client";

import { useState, useEffect } from "react";

interface AnimatedInputProps {
  value: string;
  onChange: (value: string) => void;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  type?: "text" | "url" | "email";
  label?: string;
}

export default function AnimatedInput({
  value,
  onChange,
  onInput,
  placeholder,
  disabled = false,
  error,
  className = "",
  type = "text",
  label
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error) {
      setHasError(true);
      const timer = setTimeout(() => setHasError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const baseClasses = "relative transition-all duration-300 ease-out";
  const inputClasses = `
    w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl
    outline-none transition-all duration-300 ease-out
    text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
    focus:bg-white dark:focus:bg-slate-700
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 animate-shake' : 'border-slate-200 dark:border-slate-700'}
    ${isFocused ? 'shadow-lg shadow-blue-500/20 -translate-y-1' : 'shadow-sm'}
  `;

  return (
    <div className={`${baseClasses} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">
          {label}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onInput?.(e);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={inputClasses}
      />
      
      {/* Error message with animation */}
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500 dark:text-red-400 animate-slide-up">
          {error}
        </div>
      )}
    </div>
  );
}
