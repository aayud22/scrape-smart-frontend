"use client";

import { useEffect, useRef, useState } from "react";

import AnimatedInput from "@/components/AnimatedInput";
import { Icons } from "@/components/Icons";
import { isValidUrl } from "@/utils/helpers";

import ChatTab, { ChatItem } from "@/components/tabs/ChatTab";
import SeoTab, { SeoData } from "@/components/tabs/SeoTab";
import ScrapeTab, { ScrapeData } from "@/components/tabs/ScrapeTab";
import MapTab, { MapLinksData } from "@/components/tabs/MapTab";
import PagesTab from "./tabs/PagesTab";
import SearchTab from "./tabs/SearchTab";
import ErrorState from "./ErrorState";

type TabType = "chat" | "seo" | "scrape" | "map" | "pages" | "search";

export default function ChatPageClient() {
  const [url, setUrl] = useState("");
  const [isAppActive, setIsAppActive] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);

  // Consolidating overall loading state and localized tab states for smooth UI transitions
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Maintain separate error texts for granular user feedback
  const [urlError, setUrlError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [seoScoreData, setSeoScoreData] = useState<SeoData | null>(null);
  const [mapLinksData, setMapLinksData] = useState<MapLinksData[] | null>(null);

  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(null);
  const [scrapeView, setScrapeView] = useState<"markdown" | "json">("markdown");

  const [scrapeError, setScrapeError] = useState("");

  const [protocol, setProtocol] = useState("https://"); // Default to https://
  const [domainInput, setDomainInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Provide a brief summary of this website.",
    "What are the main services or products offered?",
    "Who is the target audience for this site?",
  ];

  // Guarantee seamless UX by maintaining focus on the newest chat items
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading, activeTab]);

  const validateUrl = (newUrl: string) => {
    if (newUrl.trim() === "") {
      setUrlError("");
      return;
    }
    if (!isValidUrl(newUrl.trim())) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }
    setUrlError("");
  };

  /**
   * Universal API Fetcher
   * Eliminates boilerplate and standardizes requests and error handling across endpoints.
   */
  const fetchApi = async (endpoint: string, payload: Record<string, any>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred during the fetch operation.");
    }

    return data;
  };

  const handleStartAnalysis = async () => {
    if (!domainInput.trim()) return setUrlError("Please enter a website address");
    
    let cleanDomain = domainInput.trim();
    if (cleanDomain.startsWith("http://")) cleanDomain = cleanDomain.slice(7);
    if (cleanDomain.startsWith("https://")) cleanDomain = cleanDomain.slice(8);

    const fullUrl = `${protocol}${cleanDomain}`;

    if (!isValidUrl(fullUrl)) return setUrlError("Please enter a valid URL (e.g., example.com)");

    setUrlError("");
    setUrl(fullUrl);
    setIsAppActive(true);
    await analyzeWebsiteSeo(fullUrl);
  };

  // Resets component state back to the original splash screen
  const handleChangeUrl = () => {
    setIsAppActive(false);
    setChatHistory([]);
    setSeoScoreData(null);
    setQuestion("");
    setGeneralError("");
    setActiveTab("chat");
    setMapLinksData(null);
    setScrapeData(null);
  };

  /**
   * Standardizes the download capability for exporting scraped output
   */
  const handleDownload = (format: "json" | "markdown") => {
    if (!scrapeData) return;

    const isMarkdown = format === "markdown";
    const content = isMarkdown
      ? (scrapeData.markdown || "")
      : JSON.stringify(scrapeData, null, 2);

    const filename = isMarkdown ? "scraped_document.md" : "scraped_data.json";
    const mimeType = isMarkdown ? "text/markdown" : "application/json";

    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  };

  // --- API Endpoint Methods ---

  const analyzeWebsiteSeo = async (targetUrl: string) => {
    setIsAnalyzing(true);
    try {
      const data = await fetchApi("/score", { url: targetUrl });
      if (data.status === "success") {
        setSeoScoreData(data);
      }
    } catch (error) {
      console.error("Failed to fetch SEO score:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchMapLinks = async (targetUrl: string) => {
    if (mapLinksData || isMapping) return;

    setIsMapping(true);
    try {
      const data = await fetchApi("/map", { url: targetUrl });
      if (data.status === "success") {
        setMapLinksData(data.links);
      }
    } catch (error) {
      console.error("Failed to fetch map data:", error);
    } finally {
      setIsMapping(false);
    }
  };

  const fetchScrapeData = async (targetUrl: string) => {
    if (scrapeData || isScraping) return;

    setIsScraping(true);
    setScrapeError("");
    try {
      const data = await fetchApi("/scrape", { url: targetUrl });
      if (data.status === "success") {
        setScrapeData(data);
      }
    } catch (error: any) {
      console.error("Failed to fetch scrape data:", error);
      setScrapeError(error?.message || "Failed to extract data from this URL.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleAskQuestion = async (selectedQuestion?: string) => {
    const queryToAsk = selectedQuestion || question;

    setGeneralError("");
    if (!queryToAsk.trim()) return setGeneralError("Please ask a question");

    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: queryToAsk, timestamp: Date.now() },
    ]);
    setIsLoading(true);
    setQuestion("");

    try {
      const data = await fetchApi("/chat", { url, question: queryToAsk });
      if (data.status === "success") {
        setChatHistory((prev) => [
          ...prev,
          { role: "bot", text: data.bot_reply, timestamp: Date.now() },
        ]);
      }
    } catch (error: any) {
      setGeneralError(error.message || "Server connection failed. Please ensure the backend is available.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Component Render Methods ---

  const renderHeader = () => (
    <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 transition-colors duration-300 bg-white border-slate-100">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ScrapeSmart AI
        </div>
        <span className="text-sm font-medium text-slate-400">v1.0</span>
      </div>
      <div className="flex items-center gap-4">
        {isAppActive && (
          <div className="flex items-center gap-3 text-sm text-slate-500 hidden sm:flex bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="truncate max-w-50" title={url}>
              Target: <span className="font-medium text-slate-800">{url.replace(/^https?:\/\//, '')}</span>
            </span>
            <div className="w-px h-4 bg-slate-300" />
            <button
              onClick={handleChangeUrl}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              title="Change Target URL"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </header>
  );

  const renderIntroScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-10">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-2">
        <Icons.Link />
      </div>
      <h1 className="text-2xl font-semibold text-slate-700">
        Analyze Any Website
      </h1>
      <p className="max-w-md text-slate-500">
        Enter a URL to run a technical SEO audit, scrape content, and chat with the website data.
      </p>

      <div className="flex flex-col w-full max-w-md gap-4 mt-4">
        <div className="flex flex-col gap-1 text-left">
          <div className={`flex w-full rounded-xl border bg-white overflow-hidden shadow-sm transition-shadow ${urlError ? 'border-red-400 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-2 focus-within:ring-blue-500'}`}>

            {/* Protocol Dropdown */}
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="bg-slate-50 border-r border-slate-200 px-3 py-3 text-sm text-slate-600 font-medium outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="https://">https://</option>
              <option value="http://">http://</option>
            </select>

            {/* Domain Input with Enter Key support */}
            <input
              type="text"
              placeholder="example.com"
              value={domainInput}
              onChange={(e) => {
                let value = e.target.value.trim();
                
                // Auto-strip protocol if user types/pastes full URL
                if (value.startsWith("https://")) {
                  setProtocol("https://");
                  value = value.slice(8);
                } else if (value.startsWith("http://")) {
                  setProtocol("http://");
                  value = value.slice(7);
                }
                
                setDomainInput(value);
                setUrlError(""); // Hide error on typing
              }}
              onKeyDown={(e) => e.key === "Enter" && handleStartAnalysis()}
              className="flex-1 px-4 py-3 outline-none text-slate-800 bg-transparent w-full placeholder-slate-400"
            />
          </div>
          {urlError && <p className="text-red-500 text-sm px-1 animate-fade-in">{urlError}</p>}
        </div>
        <button
          onClick={handleStartAnalysis}
          disabled={!domainInput.trim() || !!urlError}
          className="w-full py-3 px-4 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Analyze Website
        </button>
      </div>
    </div>
  );

  const renderTabsSelection = () => {
    const tabs: { type: TabType; label: string }[] = [
      { type: "chat", label: "💬 Chat AI" },
      { type: "seo", label: "📊 SEO Audit" },
      { type: "scrape", label: "📄 Scrape" },
      { type: "map", label: "🕸️ Map Links" },
      { type: "pages", label: "🖼️ Pages" },
      { type: "search", label: "🔍 Web Search" }
    ];

    return (
      <div className="flex justify-center mb-4">
        <div className="p-1 bg-slate-100 rounded-xl inline-flex space-x-1 border border-slate-200 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type);
                if (tab.type === "map" || tab.type === "pages") {
                  fetchMapLinks(url);
                }
                if (tab.type === "scrape") fetchScrapeData(url);
              }}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.type
                  ? "bg-white shadow-sm text-blue-600 border border-slate-200"
                  : "text-slate-500 hover:text-slate-700 border border-transparent"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderChatInputBar = () => {
    if (!isAppActive || activeTab !== "chat") return null;

    return (
      <div className="fixed bottom-0 left-0 w-full pt-6 pb-6 px-4 bg-linear-to-t from-white via-white to-transparent z-20">
        <div className="max-w-3xl mx-auto flex gap-2 items-center border shadow-lg rounded-full p-2 pl-5 pr-2 bg-white border-slate-200">
          <input
            type="text"
            className="flex-1 bg-transparent py-2 px-2 outline-none text-[15px] text-slate-800 placeholder-slate-400"
            placeholder="Ask ScrapeSmart about this website..."
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (generalError) setGeneralError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={isLoading || !question.trim()}
            className="p-3 rounded-full transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:shadow-none"
          >
            <Icons.Send />
          </button>
        </div>
        {generalError && (
          <div className="max-w-3xl mx-auto mt-4 animate-slide-up">
            <ErrorState
              title="Connection Error" 
              message={generalError.length > 150 ? "Failed to connect to the AI model. Please check your API key or network." : generalError} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen font-sans transition-colors duration-300 bg-white text-slate-800 animate-fade-in">
      {renderHeader()}
      <main className={`flex-1 overflow-y-auto px-4 sm:px-6 py-8 flex flex-col gap-6 max-w-4xl mx-auto w-full ${activeTab === 'chat' ? 'pb-36' : 'pb-10'}`}>
        {!isAppActive && renderIntroScreen()}
        {isAppActive && (
          <>
            {renderTabsSelection()}
            {activeTab === "chat" && (
              <ChatTab
                chatHistory={chatHistory}
                isLoading={isLoading}
                suggestedQuestions={suggestedQuestions}
                handleAskQuestion={handleAskQuestion}
                messagesEndRef={messagesEndRef}
              />
            )}
            {activeTab === "seo" && (
              <SeoTab
                url={url}
                isAnalyzing={isAnalyzing}
                seoScoreData={seoScoreData}
              />
            )}
            {activeTab === "scrape" && (
              <ScrapeTab
                isScraping={isScraping}
                scrapeData={scrapeData}
                scrapeView={scrapeView}
                setScrapeView={setScrapeView}
                handleDownload={handleDownload}
                error={scrapeError}
              />
            )}
            {activeTab === "map" && (
              <MapTab
                isMapping={isMapping}
                mapLinksData={mapLinksData}
              />
            )}
            {activeTab === "pages" && (
              <PagesTab
                isMapping={isMapping}
                mapLinksData={mapLinksData}
              />
            )}
            {activeTab === "search" && <SearchTab />}
          </>
        )}
      </main>
      {renderChatInputBar()}
    </div>
  );
}