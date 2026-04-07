import React from "react";

export type ScrapeData = {
  content?: string;
  markdown?: string;
};

interface ScrapeTabProps {
  isScraping: boolean;
  scrapeData: ScrapeData | null;
  scrapeView: "markdown" | "json";
  setScrapeView: (view: "markdown" | "json") => void;
  handleDownload: (format: "json" | "markdown") => void;
}

export default function ScrapeTab({
  isScraping,
  scrapeData,
  scrapeView,
  setScrapeView,
  handleDownload,
}: ScrapeTabProps) {
  // Array definition abstracts redundant download buttons logic
  const downloadButtons = [
    { format: "json" as const, label: "JSON" },
    { format: "markdown" as const, label: "Markdown" }
  ];

  return (
    <div className="animate-fade-in">
      {isScraping ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Extracting raw markdown...</p>
        </div>
      ) : scrapeData ? (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 gap-3">
            
            {/* Dynamic View Toggle Controller */}
            <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-lg shrink-0">
              {[
                { view: "markdown", label: "Markdown", icon: <span className="text-orange-600 font-bold">M↓</span> },
                { view: "json", label: "JSON", icon: <span className="text-slate-400 font-bold">{"{ }"}</span> }
              ].map((toggle) => (
                <button
                  key={toggle.view}
                  onClick={() => setScrapeView(toggle.view as "markdown" | "json")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    scrapeView === toggle.view
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {toggle.icon} {toggle.label}
                </button>
              ))}
            </div>

            {/* Dynamic Action Buttons Rendering Output */}
            <div className="flex items-center gap-2 flex-wrap">
              {downloadButtons.map((btn) => (
                <button 
                  key={btn.format}
                  onClick={() => handleDownload(btn.format)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {btn.label}
                </button>
              ))}

              <button 
                onClick={() => {
                  const textToCopy = scrapeView === "markdown" 
                    ? (scrapeData.markdown || "")
                    : JSON.stringify(scrapeData, null, 2);
                  navigator.clipboard.writeText(textToCopy);
                }}
                className="text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm font-medium ml-1"
              >
                Copy {scrapeView === "markdown" ? "Markdown" : "JSON"}
              </button>
            </div>
          </div>

          <div className="p-4 overflow-auto max-h-125 min-h-50 bg-white">
            <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap wrap-break-word leading-relaxed">
              {scrapeView === "markdown" 
                ? (scrapeData.markdown || "No markdown content was generated.") 
                : JSON.stringify(scrapeData, null, 2)
              }
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
