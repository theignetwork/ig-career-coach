import type { WelcomeTile } from '../types/chat';

interface WelcomeScreenProps {
  toolContext: string | null;
  onTileClick: (query: string) => void;
}

const defaultTiles: WelcomeTile[] = [
  { icon: '🎓', title: "I'm New Here", description: "Let's get you set up and show you where everything is", query: "I'm new here, show me around and help me get started" },
  { icon: '📄', title: 'Fix My Resume', description: 'Get recruiter-ready with expert feedback and ATS insights', query: 'Help me improve my resume with expert feedback' },
  { icon: '🔍', title: 'Find Hidden Opportunities', description: 'Discover job leads and smarter search strategies', query: 'Help me find hidden job opportunities and improve my search strategy' },
  { icon: '🎤', title: 'Prepare for Interviews', description: 'Practice real questions and learn how to answer like a pro', query: 'Help me prepare for interviews with practice questions' },
  { icon: '📅', title: 'Stay on Track', description: 'Stay consistent, set reminders, and track your progress', query: 'Help me stay on track with my job search' },
  { icon: '💬', title: 'Ask Us Anything', description: 'Get personalized answers from our library of 600+ guides', query: 'I have a question about my career' }
];

const resumeAnalyzerTiles: WelcomeTile[] = [
  { icon: '📊', title: 'Scan My Resume', description: 'Upload and analyze for ATS compatibility', query: 'Help me scan my resume for ATS compatibility' },
  { icon: '📈', title: 'Improve My Score', description: 'Get actionable tips to boost your score', query: 'How can I improve my resume score?' },
  { icon: '✨', title: 'Fix Formatting', description: 'Ensure perfect resume structure', query: 'Help me fix my resume formatting' },
  { icon: '🔑', title: 'Add Keywords', description: 'Optimize for job descriptions', query: 'Help me optimize my resume keywords' },
  { icon: '📥', title: 'Download Report', description: 'Get your detailed analysis', query: 'Show me how to get my resume analysis report' },
  { icon: '❓', title: 'Ask About Results', description: 'Questions about your resume scan', query: 'I have questions about my resume scan results' }
];

const coverLetterTiles: WelcomeTile[] = [
  { icon: '✍️', title: 'Write New Letter', description: 'Start from scratch with AI help', query: 'Help me write a new cover letter' },
  { icon: '✨', title: 'Improve Existing', description: 'Polish your current draft', query: 'Help me improve my existing cover letter' },
  { icon: '🎯', title: 'Customize for Job', description: 'Tailor to specific posting', query: 'Help me customize my cover letter for a specific job' },
  { icon: '📋', title: 'Get Template', description: 'Access proven templates', query: 'Show me cover letter templates' },
  { icon: '✅', title: 'Fix Grammar', description: 'Perfect your writing', query: 'Help me check my cover letter grammar' },
  { icon: '💡', title: 'Cover Letter Tips', description: 'Expert writing advice', query: 'Give me cover letter writing tips' }
];

const interviewOracleTiles: WelcomeTile[] = [
  { icon: '🎯', title: 'Practice Questions', description: 'Get AI-powered interview prep', query: 'Help me practice interview questions' },
  { icon: '🏢', title: 'Company Research', description: 'Learn about your target company', query: 'Help me research a company for my interview' },
  { icon: '📝', title: 'SOAR Method Help', description: 'Master behavioral questions', query: 'Teach me the SOAR method for interviews' },
  { icon: '💼', title: 'Industry Questions', description: 'Role-specific interview prep', query: 'Help me prepare for industry-specific questions' },
  { icon: '🎤', title: 'Mock Interview', description: 'Full practice session', query: 'I want to do a mock interview' },
  { icon: '⚡', title: 'Last-Minute Tips', description: 'Quick confidence boosters', query: 'Give me last-minute interview tips' }
];

const interviewCoachTiles: WelcomeTile[] = [
  { icon: '📹', title: 'Video Practice', description: 'Record and review your answers', query: 'Help me practice with video interview prep' },
  { icon: '👤', title: 'Body Language Tips', description: 'Non-verbal communication help', query: 'Give me body language tips for interviews' },
  { icon: '💪', title: 'Confidence Building', description: 'Overcome interview anxiety', query: 'Help me build confidence for my interview' },
  { icon: '🎙️', title: 'Voice Coaching', description: 'Improve your delivery', query: 'Give me voice and delivery tips' },
  { icon: '👔', title: 'Outfit Advice', description: 'Dress for success guidance', query: 'Help me choose the right interview outfit' },
  { icon: '✅', title: 'Final Checklist', description: 'Day-of preparation', query: 'Give me an interview day checklist' }
];

const hiddenJobBoardsTiles: WelcomeTile[] = [
  { icon: '🏭', title: 'Search by Industry', description: 'Find niche job boards', query: 'Help me find job boards for my industry' },
  { icon: '📍', title: 'Search by Location', description: 'Local opportunity boards', query: 'Find job boards for my location' },
  { icon: '🌐', title: 'Remote Jobs', description: 'Work-from-anywhere boards', query: 'Find remote job boards' },
  { icon: '🏢', title: 'Company Boards', description: 'Direct hiring pages', query: 'Help me find company career pages' },
  { icon: '🔍', title: 'Search Strategy', description: 'How to use hidden boards', query: 'Teach me how to use hidden job boards effectively' },
  { icon: '📝', title: 'Application Tips', description: 'Stand out on these platforms', query: 'Give me tips for applying through hidden job boards' }
];

const insiderBriefsTiles: WelcomeTile[] = [
  { icon: '📰', title: 'Latest Brief', description: 'Read the newest insights', query: 'Show me the latest IG Insider Brief' },
  { icon: '📊', title: 'Industry Trends', description: "What's hot in your field", query: 'Tell me about current industry trends' },
  { icon: '🚀', title: 'Career Opportunities', description: 'Emerging roles and paths', query: 'What are emerging career opportunities?' },
  { icon: '💰', title: 'Salary Data', description: 'Compensation trends', query: 'Show me salary trends and data' },
  { icon: '📚', title: 'Browse Archives', description: 'Past briefs and insights', query: 'Show me past Insider Briefs' },
  { icon: '✉️', title: 'Request Topic', description: 'What do you want covered?', query: 'I want to request a topic for Insider Briefs' }
];

function getTilesForContext(context: string | null): WelcomeTile[] {
  switch (context) {
    case 'resume-analyzer': return resumeAnalyzerTiles;
    case 'cover-letter-generator': return coverLetterTiles;
    case 'interview-oracle': return interviewOracleTiles;
    case 'interview-coach': return interviewCoachTiles;
    case 'hidden-job-boards': return hiddenJobBoardsTiles;
    case 'insider-briefs': return insiderBriefsTiles;
    default: return defaultTiles;
  }
}

export function WelcomeScreen({ toolContext, onTileClick }: WelcomeScreenProps) {
  const tiles = getTilesForContext(toolContext);

  return (
    <div className="space-y-6">
      <p className="text-center text-text-gray text-sm">
        Your 24/7 expert for every step of your job search journey
      </p>

      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => onTileClick(tile.query)}
            className="bg-tile-bg border border-border-teal rounded-xl p-5 text-left hover:border-primary-teal hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-teal/20 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl mb-2">{tile.icon}</div>
            <h4 className="text-primary-teal font-bold mb-1">{tile.title}</h4>
            <p className="text-text-gray text-sm leading-snug">{tile.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
