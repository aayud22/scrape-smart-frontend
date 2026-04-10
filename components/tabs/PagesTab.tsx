import React, { useState } from "react";
import LoadingState from "@/components/LoadingState";

interface PagesTabProps {
  isMapping: boolean;
  mapLinksData: { url: string; title: string }[] | null;
}

const PagePreviewCard = ({ link, screenshotUrl }: { link: any, screenshotUrl: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col gap-2 group">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-md transition-all"
      >
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <span className="text-xs font-medium">Preview unavailable</span>
          </div>
        )}

        {!hasError && (
          <img
            loading="lazy"
            src={screenshotUrl}
            onLoad={() => setIsLoaded(true)}
            alt={`Screenshot of ${link?.title}`}
            onError={() => { setIsLoaded(true); setHasError(true); }}
            className={`w-full h-full object-cover object-top group-hover:scale-[1.02] transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </a>
      <div className="px-1 mt-1">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {link?.title}
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {link?.url?.replace(/^https?:\/\//, '')}
        </p>
      </div>
    </div>
  );
};

export default function PagesTab({ isMapping, mapLinksData }: PagesTabProps) {
  const getScreenshotUrl = (url: string) => {
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  };

  return (
    <div className="animate-fade-in">
      {isMapping ? (
        <LoadingState message="Generating UI screenshots for pages..." />
      ) : mapLinksData && mapLinksData?.length > 0 ? (
        <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🖼️ Page UI Previews
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {mapLinksData?.length} Pages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-150 overflow-y-auto p-2">
            {mapLinksData?.map((link, index) => (
              <PagePreviewCard
                key={index}
                link={link}
                screenshotUrl={getScreenshotUrl(link.url)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-10 p-10 border border-slate-200 rounded-2xl bg-slate-50">
          No pages found. Please ensure the Map Links tab successfully crawled the site.
        </div>
      )}
    </div>
  );
}