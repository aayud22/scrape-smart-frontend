import React from "react";

export type MapLinksData = {
  url: string;
  title: string;
};

interface MapTabProps {
  isMapping: boolean;
  mapLinksData: MapLinksData[] | null;
}

export default function MapTab({ isMapping, mapLinksData }: MapTabProps) {
  return (
    <div className="animate-fade-in">
      {isMapping ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Crawling website for internal links...</p>
        </div>
      ) : mapLinksData ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">
              🕸️ Internal Link Map
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {mapLinksData.length} Links Found
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-125 overflow-y-auto">
            {mapLinksData.map((link, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="truncate pr-4 flex-1">
                  <p className="font-medium text-slate-800 text-sm truncate">{link.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{link.url}</p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-auto"
                >
                  Visit Link ↗
                </a>
              </div>
            ))}
            {mapLinksData.length === 0 && (
              <div className="p-8 text-center text-slate-500">No internal links found on this page.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
