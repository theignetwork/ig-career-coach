import { useState, useEffect } from 'react';

export function useToolContext(): string | null {
  const [toolContext, setToolContext] = useState<string | null>(null);
  
  useEffect(() => {
    const path = window.location.pathname;
    
    // Adjust these to match your actual URLs
    if (path.includes('resume-analyzer')) {
      setToolContext('resume-analyzer');
    } else if (path.includes('cover-letter')) {
      setToolContext('cover-letter-generator');
    } else if (path.includes('interview-oracle')) {
      setToolContext('interview-oracle');
    } else if (path.includes('interview-coach')) {
      setToolContext('interview-coach');
    } else if (path.includes('hidden-job-boards') || path.includes('job-boards')) {
      setToolContext('hidden-job-boards');
    } else if (path.includes('insider-briefs') || path.includes('briefs')) {
      setToolContext('insider-briefs');
    } else {
      setToolContext(null);
    }
  }, []);
  
  return toolContext;
}
