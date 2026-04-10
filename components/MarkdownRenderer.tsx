import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        // Custom styling for Markdown elements using Tailwind CSS
        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-slate-700" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-700" {...props} />,
        li: ({ node, ...props }) => <li className="" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-slate-800 mt-5 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        // Styling for inline code (`code`) and code blocks (```code```)
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !className;
          return isInline ? (
            <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200" {...props}>
              {children}
            </code>
          ) : (
            <div className="my-4 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
              <div className="flex items-center px-4 py-2 bg-slate-900/50 text-xs font-mono text-slate-400 border-b border-slate-700">
                {match ? match[1] : 'code'}
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-50">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}