import React, { useState } from "react";
import LoadingState from "@/components/LoadingState";
import MarkdownRenderer from "../MarkdownRenderer";

export interface SeoData {
  seo_score: number;
  details: string[];
}

interface SeoTabProps {
  isAnalyzing: boolean;
  seoScoreData: SeoData | null;
  url: string;
}

export default function SeoTab({ isAnalyzing, seoScoreData, url }: SeoTabProps) {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(false);

  // Filter out only errors and warnings from the details
  const issues = seoScoreData?.details.filter(
    (detail) => detail.includes("❌") || detail.includes("⚠️")
  ) || [];

  const handleGetAiSuggestions = async () => {
    if (issues.length === 0) return;

    setIsFetchingAdvice(true);
    setAiAdvice(null);

    try {
      // Craft a highly specific hidden prompt for our Chat API
      const prompt = `Act as an Expert Technical SEO Consultant. I ran an audit on ${url} and found these specific issues:\n${issues.join("\n")}\n\nPlease provide a short, highly actionable step-by-step guide on how I can fix these exact issues. Keep it concise, professional, and use bullet points.`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, question: prompt }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setAiAdvice(data.bot_reply);
      } else {
        throw new Error(data.detail || "Failed to fetch advice");
      }
    } catch (error: any) {
      setAiAdvice("⚠️ AI is currently unavailable. Please try again later.");
    } finally {
      setIsFetchingAdvice(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {isAnalyzing ? (
        <LoadingState message="Running Technical SEO Audit..." />
      ) : seoScoreData ? (
        <div className="flex flex-col gap-6">
          <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                Technical SEO Audit
              </h3>
              <div
                className={`text-5xl font-black ${seoScoreData.seo_score >= 80 ? "text-green-500" :
                    seoScoreData.seo_score >= 50 ? "text-yellow-500" :
                      "text-red-500"
                  }`}
              >
                {seoScoreData.seo_score}
                <span className="text-lg text-slate-400 font-medium">/100</span>
              </div>
            </div>

            <ul className="space-y-4 mt-6">
              {seoScoreData.details.map((detail, index) => (
                <li key={index} className="text-base text-slate-600 flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {issues?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                {!aiAdvice && !isFetchingAdvice ? (
                  <button
                    onClick={handleGetAiSuggestions}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-3 rounded-xl font-semibold transition-colors border border-indigo-100 w-full justify-center"
                  >
                    ✨ Ask AI How to Fix These Issues
                  </button>
                ) : isFetchingAdvice ? (
                  <div className="flex items-center justify-center gap-3 text-indigo-600 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    <span className="font-medium">Generating expert SEO advice...</span>
                  </div>
                ) : (
                  <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 relative">
                    <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      ✨ AI SEO Strategy
                    </h4>
                    <div className="text-sm">
                      <MarkdownRenderer content={aiAdvice || ""} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {issues?.length === 0 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl text-center text-green-700 font-medium">
                🎉 Perfect! Your technical SEO looks flawless. No fixes needed.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-10">No SEO data available. Try re-analyzing.</div>
      )}
    </div>
  );
}