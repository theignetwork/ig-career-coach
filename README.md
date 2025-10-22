# IG Career Coach API

Serverless API for the IG Career Coach chatbot system.

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy via GitHub (Recommended)

1. **Create a new GitHub repository:**
   ```bash
   # In this folder
   git init
   git add .
   git commit -m "Initial commit: IG Career Coach API"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to existing Netlify site:**
   - Go to: https://app.netlify.com/projects/ig-career-coach-api
   - Click "Set up a new deploy"
   - Choose "Import from Git"
   - Select your new repository
   - Netlify will auto-detect the configuration

3. **Set environment variables:**
   In Netlify Dashboard → Site Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_KEY` = your Supabase service key

4. **Deploy!**
   Netlify will automatically build and deploy your functions.

---

### Option 2: Deploy via Netlify CLI

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Login to Netlify:**
   ```bash
   netlify login
   ```

4. **Link to existing site:**
   ```bash
   netlify link
   # Choose: "Use current git remote origin"
   # Or choose the site manually: ig-career-coach-api
   ```

5. **Set environment variables:**
   ```bash
   # Option A: Via CLI
   netlify env:set ANTHROPIC_API_KEY "your-key-here"
   netlify env:set SUPABASE_URL "your-url-here"
   netlify env:set SUPABASE_SERVICE_KEY "your-key-here"

   # Option B: Via Netlify Dashboard
   # Go to Site Settings → Environment Variables
   ```

6. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

### Option 3: Manual Deploy (Drag & Drop)

1. **Build a zip file:**
   ```bash
   # Include everything except node_modules
   zip -r deploy.zip . -x "node_modules/*" ".git/*" "*.zip"
   ```

2. **Go to Netlify:**
   - https://app.netlify.com/projects/ig-career-coach-api
   - Drag the zip file to the deploy zone

3. **Set environment variables** (same as Option 1 step 3)

---

## 🧪 Testing Locally

1. **Create `.env` file:**
   ```bash
   ANTHROPIC_API_KEY=your-key-here
   SUPABASE_URL=your-url-here
   SUPABASE_SERVICE_KEY=your-key-here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run locally:**
   ```bash
   netlify dev
   ```

4. **Test endpoints:**
   ```bash
   # Test chat
   curl -X POST http://localhost:8888/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, can you help me with my resume?"}'

   # Test history (use sessionId from chat response)
   curl http://localhost:8888/api/conversation-history?sessionId=YOUR_SESSION_ID
   ```

---

## 📡 API Endpoints

### POST /api/chat
Send a message and get a response.

**Request:**
```json
{
  "message": "How do I improve my resume?",
  "sessionId": "optional-uuid-for-continuing-conversation",
  "context": "resume-analyzer-pro"
}
```

**Response:**
```json
{
  "message": "Here's how to improve your resume...",
  "sessionId": "uuid-to-continue-this-conversation",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Contexts:**
- `resume-analyzer-pro`
- `cover-letter-generator-pro`
- `hidden-job-boards-tool`
- `interview-oracle-pro`
- `ig-interview-coach`
- `ig-insider-briefs`
- `null` (for general/default)

---

### GET /api/conversation-history
Load conversation history.

**Request:**
```
GET /api/conversation-history?sessionId=your-session-id
```

**Response:**
```json
{
  "sessionId": "uuid",
  "context": "resume-analyzer-pro",
  "messages": [
    {
      "role": "user",
      "message": "How do I improve my resume?",
      "created_at": "2025-01-15T10:30:00.000Z"
    },
    {
      "role": "assistant",
      "message": "Here's how...",
      "created_at": "2025-01-15T10:30:05.000Z"
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:05.000Z"
}
```

---

## 🗄️ Database Setup Required

You need a Supabase database with these tables:

```sql
-- Run this SQL in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  context TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

---

## 🔐 Environment Variables

Required environment variables:

| Variable | Description | Where to get it |
|----------|-------------|----------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | https://console.anthropic.com |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | Supabase Dashboard → Settings → API |

---

## 📊 Monitoring

Once deployed, monitor your functions:
- **Netlify Dashboard:** https://app.netlify.com/projects/ig-career-coach-api/functions
- **Function Logs:** Click on any function to see recent invocations
- **Error Tracking:** Check the "Functions" tab for any errors

---

## 🐛 Troubleshooting

**"Function not found" error:**
- Check that functions are in `netlify/functions/` directory
- Verify `netlify.toml` is in root directory
- Try redeploying

**"Missing environment variable" error:**
- Verify all 3 env vars are set in Netlify Dashboard
- Check for typos in variable names
- Redeploy after setting variables

**Database errors:**
- Verify Supabase tables exist
- Check that you're using SERVICE_KEY (not anon key)
- Test database connection with Supabase dashboard

**CORS errors:**
- Functions include CORS headers by default
- If issues persist, check Netlify's CORS settings

---

## 🚀 Your Live URLs

Once deployed, your API will be available at:

- **Chat:** `https://ig-career-coach-api.netlify.app/api/chat`
- **History:** `https://ig-career-coach-api.netlify.app/api/conversation-history`

---

## 📝 Next Steps

1. ✅ Deploy this API
2. ✅ Test endpoints work
3. ✅ Build frontend ChatModal component
4. ✅ Connect frontend to these APIs
5. ✅ Add to your tool pages with context

---

## 💡 Tips

- **Start simple:** Test with basic messages first
- **Use contexts:** Pass context to get tool-specific help
- **Monitor usage:** Keep an eye on Anthropic API costs
- **Save sessionId:** Store in localStorage to persist conversations
- **Test locally first:** Always test with `netlify dev` before deploying

---

Need help? Check the logs in Netlify Dashboard or test locally first!
