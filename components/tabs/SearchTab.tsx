import React, { useState } from "react";
import LoadingState from "../LoadingState";
import ErrorState from "../ErrorState";

export default function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      // Using standard fetch for GET request
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setResults(data.results);
      } else {
        throw new Error(data.detail || "Search failed");
      }
    } catch (err: any) {
      setError("Failed to fetch search results. Backend might be down.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Search Input Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          🔍 Live Web Search
        </h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web (e.g., latest AI news...)"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-slate-50"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <ErrorState message={error} />}
      </div>

      {/* Search Results Area */}
      {isSearching ? (
        <LoadingState message="Scouring the internet..." />
      ) : results && results.length > 0 ? (
        <div className="flex flex-col gap-4">
          {results.map((result, index) => (
            <div key={index} className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <a 
                href={result.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:underline line-clamp-1"
              >
                {result.title}
              </a>
              <p className="text-xs text-green-700 mb-2 truncate">{result.href}</p>
              <p className="text-sm text-slate-600 line-clamp-2">{result.body}</p>
            </div>
          ))}
        </div>
      ) : results && results.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-xl border border-slate-200">
          No results found for "{query}".
        </div>
      ) : null}
    </div>
  );
}