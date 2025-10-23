# Feature: Add Tool Links to Chat Responses

## Problem
When the bot mentions tools (like "IG Interview Coach"), users don't have a way to easily navigate to them.

**Current:**
> "The IG Interview Coach can help you practice..."

**Wanted:**
> "The [IG Interview Coach](#) can help you practice..." (clickable)

---

## Solution: Backend Enhancement

This should be handled in your **backend system prompt** so the AI automatically includes links when mentioning tools.

### Update Your System Prompt

Add this section to your backend system prompt (in Netlify function):

```
## Tool References and Links

When you mention any of our tools, ALWAYS provide a clickable link. Use this format:

**Tool URLs:**
- Resume Analyzer Pro: https://members.theinterviewguys.com/resume-analyzer
- Cover Letter Generator Pro: https://members.theinterviewguys.com/cover-letter-generator
- Interview Oracle Pro: https://members.theinterviewguys.com/interview-oracle
- IG Interview Coach: https://members.theinterviewguys.com/interview-coach
- Hidden Job Boards Tool: https://members.theinterviewguys.com/hidden-job-boards
- IG Insider Briefs: https://members.theinterviewguys.com/insider-briefs

**How to reference tools:**
- First mention: Use the full linked name → "[Resume Analyzer Pro](url)"
- Subsequent mentions: Can use shortened version → "the analyzer" or "Resume Analyzer"

**Examples:**
❌ "You should use the Resume Analyzer Pro to check your score."
✅ "You should use the [Resume Analyzer Pro](https://members.theinterviewguys.com/resume-analyzer) to check your score."

❌ "The Interview Coach has video practice features."
✅ "The [IG Interview Coach](https://members.theinterviewguys.com/interview-coach) has video practice features."

**Important:** 
- Always provide the link on first mention
- Links should open in the same tab (user is already in the members area)
- Keep explanations helpful but encourage trying the tool
```

---

## Alternative: Frontend Link Detection (Optional Backup)

If you want the frontend to automatically linkify tool mentions (in case backend misses some), add this helper:

### Add to Message.tsx

```typescript
function linkifyToolMentions(text: string): string {
  const toolLinks = {
    'Resume Analyzer Pro': 'https://members.theinterviewguys.com/resume-analyzer',
    'resume analyzer': 'https://members.theinterviewguys.com/resume-analyzer',
    'Cover Letter Generator Pro': 'https://members.theinterviewguys.com/cover-letter-generator',
    'cover letter generator': 'https://members.theinterviewguys.com/cover-letter-generator',
    'Interview Oracle Pro': 'https://members.theinterviewguys.com/interview-oracle',
    'interview oracle': 'https://members.theinterviewguys.com/interview-oracle',
    'IG Interview Coach': 'https://members.theinterviewguys.com/interview-coach',
    'interview coach': 'https://members.theinterviewguys.com/interview-coach',
    'Hidden Job Boards Tool': 'https://members.theinterviewguys.com/hidden-job-boards',
    'hidden job boards': 'https://members.theinterviewguys.com/hidden-job-boards',
    'IG Insider Briefs': 'https://members.theinterviewguys.com/insider-briefs',
    'insider briefs': 'https://members.theinterviewguys.com/insider-briefs',
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

// Then use it before rendering:
export function Message({ role, content, sources, showSources = true }: MessageProps) {
  // Linkify tool mentions if this is an assistant message
  const processedContent = role === 'assistant' 
    ? linkifyToolMentions(content) 
    : content;
  
  return (
    <div className={`flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="...">
        <ReactMarkdown className="markdown-content">
          {processedContent}
        </ReactMarkdown>
        {/* ... sources ... */}
      </div>
    </div>
  );
}
```

---

## My Recommendation

**Do BOTH:**

1. **Backend (Primary):** Update system prompt so AI naturally includes links
   - More reliable
   - Links are contextual
   - Can add helpful descriptions

2. **Frontend (Backup):** Add linkify function as safety net
   - Catches any mentions backend missed
   - Zero dependency on backend changes
   - Can deploy immediately

---

## Enhanced: Smart Tool Cards (Advanced)

For an even better UX, you could add tool cards that appear after recommendations:

```tsx
interface ToolCardProps {
  tool: string;
  description: string;
  url: string;
}

function ToolCard({ tool, description, url }: ToolCardProps) {
  return (
    <a
      href={url}
      className="block mt-3 p-3 bg-gradient-to-br from-primary-teal/10 to-transparent border border-primary-teal/30 rounded-lg hover:border-primary-teal hover:shadow-lg hover:shadow-primary-teal/20 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary-teal font-semibold text-sm group-hover:text-primary-teal-dark">
            🛠️ {tool}
          </p>
          <p className="text-text-gray text-xs mt-1">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary-teal group-hover:translate-x-1 transition-transform" />
      </div>
    </a>
  );
}

// Usage in Message.tsx
{role === 'assistant' && detectsToolMention(content) && (
  <ToolCard
    tool="Resume Analyzer Pro"
    description="Check your ATS score in seconds"
    url="https://members.theinterviewguys.com/resume-analyzer"
  />
)}
```

This creates a nice call-to-action card below messages that mention tools.

---

## Testing

After implementation:
- [ ] Bot mentions Resume Analyzer → link appears
- [ ] Bot mentions Interview Coach → link appears
- [ ] Links are clickable
- [ ] Links work (go to correct tool)
- [ ] Links maintain styling in markdown
- [ ] Works for both exact names and casual mentions

---

## Prompt for Claude Code (Simple Version)

```
Add automatic tool linking in Message.tsx. When assistant messages mention any IG Network tool names (Resume Analyzer Pro, Interview Oracle Pro, Cover Letter Generator Pro, IG Interview Coach, Hidden Job Boards Tool, IG Insider Briefs), automatically convert them to markdown links pointing to https://members.theinterviewguys.com/[tool-slug]. Use the linkifyToolMentions function approach. Make it case-insensitive and don't double-link if already in markdown format.
```

---

## Alternative: Backend Update (If You Have Access)

If you can easily update your backend system prompt, just add:

```
IMPORTANT: Whenever you mention any of our tools, use markdown links:
- [Resume Analyzer Pro](https://members.theinterviewguys.com/resume-analyzer)
- [Cover Letter Generator Pro](https://members.theinterviewguys.com/cover-letter-generator)
- [Interview Oracle Pro](https://members.theinterviewguys.com/interview-oracle)
- [IG Interview Coach](https://members.theinterviewguys.com/interview-coach)
- [Hidden Job Boards Tool](https://members.theinterviewguys.com/hidden-job-boards)
- [IG Insider Briefs](https://members.theinterviewguys.com/insider-briefs)

Always link tools on first mention.
```

This is the cleanest approach since the AI will naturally include helpful links in context.

---

## My Final Recommendation

**Do frontend linkification NOW** (5 min implementation), then **update backend system prompt** when you can (more natural and contextual).

This way you get immediate value with the safety net approach.