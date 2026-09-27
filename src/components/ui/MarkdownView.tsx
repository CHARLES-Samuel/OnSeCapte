import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`text-slate-300 text-sm leading-relaxed space-y-2 select-text ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-2 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-white mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-slate-100 mt-1 mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-100">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          code: ({ children }) => (
            <code className="bg-slate-900 text-primary-300 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary-500 pl-3 italic text-slate-400 my-2">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline transition"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
