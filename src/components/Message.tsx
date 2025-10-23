import ReactMarkdown from 'react-markdown';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  showSources?: boolean;
}

export function Message({ role, content, sources, showSources = true }: MessageProps) {
  return (
    <div className={`flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] px-4 py-3 text-sm
        ${role === 'user'
          ? 'bg-gradient-to-br from-primary-teal to-primary-teal-dark text-white rounded-2xl rounded-br-sm shadow-lg shadow-primary-teal/30'
          : 'bg-tile-bg text-text-light border border-border-teal rounded-2xl rounded-bl-sm'
        }
      `}>
        {/* Render markdown with custom components */}
        <ReactMarkdown
          components={{
            // Clickable links (not raw markdown)
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-teal underline hover:text-primary-teal-dark font-medium transition-colors"
              >
                {children}
              </a>
            ),
            // Bold text
            strong: ({ children }) => (
              <strong className="font-bold text-white">{children}</strong>
            ),
            // Paragraphs with spacing
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
            ),
            // Unordered lists
            ul: ({ children }) => (
              <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
            ),
            // Ordered lists
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
            ),
            // List items
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            // Inline code
            code: ({ children }) => (
              <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Sources section */}
        {showSources && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-teal/40">
            <p className="text-xs text-text-gray mb-2">📚 Related Articles:</p>
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary-teal text-xs hover:underline mb-1"
              >
                → {source.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}