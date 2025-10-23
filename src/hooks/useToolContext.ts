import { useState, useEffect } from 'react';

export function useToolContext(): string | null {
  const [toolContext, setToolContext] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();

    // Match actual URL patterns from members site
    if (path.includes('resume-analyzer-pro')) {
      setToolContext('resume-analyzer');
    } else if (path.includes('cover-letter-generator-pro')) {
      setToolContext('cover-letter-generator');
    } else if (path.includes('interview-oracle-pro')) {
      setToolContext('interview-oracle');
    } else if (path.includes('the-ig-interview-coach')) {
      setToolContext('interview-coach');
    } else if (path.includes('hidden-job-boards-tool')) {
      setToolContext('hidden-job-boards');
    } else if (path.includes('ig-insider-briefs')) {
      setToolContext('insider-briefs');
    } else {
      setToolContext(null);
    }

    // Debug logging (can remove after testing)
    console.log('🎯 Tool Context:', { path, toolContext });
  }, []);

  return toolContext;
}
