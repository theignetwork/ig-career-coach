# IG Interview Coach - Expert Knowledge Base
## AI Assistant Seeding Document

**Purpose:** This document contains everything the IG Network AI assistant needs to know about IG Interview Coach to provide expert-level help to members.

---

## 1. TOOL OVERVIEW

### What It Is
IG Interview Coach is an AI-powered interview practice tool that generates personalized questions from job descriptions and allows members to practice answering via voice input, receiving detailed AI feedback on their responses.

### Core Value Proposition
- **Voice-Based Practice:** Answer questions by speaking, not typing
- **Job Description Upload:** PDF/DOCX support plus text input
- **AI-Generated Questions:** Custom questions based on actual job requirements
- **Detailed Feedback:** Specific suggestions for improvement
- **Whisper API Integration:** Advanced speech-to-text for accurate transcription
- **Rate-Limited Access:** 20 sessions per IP per 24-hour rolling window (prevents abuse)

### Who It's For
- Job seekers who want realistic interview practice
- People nervous about speaking in interviews
- Anyone who wants AI feedback on their answers
- Professionals preparing for specific job interviews
- Career changers who need to practice reframing experience

### Key Differentiator
**Voice input makes practice realistic.** Most tools make you type answers, but real interviews require speaking. This tool bridges the gap between preparation and performance.

---

## 2. HOW IT WORKS

### The Complete Workflow

**Step 1: Job Description Input**

**Three Input Methods:**
1. **Upload PDF/DOCX:** Drag and drop or browse for file
2. **Paste Text:** Copy entire job posting into text box
3. **Hybrid:** Upload file AND add additional context in text box

**What to Include:**
- Complete job description
- Job title
- Company name (if not in description)
- Any special instructions from recruiter
- Department/team information
- Any interview prep materials provided

**File Requirements:**
- Max file size: Varies by implementation
- Formats accepted: PDF, DOCX
- Text must be extractable (not scanned images)

---

**Step 2: AI Question Generation**

**What the AI Does:**
1. **Parses Job Description:**
   - Extracts key requirements
   - Identifies must-have skills
   - Notes preferred qualifications
   - Recognizes role level/seniority
   - Detects industry-specific needs

2. **Generates Questions:**
   - Creates 5-8 customized interview questions
   - Mixes behavioral and situational questions
   - Prioritizes most important competencies
   - Matches question difficulty to role level
   - Includes company-specific considerations

3. **Question Types Generated:**
   - Behavioral (Tell me about a time...)
   - Situational (What would you do if...)
   - Technical/Role-specific
   - Culture fit questions
   - Motivation questions

**Time to Generate:** 30-60 seconds

---

**Step 3: Voice Recording Practice**

**How Voice Input Works:**

**Setup:**
- Click microphone icon next to question
- Allow browser to access microphone (first time only)
- Browser will request permission - click "Allow"

**Recording Process:**
1. Click "Start Recording"
2. Visual indicator shows you're recording (usually red dot or pulsing icon)
3. Speak your answer naturally (as if in real interview)
4. Click "Stop Recording" when finished
5. Audio uploads and transcribes automatically

**Technical Details:**
- Uses OpenAI's Whisper API for transcription
- Supports clear audio in quiet environments best
- Recommended: Use external microphone or headset for best quality
- Supports most modern browsers (Chrome, Firefox, Safari, Edge)

**Best Practices:**
- Practice in quiet room (minimize background noise)
- Speak clearly at normal conversation volume
- Don't rush - pace yourself naturally
- Aim for 1.5-2 minute answers
- Pause naturally between thoughts (Whisper handles this well)

---

**Step 4: AI Transcription & Analysis**

**What Happens Behind the Scenes:**

**Transcription (Whisper API):**
- Converts your speech to text
- Handles filler words, pauses, natural speech
- Recognizes industry terminology
- Usually 95%+ accurate with clear audio
- Displays transcript so you can see what AI "heard"

**Analysis (GPT-4/Claude):**
AI evaluates your answer on multiple dimensions:
1. **Content Quality:** Did you answer the question fully?
2. **Structure:** Did you use a framework (like SOAR)?
3. **Specificity:** Did you provide concrete examples?
4. **Relevance:** Does answer match job requirements?
5. **Clarity:** Was your answer easy to follow?

**Time for Feedback:** 30-45 seconds after recording stops

---

**Step 5: Detailed Feedback**

**What You Receive:**

**Transcript Display:**
- Your complete answer transcribed
- Allows you to see what AI heard
- Can identify speech patterns you weren't aware of

**Strengths Identified:**
- What you did well
- Strong elements to keep
- Effective techniques used
- Good examples provided

**Areas for Improvement:**
- Specific weaknesses identified
- Missing elements (e.g., "You didn't mention results")
- Structural issues
- Vague language to strengthen
- Filler words to reduce

**Actionable Suggestions:**
- Specific things to add
- How to restructure answer
- Examples to include
- Framework to apply
- Next practice focus

**Sample Improved Answer:**
- Sometimes includes a rewritten version
- Shows how to strengthen weak areas
- Demonstrates better structure
- Incorporates missing elements

---

## 3. UNDERSTANDING THE RATE LIMITING

### Why Rate Limits Exist

**The System:**
- 20 sessions per IP address per 24-hour rolling window
- Prevents abuse and controls API costs
- Ensures fair access for all members
- Protects against automated scraping

**What Counts as a Session:**
- Each time you generate questions from a new job description
- Does NOT count: practicing same questions multiple times
- Does NOT count: re-recording same answer
- Does count: starting fresh with new job description

**Rolling 24-Hour Window:**
Not midnight-to-midnight. If you use session at 2pm Tuesday, that session "expires" and becomes available again at 2pm Wednesday.

---

### Managing Your Session Allocation

**Strategic Usage:**

**Best Practices:**
- Use sessions for real job applications you're pursuing
- Don't waste sessions on jobs you're not seriously considering
- Practice all questions in a single session before moving to next job
- Re-practice same questions multiple times (doesn't use sessions)

**If You Hit the Limit:**

**What Happens:**
- Friendly error message appears
- Shows when your oldest session will expire
- Explains when you can resume

**What to Do:**
1. Note the reset time
2. Use Interview Oracle Pro in the meantime (no session limits)
3. Return when sessions are available
4. Plan your practice sessions more strategically

**Pro Tip:** Prioritize your most important interviews for this tool. Use Interview Oracle Pro for general practice.

---

## 4. VOICE RECORDING BEST PRACTICES

### Technical Setup for Success

**Equipment Recommendations:**

**Minimum:**
- Computer/laptop with built-in microphone
- Quiet room
- Modern browser

**Better:**
- External USB microphone
- Headset with microphone
- Room with minimal echo

**Best:**
- Professional microphone
- Headphones (to hear yourself clearly)
- Treated room or closet (for sound dampening)

**Browser Compatibility:**
- ✅ Chrome (best support)
- ✅ Firefox (excellent)
- ✅ Edge (good)
- ✅ Safari (good, may need permissions configured)
- ❌ Internet Explorer (not supported)

---

### Environment Setup

**Choose the Right Location:**

**Ideal Practice Space:**
- Quiet room with door you can close
- Minimal background noise
- No echo (soft surfaces better than hard)
- Good internet connection (for upload)

**Things to Avoid:**
- ❌ Coffee shops or public spaces
- ❌ Rooms with loud HVAC or fans
- ❌ Near windows with traffic noise
- ❌ Spaces with other people talking

**Pro Setup:**
Tell household members you're practicing
Put phone on silent
Close windows
Turn off noisy appliances
Hang "Do Not Disturb" sign

---

### Speaking Technique

**How to Sound Your Best:**

**Volume:**
- Speak at normal conversation level
- Not too loud (will distort)
- Not too quiet (hard to transcribe)
- Consistent volume throughout

**Pace:**
- Natural speaking speed
- Don't rush due to nervousness
- Pause between thoughts (it's okay!)
- Slower is usually better than faster

**Clarity:**
- Enunciate clearly
- Don't mumble or trail off
- Face the microphone
- Avoid covering your mouth

**Tone:**
- Enthusiastic but not fake
- Confident but not arrogant
- Professional but personable
- Vary your tone (avoid monotone)

---

### Common Recording Issues

**Problem: Transcript is inaccurate**

**Possible Causes:**
- Too much background noise
- Speaking too quickly
- Mumbling or unclear enunciation
- Microphone too far away
- Technical jargon or unusual terms

**Solutions:**
- Move to quieter space
- Slow down
- Speak more clearly
- Move closer to microphone
- Spell out unusual terms when practicing

---

**Problem: Can't start recording**

**Possible Causes:**
- Browser doesn't have microphone permission
- Microphone is being used by another application
- No microphone detected
- Browser compatibility issue

**Solutions:**
- Check browser settings for microphone permissions
- Close other apps using microphone (Zoom, Skype, etc.)
- Verify microphone is connected
- Try different browser
- Refresh page and try again

---

**Problem: Recording cuts off mid-answer**

**Possible Causes:**
- Network connection dropped
- Session timeout
- Browser tab lost focus
- Accidentally clicked stop

**Solutions:**
- Check internet connection
- Keep tab active during recording
- Don't click away during recording
- Re-record answer

---

## 5. COMMON MEMBER QUESTIONS & ANSWERS

### "How is this different from Interview Oracle Pro?"

**Answer:**
**Both tools help with interview prep, but they work differently. Here's when to use each:**

**Use Interview Oracle Pro When:**
- You want to prepare written answers first
- You need multiple answer formats (full, concise, bullets)
- You want to save sessions for multiple jobs
- You're in early preparation phase
- You prefer reading over speaking initially

**Use IG Interview Coach When:**
- You want to practice speaking your answers
- You need feedback on verbal delivery
- You're close to actual interview (1-2 weeks out)
- You want realistic practice environment
- You need to work on pacing and clarity

**Best Strategy: Use Both Together**
1. Generate questions in Interview Oracle Pro
2. Prepare written SOAR answers
3. Practice memorization and natural delivery
4. Switch to IG Interview Coach for voice practice
5. Get feedback on spoken delivery
6. Refine based on feedback

**Think of it like:**
- Interview Oracle Pro = Writing your speech
- IG Interview Coach = Rehearsing delivery of speech

---

### "Can I practice the same question multiple times?"

**Answer:**
**Yes! And you should. Here's the strategy:**

**Why Multiple Attempts Matter:**
- First attempt: Get your thoughts out, even if messy
- Second attempt: Apply feedback, improve structure
- Third attempt: Refine timing and delivery
- Fourth+ attempt: Aim for natural, confident delivery

**How to Approach Multiple Attempts:**

**Attempt 1 - Baseline:**
- Record without over-thinking
- See what naturally comes out
- Don't worry about perfection
- Goal: Capture initial approach

**Attempt 2 - Incorporate Feedback:**
- Review feedback from first attempt
- Address specific suggestions
- Add missing elements
- Improve structure

**Attempt 3 - Refine Timing:**
- Aim for 1.5-2 minutes
- Cut unnecessary details
- Strengthen key points
- Work on transitions

**Attempt 4+ - Natural Delivery:**
- Stop sounding rehearsed
- Sound conversational
- Maintain confidence
- Be ready for actual interview

**Pro Tip:** Record yourself on your phone during practice. Watch it back. You'll notice things you didn't realize (body language, filler words, pacing issues).

---

### "What if the AI generates questions I can't answer?"

**Answer:**
**This is actually valuable feedback! Here's what it means and what to do:**

**Why This Happens:**

**1. Experience Gap:**
You haven't faced that situation in your career yet.

**What to Do:**
- If entry-level: Use school projects, internships, volunteer work
- If career changer: Find transferable experiences
- If experience gap: Be honest about it, explain how you'd approach it

**2. You Have the Experience But Didn't Think of It:**
Sometimes we forget our own accomplishments.

**What to Do:**
- Review old performance reviews
- Think through major projects chronologically
- Ask former colleagues about team wins
- Check old emails or project docs

**3. The Question is Above Your Level:**
You might be applying for a role that's a stretch.

**What to Do:**
- Be honest about experience level
- Show willingness to learn
- Discuss how you'd approach similar situations at smaller scale
- Demonstrate learning agility

**4. The Job Isn't a Good Fit:**
If you genuinely can't answer 50%+ of the questions, you might not be ready for this role.

**What to Do:**
- Consider if this is the right opportunity
- Look for jobs at appropriate level
- Gain more experience in current role first
- Target less senior positions

**Remember:** It's better to discover this during practice than during the actual interview!

---

### "The transcript doesn't match what I said. Is the tool broken?"

**Answer:**
**Whisper is 95%+ accurate with clear audio, so if transcript is wrong, it's usually an audio quality issue. Here's how to fix:**

**Common Transcription Errors:**

**1. Technical Jargon Misheard:**
"I implemented Kubernetes" → transcribed as "I implemented communities"

**Solution:**
- Speak technical terms slowly and clearly
- Spell them out first time: "I used K-U-B-E-R-N-E-T-E-S, Kubernetes"
- Use full terms instead of abbreviations when possible

**2. Filler Words Amplified:**
You said "um" twice, transcript shows it 10 times

**Solution:**
- This is actually GOOD feedback - you use more filler words than you realize
- Practice reducing "um," "uh," "like," "you know"
- Pause silently instead of filling space

**3. Mumbled Endings Missing:**
"I increased revenue by..." (trails off) → transcript ends abruptly

**Solution:**
- Finish your sentences completely
- Don't trail off or drop volume at end
- Maintain energy through final word

**4. Background Noise Interference:**
Dog barking, phone ringing, etc. disrupts transcription

**Solution:**
- Practice in quieter space
- Turn off notifications
- Close windows
- Use better microphone

**Pro Tip:** If transcript is 80%+ accurate, focus on improving the content of your answer, not the transcription. If transcript is below 80% accurate, focus on audio setup.

---

### "How should I use the feedback I receive?"

**Answer:**
**AI feedback is incredibly valuable, but use it strategically. Here's how:**

**The Feedback Review Process:**

**Step 1: Read Strengths First (Don't Skip This!)**
- Note what you're already doing well
- Reinforce these in future attempts
- Build confidence from positives
- These are your foundation

**Step 2: Identify Top 3 Improvements**
- Feedback might list 5-10 items
- You can't fix everything at once
- Pick top 3 most impactful suggestions
- Focus on those in next attempt

**Step 3: Categorize Improvements**

**Content Issues:**
- Missing information
- Vague statements
- No results mentioned
- Off-topic rambling

**Fix:** Add specific details, quantify results, stay focused

**Structure Issues:**
- No clear framework (SOAR)
- Jumps around chronologically
- Doesn't answer the question directly

**Fix:** Use SOAR method, create logical flow, start with direct answer

**Delivery Issues:**
- Too fast or too slow
- Too long or too short
- Monotone
- Filler words

**Fix:** Practice pacing, time yourself, vary tone, pause instead of "um"

**Step 4: Practice One Category at a Time**

**Attempt 1:** Fix content
**Attempt 2:** Fix structure
**Attempt 3:** Fix delivery
**Attempt 4:** Put it all together

**Step 5: Compare Feedback Across Attempts**
- Is AI noting improvement?
- Are same issues appearing?
- What's your progress?

**Pro Tip:** Keep a practice journal. Write down feedback and track improvement over time. You'll see patterns and build confidence.

---

### "Should I memorize my answer word-for-word?"

**Answer:**
**Absolutely not! Here's the right approach:**

**Why Word-for-Word Memorization Backfires:**

**In Practice:**
- Sounds robotic and rehearsed
- Interviewers can tell immediately
- If you forget a word, you panic
- No flexibility for follow-up questions

**What Happens in Real Interviews:**
- Interviewer asks slight variation of question
- Your memorized script doesn't fit
- You freeze or awkwardly force your answer
- Red flag for interviewer

**The Right Approach: Story Beats**

**What to Memorize:**
- The core story/situation
- The main obstacle
- 2-3 key actions you took
- The quantified results
- One sentence opening
- One sentence closing

**What NOT to Memorize:**
- Exact wording
- Specific transitions
- Every single detail
- The precise order of minor points

**Practice Method:**

**Round 1:** Fully outline your answer
**Round 2:** Practice hitting all the story beats
**Round 3:** Tell it slightly different each time
**Round 4:** Comfortable with flexible delivery

**Goal:** You should be able to tell the same story three different ways, adapting to:
- Different time limits
- Different interviewer styles  
- Different follow-up questions
- Different levels of detail needed

**Test Yourself:**
If you can't tell your story without your notes after 3 practice sessions, you're either:
1. Over-complicating the story
2. Trying to memorize too much detail
3. Not practicing enough

**Remember:** Interviewers want to see how you THINK, not how well you memorize.

---

### "Can I upload the same job description and practice multiple times?"

**Answer:**
**Yes, but strategically. Here's how:**

**What Counts Toward Session Limit:**
- Uploading a NEW job description = New session
- Uploading the SAME job description again = New session (system doesn't recognize duplicates)

**Smart Strategy:**

**If You Want to Practice the Same Job Multiple Times:**

**Option 1: Keep the Session Open**
- Generate questions once
- Practice all questions multiple times in same session
- Don't close the browser or session
- Record → Get feedback → Re-record → Repeat

**Option 2: Save Questions in Interview Oracle Pro**
- Use IG Interview Coach for voice feedback
- Use Interview Oracle Pro for unlimited written practice of same questions
- Return to IG Interview Coach periodically for delivery check

**Option 3: Create Notes**
- After first session, copy all questions
- Practice separately with phone recording
- Return to IG Interview Coach when you want AI feedback again

**Best Practice:**
Use your 20 sessions strategically:
- Real jobs you're actively interviewing for
- Most important opportunities
- When you genuinely need AI feedback (not just practicing same answer for 5th time)

**Pro Tip:** Think of IG Interview Coach sessions as "professional coaching sessions" - use them when you need expert feedback, not for every single practice run.

---

## 6. BEST PRACTICES FOR USING THE TOOL

### Pre-Practice Preparation

**Before You Start Recording:**

**Step 1: Content Prep (30 minutes)**
- Use Interview Oracle Pro to generate answers
- Outline your SOAR stories for each question
- Gather your quantified achievements
- Note the key points you must hit

**Step 2: Environment Setup (10 minutes)**
- Find quiet practice space
- Test microphone
- Close all distracting apps
- Set up recording area
- Put phone on silent

**Step 3: Mindset Prep (5 minutes)**
- Remind yourself this is practice, not performance
- Accept that first attempts will be rough
- Commit to learning, not perfecting
- Take deep breath and relax

---

### Effective Practice Session Structure

**The 60-Minute Practice Session:**

**Minutes 0-10: Warm-Up**
- Generate questions from job description
- Review all questions quickly
- Choose 2-3 priority questions
- Do vocal warm-ups (seriously - speak out loud first)

**Minutes 10-40: Practice Recording**
For each priority question:
- First recording (5 min)
- Review feedback (3 min)
- Second recording (4 min)
- Compare feedback (3 min)

**Minutes 40-50: Refinement**
- Third attempt at hardest question
- Focus on incorporating all feedback
- Aim for your best version

**Minutes 50-60: Review & Plan**
- Note biggest improvements
- Identify remaining challenges
- Plan next practice focus
- Save key insights

---

### Progressive Practice Strategy

**Week 1: Content Mastery**
Focus: Getting stories straight

- Generate all questions
- Outline complete SOAR answers
- Practice content without timing
- Ensure all examples are clear
- Don't worry about delivery yet

**Week 2: Structure Practice**
Focus: Framework and flow

- Apply SOAR to every behavioral question
- Practice logical progression
- Work on transitions
- Ensure you're answering the question asked
- Start timing yourself loosely

**Week 3: Delivery Refinement**
Focus: How you sound

- Record all answers via voice
- Get AI feedback
- Work on pacing
- Reduce filler words
- Aim for 1.5-2 minutes per answer

**Week 4: Interview Simulation**
Focus: Realistic conditions

- Random question order
- No notes
- Time pressure
- Back-to-back questions
- Full interview simulation

---

### Feedback Integration Process

**After Each Recording:**

**Immediate Actions (5 minutes):**
1. Read feedback completely
2. Note top 3 improvements suggested
3. Decide which to tackle in next attempt

**Between Attempts (10 minutes):**
1. Revise your outline based on feedback
2. Add missing elements
3. Practice new structure out loud (not recorded)
4. Ready for next recording

**After Session (15 minutes):**
1. Summarize key learnings
2. Update your master answer docs
3. Note patterns across multiple questions
4. Plan focus for next session

---

## 7. ADVANCED STRATEGIES

### The "Comparison Recording" Method

**Concept:** Record the same answer multiple times, then compare feedback to see progress.

**How to Execute:**

**Recording 1 - Baseline (Day 1)**
- Record without extensive prep
- Natural, unpolished attempt
- Note feedback received

**Recording 2 - Revised (Day 3)**
- Incorporate all major feedback
- Add missing elements
- Improve structure

**Recording 3 - Polished (Day 5)**
- Focus on delivery
- Natural and confident
- Final version

**The Analysis:**
Compare all three feedback responses:
- What consistently appears as strengths?
- What issues were resolved?
- What still needs work?
- How has score/quality improved?

**Why This Works:**
- Shows clear progress
- Builds confidence
- Identifies persistent weaknesses
- Motivates continued practice

---

### The "Question Clustering" Technique

**Concept:** Practice similar questions together to build versatility.

**How to Organize:**

**Cluster 1: Teamwork Questions**
- "Tell me about a time you worked on a team"
- "Describe a conflict with a coworker"
- "How do you handle difficult team members?"

**Practice Strategy:**
- Use same core story
- Emphasize different aspects for each question
- Build flexibility in telling same story

**Cluster 2: Leadership Questions**
- "Tell me about a time you led a project"
- "Describe your leadership style"
- "Tell me about motivating a team"

**Cluster 3: Problem-Solving Questions**
- "Tell me about a challenge you overcame"
- "Describe a time you solved a complex problem"
- "Tell me about a time you had to think outside the box"

**The Benefit:**
- Prepare fewer total stories
- Get really good at your core stories
- Can flex same story to answer multiple questions

---

### The "Speed Variation" Method

**Concept:** Practice same answer at different speeds to find optimal pacing.

**Three Speeds:**

**Slow (2.5-3 minutes):**
- Include all details
- Full explanations
- No time pressure
- Identify what can be cut

**Target (1.5-2 minutes):**
- Streamlined version
- Key points only
- Still complete
- Ideal length

**Fast (45-60 seconds):**
- Bare essentials
- For phone screens
- Super concise
- Emergency backup

**Practice Each:**
Record all three versions, then you'll be ready for:
- Interviewer who wants detail (use slow)
- Standard interview (use target)
- Rushed interviewer (use fast)

---

### The "Feedback Pattern Analysis" Strategy

**Concept:** Track feedback across multiple questions to identify your personal patterns.

**Create a Feedback Log:**

**Question 1 Feedback:**
- Strengths: Specific examples, good structure
- Weaknesses: Didn't mention results, too long

**Question 2 Feedback:**
- Strengths: Clear opening, confident tone
- Weaknesses: Didn't mention results, vague actions

**Question 3 Feedback:**
- Strengths: Strong story, engaging
- Weaknesses: Didn't mention results, rushed ending

**Pattern Identified:**
Across all questions: Not mentioning results!

**Action Plan:**
Focus ALL practice on adding quantified results to every story.

**Why This Works:**
- Identifies your specific weaknesses
- Shows what to prioritize
- Prevents wasting time on areas you're already strong
- Creates personalized improvement plan

---

## 8. TECHNICAL TROUBLESHOOTING

### Audio Quality Issues

**Problem: Transcript has lots of [inaudible] markers**

**Solutions:**
1. Move closer to microphone (6-12 inches ideal)
2. Eliminate background noise
3. Speak slightly louder
4. Enunciate more clearly
5. Use external microphone instead of built-in

---

**Problem: Transcript cuts off words at end of sentences**

**Solution:**
- Don't drop volume at end of sentences
- Maintain energy through final word
- Speak facing microphone throughout

---

**Problem: Echo or reverb in recording**

**Solutions:**
1. Practice in smaller room
2. Add soft materials (blankets, curtains, carpet)
3. Avoid bathrooms or empty rooms
4. Use closet (clothes dampen sound)

---

### Session and Access Issues

**Problem: "Rate limit reached" error**

**What It Means:**
You've used all 20 sessions in the past 24 hours.

**Solutions:**
1. Wait for your oldest session to expire (check error message for time)
2. Use Interview Oracle Pro in the meantime
3. Plan sessions more strategically going forward
4. Practice with phone recording until sessions refresh

---

**Problem: Questions aren't generating**

**Possible Causes:**
1. Job description too short or vague
2. File upload failed
3. Network timeout
4. API error

**Solutions:**
1. Ensure job description is at least 200 words
2. Try pasting text instead of uploading file
3. Check internet connection
4. Refresh page and try again
5. Try different browser

---

**Problem: Can't hear playback of recording**

**Solutions:**
1. Check device volume
2. Check browser audio settings
3. Try different browser
4. Verify browser can access audio output

---

### Browser and Permission Issues

**Problem: Microphone access denied**

**Solutions:**

**Chrome:**
1. Click lock icon in address bar
2. Find microphone permissions
3. Change to "Allow"
4. Refresh page

**Firefox:**
1. Click shield icon in address bar
2. Disable blocking
3. Refresh page

**Safari:**
1. Safari → Preferences → Websites → Microphone
2. Find the site and allow access

---

## 9. INTEGRATION WITH OTHER IG NETWORK TOOLS

### Interview Oracle Pro + IG Interview Coach

**The Perfect Combo:**

**Phase 1: Use Interview Oracle Pro**
- Generate 12-15 questions
- Create written SOAR answers
- Save all answers
- Memorize story beats

**Phase 2: Switch to IG Interview Coach**
- Upload same job description
- Practice speaking your answers
- Get feedback on delivery
- Refine based on voice-specific feedback

**Why Both:**
- Oracle gives you content
- Coach gives you delivery feedback
- Together = complete preparation

---

### Resume Analyzer Pro + IG Interview Coach

**The Connection:**
Your interview answers should align with your resume.

**Strategy:**
1. Optimize resume in Resume Analyzer Pro
2. Note your top quantified achievements
3. Use those SAME numbers in interview answers
4. Practice consistency in IG Interview Coach

**Why:**
Interviewers often ask "Walk me through your resume"
Having practiced speaking about your resume achievements makes this smooth.

---

### Cover Letter Generator Pro + IG Interview Coach

**The Connection:**
Cover letter claims = interview talking points.

**Strategy:**
1. Note the 2-3 main achievements in your cover letter
2. Practice talking about those in IG Interview Coach
3. Ensure you can expand on everything you wrote

---

### Hidden Job Boards + IG Interview Coach

**The Connection:**
Niche boards = less competition = higher interview rate

**Strategy:**
When you get interview from specialized board:
1. Emphasize niche expertise
2. Practice industry-specific terminology
3. Reference specialized knowledge
4. Show you're an insider, not generic candidate

---

### IG Insider Briefs + IG Interview Coach

**The Connection:**
Market intelligence informs interview answers.

**Strategy:**
- Read current Insider Briefs before practicing
- Incorporate recent data into answers
- Show awareness of industry trends
- Demonstrate you're informed and current

---

## 10. COMMON MISCONCEPTIONS

### ❌ "I need perfect transcription to get good feedback"
**Reality:** AI feedback focuses on content and structure, not transcription perfection. 80%+ accuracy is fine.

### ❌ "More practice sessions = better results"
**Reality:** Quality over quantity. 3 focused sessions with deep feedback integration beats 10 rushed sessions.

### ❌ "I should sound exactly like the AI suggests"
**Reality:** Use AI suggestions but keep your authentic voice. Don't become robotic.

### ❌ "Voice practice isn't necessary if I know my content"
**Reality:** Knowing content and delivering it confidently are different skills. Practice both.

### ❌ "I can wing it with minimal practice"
**Reality:** Even strong candidates benefit from rehearsing delivery. Practice reveals filler words, pacing issues, and gaps.

### ❌ "Typing my answers is the same as speaking them"
**Reality:** Speaking engages different cognitive processes. You need to practice actual delivery.

---

## 11. SUCCESS METRICS TO TRACK

**Encourage members to track:**
- Practice sessions completed: ___
- Questions practiced: ___
- Average feedback improvement score: ___
- Filler words reduced: ___
- Timing consistency: ___
- Confidence level (1-10): ___

**Typical Results:**
- 5-7 focused practice sessions before interview
- 60% reduction in filler words after 3 sessions
- Timing improves from 3+ minutes to 1.5-2 minutes
- Confidence increases 40-50%
- Interview performance dramatically improved

---

## 12. KEY TALKING POINTS FOR AI ASSISTANT

When members ask about IG Interview Coach, emphasize:

✅ "Voice practice is crucial - it reveals issues typing doesn't catch"
✅ "Use 20 sessions strategically for your most important opportunities"
✅ "Practice same question multiple times - first attempt is never your best"
✅ "Work on one improvement category at a time (content, then structure, then delivery)"
✅ "Combine with Interview Oracle Pro for complete prep"
✅ "Aim for 1.5-2 minutes per answer - use timing feedback"
✅ "Focus on AI feedback patterns across questions"
✅ "Don't memorize word-for-word - know your story beats"

---

## 13. FINAL NOTES FOR AI ASSISTANT

**Voice & Tone:**
- Encouraging (speaking on camera is scary)
- Practical (give specific delivery tips)
- Patient (improvement takes time)
- Supportive (celebrate small wins)

**Always Remember:**
- Voice practice feels awkward at first - that's normal
- Technical issues happen - help troubleshoot calmly
- Feedback might feel harsh - frame it as growth opportunity
- Progress isn't linear - encourage persistence

**Never:**
- Make members feel bad about filler words or mistakes
- Suggest skipping voice practice
- Promise perfect interviews after one session
- Ignore technical troubleshooting needs

---

**This knowledge base should enable the AI assistant to provide expert, specific, and genuinely helpful guidance about IG Interview Coach to IG Network members.**
