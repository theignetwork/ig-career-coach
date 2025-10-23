import ReactMarkdown from 'react-markdown';
import type { Source } from '../types/chat';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  showSources?: boolean;
}

function linkifyToolMentions(text: string): string {
  const toolLinks = {
    'Resume Analyzer Pro': 'https://members.theinterviewguys.com/hq/resume-analyzer-pro/',
    'resume analyzer': 'https://members.theinterviewguys.com/hq/resume-analyzer-pro/',
    'Cover Letter Generator Pro': 'https://members.theinterviewguys.com/hq/cover-letter-generator-pro/',
    'cover letter generator': 'https://members.theinterviewguys.com/hq/cover-letter-generator-pro/',
    'Interview Oracle Pro': 'https://members.theinterviewguys.com/hq/interview-oracle-pro/',
    'interview oracle': 'https://members.theinterviewguys.com/hq/interview-oracle-pro/',
    'IG Interview Coach': 'https://members.theinterviewguys.com/hq/the-ig-interview-coach/',
    'interview coach': 'https://members.theinterviewguys.com/hq/the-ig-interview-coach/',
    'Hidden Job Boards Tool': 'https://members.theinterviewguys.com/hq/hidden-job-boards-tool/',
    'hidden job boards': 'https://members.theinterviewguys.com/hq/hidden-job-boards-tool/',
    'IG Insider Briefs': 'https://members.theinterviewguys.com/hq/ig-insider-briefs/',
    'insider briefs': 'https://members.theinterviewguys.com/hq/ig-insider-briefs/',
  };

  let linkedText = text;

  // Only linkify if not already a markdown link
  Object.entries(toolLinks).forEach(([toolName, url]) => {
    // Don't replace if already in markdown link format
    const alreadyLinked = new RegExp(`\\[${toolName}\\]\\([^)]+\\)`, 'gi');
    if (!alreadyLinked.test(linkedText)) {
      // Replace tool name with markdown link (case insensitive)
      const regex = new RegExp(`\\b${toolName}\\b`, 'gi');
      linkedText = linkedText.replace(regex, `[${toolName}](${url})`);
    }
  });

  return linkedText;
}

export function Message({ role, content, sources, showSources = true }: MessageProps) {
  // Linkify tool mentions if this is an assistant message
  const processedContent = role === 'assistant'
    ? linkifyToolMentions(content)
    : content;
  return (
    <div className={`flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] px-4 py-3 text-sm
        ${role === 'user'
          ? 'bg-gradient-to-br from-primary-teal to-primary-teal-dark text-white rounded-2xl rounded-br-sm shadow-lg shadow-primary-teal/30'
          : 'bg-tile-bg text-text-light border border-border-teal rounded-2xl rounded-bl-sm'
        }
      `}>
        <div className="markdown-content">
          <ReactMarkdown>
            {processedContent}
          </ReactMarkdown>
        </div>
        
        {showSources && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-teal/40">
            <p className="text-xs text-text-gray mb-2">📚 Related Articles:</p>
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary-teal text-xs hover:underline"
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