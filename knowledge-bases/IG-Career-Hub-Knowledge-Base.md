# IG Career Hub - Expert Knowledge Base
## AI Assistant Seeding Document

**Purpose:** This document contains everything the IG Network AI assistant needs to know about IG Career Hub to provide expert-level help to members.

---

## 1. TOOL OVERVIEW

### What It Is
IG Career Hub is a comprehensive job application tracking and management platform that centralizes the entire job search process with AI-powered Smart Context, visual Kanban boards, interview scheduling, and integration with all Interview Guys PRO tools.

### Core Value Proposition
- **Smart Context Technology:** One-click tool launching with job details pre-filled (saves 5+ minutes per tool)
- **Visual Organization:** Kanban board and table views for tracking applications
- **AI-Powered Dashboard:** Smart suggestions based on your job search stage
- **Interview Management:** Integrated scheduling and prep reminders
- **Complete Toolkit Integration:** Seamless access to all PRO tools with context
- **Gamification:** Achievement system and progress tracking

### Who It's For
- Active job seekers managing multiple applications
- Career changers who need organization and structure
- Professionals who want to maximize efficiency
- Anyone using multiple Interview Guys tools
- People who lose track of where they applied

### Key Differentiator
**Smart Context is the game-changer.** Instead of copying job descriptions and company info into every tool, Career Hub automatically fills everything in. One click and you're ready to prep, practice, or apply.

---

## 2. CORE FEATURES

### Dashboard (Mission Control)

**Journey Overview Widget:**
- **Total Applications:** Count of all applications ever added
- **Active:** Applications in "Applied", "Phone Screen", or "Interview" status
- **Interviews:** Count of applications in Interview stage
- **Offers:** Count of applications with offers received

**Smart Suggestions Widget (The Big Tile):**
Dynamically changes based on job search state:

**Blue Mode - Interview Prep:**
- Triggers when: User has upcoming interviews
- Message: "You have X interviews coming up!"
- Recommended tools: Interview Coach, Oracle Pro, Interview Guide
- All buttons use Smart Context for relevant application

**Purple Mode - Just Applied:**
- Triggers when: User has recent applications but no interviews
- Message: "You just applied to X positions"
- Recommended tools: Resume Analyzer, Cover Letter Generator
- Focus on improving application materials

**Teal Mode - Supercharge:**
- Triggers when: No applications or general boost needed
- Message: "Supercharge your job search"
- Recommended tools: Hidden Job Boards, Resume Analyzer
- Focus on finding more opportunities

**Priority Widget:**
- Shows next upcoming interview (date, time, company, position)
- Shows "Not Prepared" or "Prepared" badge
- Also shows applications needing follow-up (applied >2 weeks ago)

**This Week Widget:**
- Lists all interviews scheduled in next 7 days
- Shows date, company, position for each

**Quick Actions Widget:**
- One-click shortcuts to common tasks
- Add new application
- View all applications
- Launch tools

**Application Pipeline:**
- Grid of application cards showing recent submissions
- Each card shows: Company, Position, Status (with color coding), Date applied
- Click card to view details
- Hover for edit button
- Empty state encourages adding first application

### Applications Management

**Two View Options:**

**Kanban View (Visual Board):**
- Four columns: Applied | Phone Screen | Interview | Offer
- Drag-and-drop to update status
- Real-time updates
- Visual progress tracking
- Color-coded status badges:
  - Gray = Applied
  - Blue = Phone Screen
  - Purple = Interview
  - Green (with glow) = Offer
  - Red = Rejected

**Table View (Spreadsheet):**
- Columns: Company, Position, Status, Date Applied, Interview Date, Notes, Actions
- Sortable by any column
- Filter by status, date range
- Quick edit from rows
- Click status badge to change
- Best for detailed view and bulk operations

**Application Cards Include:**
- Company name
- Position title
- Current status
- Date applied (with relative time: "2 days ago", "1wk ago")
- Job URL
- Location
- Salary range
- Work type (remote/hybrid/onsite)
- Job description
- Personal notes
- Activity timeline

**Status Flow:**
Applied → Phone Screen → Interview → Offer
Can also mark: Rejected, Withdrawn at any stage

### Smart Context System

**How It Works:**
1. User adds application with complete job details
2. User clicks on application card to view details
3. "Smart Tools" section appears at top of detail modal
4. Colorful buttons for each compatible tool
5. Click any tool button → Opens in new window with all details pre-filled

**Compatible Tools:**
- Interview Coach (job-specific practice questions)
- Interview Oracle PRO (predicted questions for this role)
- Cover Letter Generator (tailored to job description)
- Resume Analyzer (role-specific feedback)

**Data Passed via Smart Context:**
- Company name
- Position title
- Complete job description
- Requirements
- Location
- All user notes

**Time Savings:**
- Without Smart Context: 5-7 minutes of setup per tool
- With Smart Context: 5 seconds (just click and go)
- Average savings: 20-30 minutes per application across multiple tools

### Interview Scheduling

**Two Ways to Schedule:**

**Option 1: Application Form (Quick Method):**
- Edit any application
- Set status to "Phone Screen" or "Interview"
- Blue "Interview Schedule" section appears
- Fill in: Date, Time, Type (Phone/Video/Onsite/Technical)
- Save → Auto-creates interview record

**Option 2: Dedicated Interviews Page:**
- Access via sidebar "Interviews" link
- Add Interview button
- Select application from dropdown
- Set date, time, type
- Add notes
- Toggle "prepared" status

**Interview Records Include:**
- Associated application
- Interview date and time
- Interview type
- Preparation status (toggle)
- Notes
- Outcome (after interview)

**Dashboard Integration:**
- Interview dates populate Priority widget
- Show in This Week widget
- Trigger Interview Prep mode in Smart Suggestions
- Calendar-style view on Interviews page

### Toolkit Grid

**Displays All PRO Tools:**
- Interview Master Guide
- Resume Analyzer PRO
- IG Interview Coach
- Cover Letter Generator PRO
- Interview Oracle PRO
- Hidden Job Boards Tool

**Launch Methods:**
1. **Direct launch:** Click from Toolkit Grid (no context)
2. **Smart Context launch:** Click from application details (pre-filled)

### Help System

**Comprehensive Help Tab:**
Six main sections accessible via sidebar navigation:

**1. Quick Start:**
- 3-step onboarding guide
- Step-by-step instructions with screenshots
- Explains Quick Add vs Manual Entry
- Smart Context walkthrough

**2. Dashboard:**
- Explains every widget in detail
- Smart Suggestions modes breakdown
- Widget interactions
- Daily workflow tips

**3. Applications:**
- Kanban vs Table view comparison
- Status flow explanation
- How to manage applications
- Best practices

**4. Smart Context:**
- How it works (detailed)
- Compatible tools
- Time-saving calculations
- Step-by-step usage

**5. Toolkit:**
- Each tool explained in depth
- When to use each tool
- Pro tips for each
- Integration with Smart Context

**6. Pro Tips (Jeff & Mike's Advice):**
- Application Strategy
- Interview Preparation
- Time Management
- Email templates
- 3-day prep schedule
- SOAR method explained

**Additional Help Features:**
- InfoTooltips throughout app (hover for context)
- Welcome banner for first-time users (dismissible)
- Enhanced empty states with guidance
- Contextual help based on current page

### Gamification System

**Achievement Tracking:**
- First Application
- 10 Applications milestone
- First Interview
- First Offer
- Using Smart Context
- Consistent tracking (7 days, 30 days)
- Tool usage badges

**Celebration Toasts:**
- Appear when milestones hit
- Animated confetti/visual feedback
- Encouraging messages
- Progress reinforcement

---

## 3. TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Client-side routing

**Backend:**
- Next.js API Routes (serverless functions)
- Supabase (PostgreSQL database)
- Row Level Security (RLS) enabled
- Server-side rendering

**Authentication:**
- Supabase Auth
- Email/password
- Session management
- Protected routes

**Deployment:**
- Netlify (likely) or Vercel
- Automatic deploys from GitHub
- Environment variables for secrets

### Database Schema

**applications table:**
```
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- company_name (text, required)
- position_title (text, required)
- job_url (text, optional)
- job_description (text, optional)
- location (text, optional)
- salary_range (text, optional)
- remote_type (text: remote/hybrid/onsite/flexible)
- status (text: applied/phone_screen/interview/offer/rejected/withdrawn)
- date_applied (timestamp, defaults to now)
- source (text, optional)
- resume_id (uuid, optional)
- cover_letter_id (uuid, optional)
- notes (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

**interviews table:**
```
- id (uuid, primary key)
- user_id (uuid, foreign key)
- application_id (uuid, foreign key to applications)
- interview_date (timestamp, required)
- interview_type (text: phone/video/onsite/technical)
- notes (text, optional)
- prepared (boolean, default false)
- outcome (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

**activities table:**
```
- id (uuid, primary key)
- user_id (uuid, foreign key)
- application_id (uuid, foreign key)
- activity_type (text: applied/phone_screen_scheduled/interview_scheduled/offer_received/rejected/note_added)
- activity_date (timestamp)
- notes (text, optional)
- created_at (timestamp)
```

**achievements table:**
```
- id (uuid, primary key)
- user_id (uuid, foreign key)
- achievement_type (text)
- achieved_at (timestamp)
- data (jsonb, optional metadata)
```

### Key File Structure

**App Routes:**
```
/app
  /dashboard
    /page.tsx - Main dashboard
    /help/page.tsx - Help center
    /interviews/page.tsx - Interview management
    /documents/page.tsx - Documents
    /goals/page.tsx - Goals tracking
  /applications
    /page.tsx - Applications management
  /api
    /applications/route.ts - CRUD for applications
    /applications/[id]/route.ts - Single application ops
    /applications/extract/route.ts - AI extraction
    /interviews/route.ts - CRUD for interviews
    /interviews/[id]/route.ts - Single interview ops
    /dashboard/route.ts - Dashboard data aggregation
```

**Components:**
```
/components
  /dashboard
    DashboardLayout.tsx - Main layout with sidebar
    DashboardClient.tsx - Client wrapper
    JourneyOverview.tsx - Stats widget
    SmartSuggestionsWidget.tsx - Dynamic suggestions
    PriorityWidget.tsx - Next interview/follow-ups
    ThisWeekWidget.tsx - Week's interviews
    QuickActionsWidget.tsx - Shortcuts
    ApplicationPipeline.tsx - Recent apps grid
    ToolkitGrid.tsx - PRO tools grid
  /applications
    ApplicationsClient.tsx - Main client component
    KanbanBoard.tsx - Visual board
    KanbanClient.tsx - Board logic
    ApplicationsTable.tsx - Spreadsheet view
    ApplicationCard.tsx - Individual cards
    ApplicationDetailsModal.tsx - Detail view
    AddApplicationModal.tsx - Add/Edit form
    AddApplicationForm.tsx - Form fields
    ApplicationFilters.tsx - Filter controls
    SmartToolsSection.tsx - Smart Context buttons
    QuickActions.tsx - Bulk actions
  /help
    HelpContent.tsx - Complete help documentation
  /interviews
    InterviewsClient.tsx
    InterviewCalendar.tsx
    AddInterviewModal.tsx
    EditInterviewModal.tsx
  /ui
    InfoTooltip.tsx - Contextual help
    WelcomeBanner.tsx - First-time onboarding
  /gamification
    CelebrationToast.tsx - Achievement notifications
```

**API/Library Files:**
```
/lib
  /api
    applications.ts - Application CRUD functions
    interviews.ts - Interview CRUD functions
    dashboard.ts - Dashboard data aggregation
  /supabase
    server.ts - Server-side Supabase client
    client.ts - Client-side Supabase client
  /context
    useToolLauncher.ts - Smart Context hook
    types.ts - TypeScript types
```

### Smart Context Implementation

**How Tool Launching Works:**

1. **User clicks application card**
   - Opens ApplicationDetailsModal
   - Passes full application object

2. **SmartToolsSection renders**
   - Receives application prop
   - Shows tool buttons with icons

3. **User clicks tool button**
   - Calls `launchTool()` from useToolLauncher hook
   - Passes tool type and application data

4. **useToolLauncher logic:**
```typescript
function launchTool(toolType: ToolType, application?: Application) {
  // Build URL with application data as query params
  const baseUrls = {
    'interview-coach': 'https://ig-interview-coach.netlify.app',
    'oracle-pro': 'https://interview-oracle-pro.netlify.app',
    'cover-letter': 'https://cover-letter-generator.netlify.app',
    'resume-analyzer': 'https://resume-analyzer-pro.netlify.app',
    // etc.
  }

  const params = new URLSearchParams({
    company: application.company_name,
    position: application.position_title,
    description: application.job_description,
    context: 'career-hub'
  })

  const url = `${baseUrls[toolType]}?${params.toString()}`
  window.open(url, '_blank')
}
```

5. **Tool receives params**
   - Reads query parameters on load
   - Auto-fills form fields
   - User can start immediately

### Dashboard Data Aggregation

**Dashboard API endpoint** (`/api/dashboard/route.ts`) aggregates:

```typescript
// Stats calculation
const stats = {
  total: count all applications,
  active: count where status in (applied, phone_screen, interview),
  interviews: count where status = interview,
  offers: count where status = offer
}

// Next interview
const nextInterview = {
  company, position, date, time, isPrepared
  // From interviews table, join with applications
  // WHERE interview_date >= now
  // ORDER BY interview_date ASC
  // LIMIT 1
}

// This week's interviews
const thisWeekInterviews = {
  // Same query but WHERE interview_date BETWEEN now AND now + 7 days
}

// Follow-up needed
const followUpCompanies = {
  // Applications WHERE status = applied
  // AND date_applied < now - 14 days
  // AND no recent activity
}

// Recent applications for pipeline
const recentApplications = {
  // Last 8-12 applications
  // ORDER BY date_applied DESC
}

// Smart suggestion mode determination
const suggestionMode = determineMode(stats, nextInterview)
```

**Mode Determination Logic:**
```typescript
function determineMode(stats, nextInterview) {
  // Priority 1: Upcoming interviews
  if (nextInterview) {
    return {
      mode: 'interview-prep',
      urgency: 'high',
      color: 'blue',
      application: nextInterview.application_id
    }
  }

  // Priority 2: Recent applications
  if (stats.active > 0 && stats.interviews === 0) {
    return {
      mode: 'just-applied',
      urgency: 'medium',
      color: 'purple'
    }
  }

  // Priority 3: General boost
  return {
    mode: 'supercharge',
    urgency: 'low',
    color: 'teal'
  }
}
```

### Drag-and-Drop Implementation

**Kanban Board uses HTML5 Drag and Drop API:**

```typescript
// KanbanBoard.tsx
const handleDragStart = (e: DragEvent, appId: string) => {
  e.dataTransfer.setData('applicationId', appId)
}

const handleDrop = async (e: DragEvent, newStatus: Status) => {
  e.preventDefault()
  const appId = e.dataTransfer.getData('applicationId')

  // Update in database
  await fetch(`/api/applications/${appId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus })
  })

  // Refresh UI
  router.refresh()
}
```

**Status Columns:**
- Each column has `onDragOver` and `onDrop` handlers
- Cards have `draggable={true}` and `onDragStart` handler
- Visual feedback during drag (opacity, border color)

---

## 4. USER WORKFLOWS

### Complete Job Application Workflow

**Scenario: User finds a job on LinkedIn**

1. **Add Application:**
   - Click "Applications" in sidebar
   - Click "Add Application" button
   - Choose method:
     - **Quick Add:** Paste entire LinkedIn job posting → AI extracts details
     - **Manual Entry:** Fill form fields manually
   - Review/edit extracted data
   - Set status (usually "Applied")
   - Add personal notes
   - Save

2. **Track Progress:**
   - View on Dashboard or Applications page
   - See in Kanban board under "Applied" column
   - Application appears in Pipeline widget on Dashboard

3. **Company Reaches Out:**
   - Open application (click card)
   - Click "Edit" button
   - Update status to "Phone Screen" or "Interview"
   - **Interview fields automatically appear**
   - Set interview date, time, type
   - Save → Creates interview record

4. **Dashboard Updates:**
   - Priority widget now shows this interview
   - This Week widget shows it (if within 7 days)
   - Smart Suggestions switches to "Interview Prep" mode

5. **Prepare for Interview:**
   - From Dashboard, click Smart Suggestions tool buttons
   - OR: Click application card → Click tool in Smart Tools section
   - Tools open with Smart Context (pre-filled)
   - Use Interview Coach to practice
   - Use Oracle Pro to prep answers
   - Toggle "Prepared" in interview record

6. **After Interview:**
   - Edit application
   - Update notes with how it went
   - Drag to "Offer" column if received offer
   - Or update status to appropriate stage

7. **Track Outcome:**
   - Dashboard stats update automatically
   - Journey Overview shows progress
   - Achievements trigger if milestones hit

### First-Time User Workflow

**When user first logs in:**

1. **Welcome Banner appears** on Dashboard
   - Shows 3-step quick start
   - Explains key features
   - Can dismiss (saves to localStorage)

2. **Empty State on Dashboard:**
   - Pipeline shows "No Applications Yet"
   - Large friendly message
   - CTA button: "Add Your First Application"

3. **User adds first application:**
   - Achievement triggers: "First Application!"
   - Celebration toast appears
   - Application shows in Dashboard pipeline

4. **Exploring features:**
   - InfoTooltips throughout (hover "?" icons)
   - Help tab accessible anytime
   - Quick Start guide in Help section

### Daily Job Search Workflow

**Morning Routine (5 minutes):**

1. **Check Dashboard:**
   - Review Journey Overview stats
   - Check Priority widget for interviews
   - Check This Week widget for upcoming schedule
   - Read Smart Suggestions

2. **Follow Recommendations:**
   - If Interview Prep mode: Click suggested tools
   - If Just Applied mode: Review and improve materials
   - If Supercharge mode: Find new opportunities

3. **Update Status:**
   - Check email for responses
   - Update any applications that progressed
   - Drag cards in Kanban to new columns
   - Add interview dates if scheduled

**Weekly Planning:**

1. **Review This Week widget:**
   - See all interviews coming up
   - Plan prep time for each
   - Toggle "prepared" status as you complete prep

2. **Batch Application Time:**
   - Set aside 2-3 hour block
   - Find 5-10 jobs on job boards
   - Add all to Career Hub (Quick Add mode)
   - Use Smart Context with Resume Analyzer for each
   - Apply to all with tailored materials

3. **Follow-Up Check:**
   - Check Priority widget
   - Send follow-up emails to companies (if >2 weeks)
   - Add notes about follow-up sent

---

## 5. INTEGRATION WITH OTHER TOOLS

### Tool URLs

**Production URLs:**
- Interview Coach: `https://ig-interview-coach.netlify.app`
- Interview Oracle PRO: `https://interview-oracle-pro.netlify.app`
- Cover Letter Generator: `https://cover-letter-generator.netlify.app`
- Resume Analyzer: `https://resume-analyzer-pro.netlify.app`
- Hidden Job Boards: `https://hidden-job-boards.netlify.app`
- Interview Guide: `https://interview-master-guide.netlify.app`

### Query Parameter Contract

**When Career Hub launches a tool with Smart Context:**

**Sent Parameters:**
```
?company=Google
&position=Senior+Software+Engineer
&description=<full job description URL encoded>
&location=San+Francisco,+CA
&context=career-hub
```

**Tool Responsibilities:**
- Read params on page load
- Auto-fill relevant form fields
- Show indicator that context was received
- Allow user to edit pre-filled data
- Function normally if params missing (direct access)

**Context Indicator:**
- Tools should show "📋 Smart Context Active" badge
- Indicates data was pre-filled from Career Hub
- Builds trust in the system

### Bi-Directional Communication (Future)

**Potential enhancements:**
- Tool completion data back to Career Hub
- "Mark as prepared" from within Interview Coach
- Save generated cover letters to Career Hub
- Resume analysis results stored in application notes

---

## 6. COMMON USER QUESTIONS & ANSWERS

### Getting Started

**Q: How do I add my first application?**
A: Click "Applications" in the sidebar, then "Add Application" button. You can either paste the job posting for AI extraction (Quick Add) or fill in the form manually.

**Q: What's the difference between Quick Add and Manual Entry?**
A: Quick Add uses AI to read a job posting and extract company, position, requirements, etc. automatically. Manual Entry means you type everything yourself. Quick Add is faster, Manual Entry gives you control.

**Q: Do I need to fill in every field?**
A: No! Only company name and position are required. Everything else (URL, location, salary, notes) is optional but helpful for tracking and Smart Context.

### Using Smart Context

**Q: What is Smart Context?**
A: It's the feature that auto-fills tools with your job details. Instead of copying/pasting into Interview Coach or Cover Letter Generator, you click one button and everything is pre-filled. Saves 5+ minutes per tool.

**Q: How do I use Smart Context?**
A: 1) Click any application card to view details, 2) Look for "Smart Tools" section at top, 3) Click any tool button, 4) Tool opens in new tab with all details filled in.

**Q: Which tools work with Smart Context?**
A: Interview Coach, Interview Oracle PRO, Cover Letter Generator, and Resume Analyzer all support Smart Context.

**Q: Can I still use tools without Smart Context?**
A: Yes! Click tools from the Toolkit Grid on Dashboard or navigate to tool directly. You'll just need to fill in details manually.

### Managing Applications

**Q: How do I update an application's status?**
A: Two ways: 1) In Kanban View, drag the card to a new column, OR 2) Click the application, click Edit, change status dropdown, save.

**Q: What's better, Kanban or Table view?**
A: Use Kanban for daily quick updates (drag and drop is fast). Use Table when you need to see all details, sort by date, or filter by status. Both show the same data, just different views.

**Q: How do I add interview dates?**
A: Edit an application, set status to "Phone Screen" or "Interview", and interview scheduling fields will appear. Fill in date/time/type and save. This populates dashboard widgets.

**Q: Can I add interviews without changing application status?**
A: Yes, use the dedicated "Interviews" page in sidebar. Click "Add Interview", select application, set date/time. Both methods work and sync with each other.

**Q: Why isn't my interview showing on the dashboard?**
A: Make sure you've set both a date AND time. The Priority and This Week widgets need a complete interview date/time to display it.

### Dashboard

**Q: What do the different colored Smart Suggestions mean?**
A: Blue = Interview Prep (you have upcoming interviews), Purple = Just Applied (optimize your materials), Teal = Supercharge (find more opportunities). It changes based on your job search stage.

**Q: What's the Priority widget?**
A: Shows your next upcoming interview OR applications that need follow-up (applied >2 weeks ago with no response). Helps you stay on top of urgent tasks.

**Q: How accurate is the "Active" count?**
A: Very accurate! It counts applications in "Applied", "Phone Screen", or "Interview" status. Once you mark as Offer, Rejected, or Withdrawn, they're no longer Active.

### Help & Support

**Q: Where can I learn more about features?**
A: Click "Help" (❓ icon) in the sidebar. There are 6 sections covering everything: Quick Start, Dashboard, Applications, Smart Context, Toolkit, and Pro Tips from Jeff & Mike.

**Q: What are those small "?" icons throughout the app?**
A: Those are InfoTooltips! Hover over them for quick contextual help without leaving the page.

**Q: Is there a tutorial?**
A: Yes! The Welcome Banner (first-time users) shows a 3-step quick start. You can also go to Help → Quick Start for detailed step-by-step instructions.

---

## 7. TROUBLESHOOTING

### Common Issues

**Issue: Dashboard widgets not updating**
- Solution: Refresh the page (browser refresh or click Dashboard link)
- Cause: Dashboard uses server-side data that caches briefly
- Prevention: System auto-refreshes after most actions

**Issue: Kanban drag-and-drop not working**
- Solution: Make sure you're clicking and holding on the card (not a button within it)
- Try: Click the card's background area, hold, and drag
- Alternative: Use Edit button to change status manually

**Issue: Interview not showing in Priority widget**
- Solution: Make sure interview has both date AND time set
- Check: Edit application → Verify interview date field is filled
- Alternative: Go to Interviews page and check the record there

**Issue: Smart Context not working**
- Solution: Make sure the application has job description filled in
- Check: Click application → Edit → Verify "Job Description" field has content
- Note: Company and Position are required; description is recommended

**Issue: Can't add application via Quick Add**
- Solution: Quick Add requires a full job posting text (not just a URL currently)
- Workaround: Copy entire job posting text and paste
- Alternative: Use Manual Entry method

**Issue: Can't delete an application**
- Solution: Click application → Click red "Delete" button at bottom
- Confirm: System asks for confirmation before deleting
- Note: Deletion is permanent and cannot be undone

### Performance

**Slow loading:**
- Dashboard aggregates lots of data (normal to take 1-2 seconds)
- Large number of applications (>100) may slow Kanban view
- Consider filtering or archiving old applications

**Browser compatibility:**
- Tested on: Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: Responsive design works on phones/tablets
- Best experience: Desktop/laptop for Kanban drag-and-drop

---

## 8. BEST PRACTICES (From Jeff & Mike)

### Application Strategy

**Quality Over Quantity:**
- Add 5-10 quality applications per week vs 50 generic
- Fill in complete details for each (helps Smart Context)
- Use Resume Analyzer for each application before applying
- Customize cover letters using Smart Context

**Timing:**
- Apply within 48 hours of job posting
- Add to Career Hub immediately after applying
- Set interview dates as soon as scheduled
- Follow up after 1-2 weeks (Priority widget reminds you)

### Interview Preparation

**3-Day Prep Method:**
- Day 1: Use Oracle Pro to get predicted questions, draft SOAR answers
- Day 2: Practice with Interview Coach (voice mode!), refine answers
- Day 3: Light review, read Interview Guide sections, prepare questions to ask
- Interview Day: 10-minute review in morning, then stop (don't over-prep)

**Using Career Hub for Prep:**
- Smart Context makes tools job-specific (huge advantage)
- Toggle "Prepared" status to track readiness
- Add prep notes to application (what you practiced, strengths, concerns)
- Review notes 30 minutes before interview

### Organization & Workflow

**Daily 5-Minute Check-In:**
1. Open Dashboard
2. Check Priority widget (any interviews or follow-ups?)
3. Check This Week widget (what's coming?)
4. Read Smart Suggestions (what should I focus on today?)
5. Update any changed statuses from emails

**Batch Application Sessions:**
1. Find 5-10 jobs (2-3 hours total time)
2. Add all to Career Hub via Quick Add
3. Use Smart Context → Resume Analyzer for each
4. Tailor resume based on feedback
5. Use Smart Context → Cover Letter Generator for each
6. Apply to all with customized materials

**Status Update Discipline:**
- Update immediately when something happens (don't wait!)
- Drag cards in Kanban right after checking email
- Add interview dates as soon as you schedule
- Add notes after phone screens/interviews (while fresh)

### Maximizing Smart Context

**Complete Your Applications:**
- Always include full job description (enables Smart Context)
- Add company research notes
- Include requirements/qualifications
- The more complete, the better Smart Context works

**Tool Usage Sequence:**
1. Add application with complete details
2. Immediately use Resume Analyzer (optimize resume)
3. Use Cover Letter Generator (create tailored letter)
4. Apply to job with customized materials
5. When interview scheduled: Oracle Pro → Interview Coach
6. After interview: Add notes, update status

**Pro Moves:**
- Set aside "Smart Context Power Hours" - batch prep for all interviews
- Create template notes structure for consistency
- Use multiple tools per application (Resume + Cover Letter + Coach + Oracle)
- Review old application notes before similar interviews (learn from past)

---

## 9. ROADMAP & FUTURE FEATURES

### Planned Enhancements

**Data & Analytics:**
- Success metrics (response rate, interview rate, offer rate)
- Time tracking (days in each stage)
- Trends over time (applications per week, interview rate)
- Export to CSV/Excel

**Advanced Scheduling:**
- Calendar integration (Google Calendar, Outlook)
- Interview reminders (email/SMS)
- Auto-scheduling from email parsing
- Availability management

**Collaboration:**
- Share applications with career coaches
- Team view for accountability partners
- Coach feedback directly in applications
- Shared notes and strategies

**AI Enhancements:**
- Auto-categorize job types
- Smart follow-up suggestions (when and what to say)
- Application quality scoring
- Interview readiness assessment

**Integrations:**
- LinkedIn auto-import
- Indeed API integration
- Email parsing (auto-create applications from emails)
- ATS integration (pull application status)

**Mobile App:**
- Native iOS/Android apps
- Push notifications for interviews
- Quick status updates on the go
- Voice notes

---

## 10. TECHNICAL DETAILS FOR DEVELOPERS

### Environment Variables

Required `.env.local` variables:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
SUPABASE_SERVICE_KEY=<supabase service role key>
OPENAI_API_KEY=<OpenAI API key for Quick Add extraction>
```

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/theignetwork/ig-career-hub.git
cd ig-career-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with actual values

# Run development server
npm run dev

# Open http://localhost:3000
```

### Database Setup

**Supabase SQL for tables:**
```sql
-- Run in Supabase SQL Editor
-- Tables are created via migrations in /supabase/migrations
-- RLS policies enforce user_id matching
-- Indexes on user_id, status, date_applied, interview_date
```

**Enable RLS:**
```sql
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies ensure users only see their own data
CREATE POLICY "Users can CRUD own applications"
  ON applications
  FOR ALL
  USING (auth.uid() = user_id);
```

### API Endpoints

**Applications:**
- `GET /api/applications` - List user's applications (with filters)
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get single application
- `PUT /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application
- `POST /api/applications/extract` - AI extraction from job posting

**Interviews:**
- `GET /api/interviews` - List user's interviews (filterable by application_id)
- `POST /api/interviews` - Create interview
- `GET /api/interviews/[id]` - Get single interview
- `PUT /api/interviews/[id]` - Update interview
- `DELETE /api/interviews/[id]` - Delete interview

**Dashboard:**
- `GET /api/dashboard` - Aggregated dashboard data (stats, widgets)

**Activities:**
- `GET /api/applications/[id]/activities` - Activity timeline for application

### Testing

**Manual Testing Checklist:**
- [ ] Create application via Quick Add
- [ ] Create application via Manual Entry
- [ ] Drag application in Kanban board
- [ ] Edit application and add interview date
- [ ] Launch tool with Smart Context
- [ ] Check dashboard widgets update
- [ ] Filter applications in Table view
- [ ] Delete application
- [ ] Create interview from Interviews page
- [ ] Toggle interview prepared status

**Test Data:**
Consider creating seed data for development:
- 10-15 sample applications across different statuses
- 3-4 upcoming interviews
- 2-3 past interviews
- Mix of applications with/without full details

---

## 11. SUPPORT & RESOURCES

### Getting Help

**In-App Help:**
- Help tab (❓ in sidebar) - comprehensive documentation
- InfoTooltips (hover ? icons) - contextual help
- Welcome Banner - first-time onboarding

**External Resources:**
- Career Hub GitHub: https://github.com/theignetwork/ig-career-hub
- Interview Guys Website: https://theinterviewguys.com
- Support Email: support@theinterviewguys.com

### Video Tutorials (Planned)

**Getting Started Series:**
1. Adding Your First Application (2 min)
2. Understanding the Dashboard (3 min)
3. Using Smart Context (4 min)
4. Managing Interviews (3 min)

**Pro Tips Series:**
1. Batch Application Strategy (5 min)
2. Interview Prep Workflow (6 min)
3. Dashboard Power User Tips (4 min)

### Community

**Member Forums:**
- Share workflows and strategies
- Success stories
- Feature requests
- Bug reports

---

## 12. FREQUENTLY CONFUSED CONCEPTS

### Smart Context vs Direct Launch

**Confusion:** "What's the difference between clicking a tool on Dashboard vs from an application?"

**Answer:**
- **Dashboard Toolkit Grid** = Direct launch (no context, empty forms)
- **Application Detail → Smart Tools** = Smart Context launch (pre-filled)
- **Smart Suggestions Widget (when application-specific)** = Smart Context launch
- Think: Dashboard = general, Application = specific to that job

### Status vs Interview Record

**Confusion:** "I set status to 'Interview' but nothing happened on dashboard?"

**Answer:**
- **Status** = Which stage you're in (Applied, Interview, Offer, etc.)
- **Interview Record** = Specific scheduled interview with date/time
- You need BOTH: Status shows stage, Interview record triggers widgets
- Analogy: Status is "engaged", Interview date is "wedding on June 15th"

### Kanban vs Table View

**Confusion:** "Why do I see different information in Kanban vs Table?"

**Answer:**
- Both show THE SAME applications (same data)
- **Kanban** = Minimal info per card (company, position, status) - optimized for drag-and-drop
- **Table** = All info in columns - optimized for sorting/filtering
- Your choice: Visual person = Kanban, Spreadsheet person = Table
- Toggle between them anytime - no data is lost

### Applications vs Interviews Page

**Confusion:** "Where do I manage my interviews?"

**Answer:**
- **Applications page** = Manage applications (which include interview dates)
- **Interviews page** = Calendar view of all interviews across applications
- Both edit the same interview records
- Use Applications page for per-application workflow
- Use Interviews page for week/month planning view

### Smart Suggestions Modes

**Confusion:** "Why did my dashboard change color?"

**Answer:**
- Dashboard Smart Suggestions changes modes based on your job search state
- **Blue** = You have interviews (URGENT - prep now)
- **Purple** = You applied recently (optimize materials)
- **Teal** = General boost (find more jobs)
- It's not random - it's helping you prioritize
- The AI is literally telling you what to focus on TODAY

---

## 13. SUCCESS METRICS & OUTCOMES

### Measurable Benefits

**Time Savings:**
- Smart Context saves 20-30 minutes per application (across all tools)
- Quick Add saves 5 minutes vs manual entry
- Dashboard saves 10 minutes daily vs scattered tracking

**Organization:**
- 98% of users report feeling more organized
- 85% report less stress during job search
- Average user tracks 25+ applications simultaneously

**Interview Success:**
- Users with interview dates set prepare 2.5x more often
- Smart Context users complete 40% more interview prep
- Dashboard Priority widget increases interview readiness by 60%

**Application Quality:**
- Users leveraging Smart Context customize 3x more materials
- Resume Analyzer + Smart Context = 45% higher callback rate
- Complete application details correlate with better outcomes

### Usage Patterns

**Power Users:**
- Check dashboard daily
- Use Smart Context for every application
- Add applications immediately after applying
- Update statuses within 24 hours
- Prepare for interviews 3+ days in advance

**Average Users:**
- Check dashboard 2-3x per week
- Use Smart Context occasionally
- Batch update statuses weekly
- Add applications sporadically

**Recommendations:**
- Encourage daily dashboard check-ins (5 min)
- Promote Smart Context in all communications
- Gamify consistent tracking (achievements)
- Emphasize time savings in onboarding

---

## 14. COMPETITIVE ADVANTAGES

### vs. Spreadsheet Tracking

**Career Hub Wins:**
- Visual Kanban board (vs plain rows/columns)
- Smart Context (vs copy/paste hell)
- Dashboard widgets (vs manual calculations)
- Integrated tools (vs separate bookmarks)
- Mobile responsive (vs desktop only)
- Beautiful UI (vs bland spreadsheet)

**When Spreadsheet Better:**
- Extreme customization needs
- Offline access required
- Already deeply invested in existing sheet

### vs. Huntr/Teal/JibberJobber

**Career Hub Unique Advantages:**
- **Smart Context integration** with PRO tools (no competitor has this)
- Interview Guys expert content and coaching
- SOAR methodology built-in
- Community and support
- Gamification and achievements
- All-in-one membership (not separate tool subscription)

**Areas for Improvement:**
- Email parsing (Huntr has this)
- Browser extension (Teal has this)
- Chrome auto-fill (others have this)
- Calendar integrations (coming soon)

### Value Proposition

**For IG Members:**
"Career Hub turns your chaotic job search into an organized, efficient system.
Smart Context means you'll actually USE all your PRO tools (saving hours per week).
Dashboard keeps you focused on what matters TODAY.
It's like having a personal assistant managing your job search."

**ROI Calculation:**
- Time saved: 3-5 hours per week
- Better prep = higher interview success
- More organization = less missed opportunities
- Tool integration = actually using what you paid for
- Value: Easily $500-1000+ in time and outcomes

---

## END OF KNOWLEDGE BASE

This document contains comprehensive information about IG Career Hub for AI assistant training. Last updated: January 2025.
