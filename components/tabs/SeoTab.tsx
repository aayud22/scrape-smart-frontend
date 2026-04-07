import React from "react";

export type SeoData = {
  seo_score: number;
  details: string[];
};

interface SeoTabProps {
  isAnalyzing: boolean;
  seoScoreData: SeoData | null;
}

export default function SeoTab({ isAnalyzing, seoScoreData }: SeoTabProps) {
  return (
    <div className="animate-fade-in">
      {isAnalyzing ? (
        <div className="animate-pulse p-6 border border-slate-200 rounded-2xl bg-slate-50">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      ) : seoScoreData ? (
        <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Technical SEO Audit
            </h3>
            <div className={`text-5xl font-black ${
                seoScoreData.seo_score >= 80 ? 'text-green-500' : 
                seoScoreData.seo_score >= 50 ? 'text-yellow-500' : 
                'text-red-500'
              }`}
            >
              {seoScoreData.seo_score}<span className="text-lg text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <ul className="space-y-4 mt-6">
            {seoScoreData.details.map((detail, index) => (
              <li key={index} className="text-base text-slate-600 flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-10">No SEO data available. Try re-analyzing.</div>
      )}
    </div>
  );
}
