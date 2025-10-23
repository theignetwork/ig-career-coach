/**
 * Tool Recommendation Engine
 * Analyzes user messages and recommends relevant tools
 */

// Tool catalog with keywords and metadata
const TOOL_CATALOG = {
  'resume-analyzer': {
    name: 'Resume Analyzer Pro',
    keywords: ['resume', 'cv', 'ats', 'optimize resume', 'resume review', 'resume score', 'applicant tracking'],
    description: 'Scans your resume for ATS optimization and gives specific improvement suggestions',
    url: '/tools/resume-analyzer',
    category: 'resume'
  },
  'interview-oracle': {
    name: 'Interview Oracle Pro',
    keywords: ['interview', 'interview questions', 'practice interview', 'mock interview', 'interview prep', 'behavioral questions'],
    description: 'Get AI-powered interview practice with personalized questions based on your role',
    url: '/tools/interview-oracle',
    category: 'interview'
  },
  'cover-letter-generator': {
    name: 'Cover Letter Generator Pro',
    keywords: ['cover letter', 'application letter', 'letter of interest', 'cover letter template'],
    description: 'Creates tailored cover letters that get you noticed by hiring managers',
    url: '/tools/cover-letter-generator',
    category: 'application'
  },
  'interview-coach': {
    name: 'IG Interview Coach',
    keywords: ['interview practice', 'soar method', 'star method', 'behavioral interview', 'answer questions'],
    description: 'Practice answering tough interview questions using our proven SOAR method',
    url: '/tools/interview-coach',
    category: 'interview'
  },
  'hidden-job-boards': {
    name: 'Hidden Job Boards Tool',
    keywords: ['job search', 'job boards', 'find jobs', 'hidden jobs', 'job listings', 'where to apply'],
    description: 'Access curated job boards that most job seekers don\'t know about',
    url: '/tools/hidden-job-boards',
    category: 'job-search'
  },
  'insider-briefs': {
    name: 'IG Insider Briefs',
    keywords: ['salary', 'compensation', 'negotiate salary', 'pay range', 'industry insights', 'company research'],
    description: 'Get insider insights on salaries, companies, and industry trends',
    url: '/tools/insider-briefs',
    category: 'research'
  }
};

/**
 * Analyzes message and returns tool recommendations
 * @param {string} message - User's message
 * @param {Array} toolsAlreadyRecommended - Tools recommended in this session
 * @returns {Object} - Recommendation result
 */
export function recommendTools(message, toolsAlreadyRecommended = []) {
  const messageLower = message.toLowerCase();
  const recommendations = [];

  // Score each tool based on keyword matches
  for (const [toolId, tool] of Object.entries(TOOL_CATALOG)) {
    // Skip if already recommended in this session
    if (toolsAlreadyRecommended.includes(toolId)) {
      continue;
    }

    // Count keyword matches
    let score = 0;
    for (const keyword of tool.keywords) {
      if (messageLower.includes(keyword)) {
        score += 1;
      }
    }

    // If we have matches, add to recommendations
    if (score > 0) {
      recommendations.push({
        toolId,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        category: tool.category,
        score
      });
    }
  }

  // Sort by score (highest first) and take top 2
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, 2);

  return {
    shouldRecommend: topRecommendations.length > 0,
    tools: topRecommendations
  };
}

/**
 * Formats tool recommendations for display
 * @param {Array} tools - Array of tool recommendations
 * @returns {string} - Formatted recommendation text
 */
export function formatRecommendations(tools) {
  if (!tools || tools.length === 0) {
    return '';
  }

  if (tools.length === 1) {
    const tool = tools[0];
    return `\n\n💡 **By the way:** Since you're working on this, you might find our **${tool.name}** helpful. It ${tool.description.toLowerCase()}. [Check it out here](${tool.url})`;
  }

  // Multiple tools
  let text = '\n\n💡 **Tools that might help:**\n';
  for (const tool of tools) {
    text += `\n- **[${tool.name}](${tool.url})** - ${tool.description}`;
  }

  return text;
}
