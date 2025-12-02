# IG Career Coach - CRITICAL Security Vulnerabilities

**Date:** November 21, 2025
**Severity:** 🔴 **CRITICAL**
**Risk Level:** IMMEDIATE ACTION REQUIRED

---

## Executive Summary

IG Career Coach has **CRITICAL authentication vulnerabilities** that allow **ANY user to impersonate ANY other user** and access or modify their private data. This is a **complete authentication bypass** - there is NO server-side verification of user identity.

**Impact:**
- ❌ **Anyone can access any user's conversation history**
- ❌ **Anyone can modify any user's goals and progress**
- ❌ **Anyone can impersonate WordPress/MemberPress users**
- ❌ **No audit trail of actual user actions**
- ❌ **Violates user privacy and trust**

**CVSS Score:** 9.1 (Critical)

---

## 🔴 CRITICAL VULNERABILITY #1: Complete Authentication Bypass

### The Vulnerability

The application trusts a client-side `x-user-id` header with **ZERO server-side verification**.

**Attack Vector:**
1. Open browser DevTools
2. Change `x-user-id` header to any value
3. Access/modify that user's data
4. Server accepts it without question

### Proof of Concept

**Current Flow (INSECURE):**
```
┌─────────────────┐
│   User Browser  │ Anyone can modify this!
│  x-user-id: 123 │ ←── Client-side only
└────────┬────────┘
         │ HTTP POST
         │ Headers: { 'x-user-id': '123' }
         ▼
┌─────────────────┐
│ Netlify Function│ Trusts the header blindly
│  chat.js:553    │ ←── NO VERIFICATION!
│                 │
│ const userId =  │
│   event.headers │
│   ['x-user-id'] │
└────────┬────────┘
         │ Uses userId to:
         ▼
┌─────────────────┐
│   Supabase DB   │ Saves data for user 123
│ - Messages      │ (could be ANYONE!)
│ - Goals         │
│ - History       │
└─────────────────┘
```

**How to Attack (5 seconds):**
```javascript
// In browser console:
// Change user ID to impersonate user 42
fetch('https://ig-career-coach.netlify.app/.netlify/functions/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': '42'  // <-- BOOM! Now I'm user 42
  },
  body: JSON.stringify({
    message: 'Show me my conversation history',
    conversationId: null
  })
});
// Server responds with user 42's private data
```

### Code Evidence

**Client: `dist/chat-loader.js:184`**
```javascript
// User ID obtained CLIENT-SIDE (untrusted)
const userId = await getWordPressUserId();

// Stored in global variable (anyone can change it)
window.__IG_CAREER_COACH_USER_ID__ = userId;
```

**Client: `src/hooks/useChat.ts:196-202`**
```javascript
// Get userId from window (untrusted)
const userId = (window as any).__IG_CAREER_COACH_USER_ID__ || null;

const response = await fetch('/.netlify/functions/chat', {
  headers: {
    'x-user-id': userId || 'anonymous',  // ← Anyone can forge this
  }
});
```

**Server: `netlify/functions/chat.js:550-553`**
```javascript
const { message, sessionId, context: toolContext, userId: bodyUserId } = JSON.parse(event.body);

// ❌ CRITICAL: Trusts client-provided userId with NO verification
const userId = event.headers['x-user-id'] || bodyUserId || 'anonymous';

// userId is now used to save/retrieve data for "this user"
```

**Server: `netlify/functions/conversation-history.js:35`**
```javascript
// ❌ CRITICAL: Same vulnerability
const userId = event.headers['x-user-id'] || event.queryStringParameters?.userId || 'anonymous';
```

### Why the "Security Check" Doesn't Work

The conversation-history function has this code:
```javascript
// netlify/functions/conversation-history.js:66-77
// SECURITY: Verify ownership - conversation must belong to current user
if (conversation.user_id !== userId) {
  console.error('🚨 SECURITY: User', userId, 'attempted to access...');
  return { statusCode: 403, ... };
}
```

**This is USELESS because:**
- `userId` comes from untrusted `x-user-id` header
- Attacker just sends matching user ID: `x-user-id: 123`
- Server compares: `123 === 123` ✅ "Access granted!"
- **Complete bypass**

---

## 🔴 CRITICAL VULNERABILITY #2: No JWT Verification

### The Vulnerability

Unlike other tools in The IG Network, IG Career Coach has **NO WordPress JWT verification**.

**Comparison:**

| Tool | JWT Verification | WordPress Auth | Secure |
|------|-----------------|----------------|--------|
| Resume Analyzer Pro | ✅ Yes | ✅ Yes | ✅ Yes |
| Cover Letter Generator | ✅ Yes | ✅ Yes | ✅ Yes |
| Career Hub | ✅ Yes | ✅ Yes | ✅ Yes |
| IG Interview Coach | ✅ Yes | ✅ Yes | ✅ Yes |
| **IG Career Coach** | ❌ **NO** | ❌ **NO** | ❌ **NO** |

### What Should Happen

**Secure Flow (like other tools):**
```
1. User logs into WordPress → JWT generated
2. WordPress embeds tool with ?context=<JWT>
3. Client sends JWT to server
4. SERVER VERIFIES JWT with JWT_SECRET
5. Server extracts user_id from VERIFIED token
6. Server uses verified user_id for data operations
```

**Current Flow (INSECURE):**
```
1. User maybe logs into WordPress
2. Client tries to find user ID from window variables
3. Client sends unverified user ID to server
4. Server TRUSTS IT BLINDLY
5. Attacker sends any user ID they want
6. Server uses fake user_id for data operations
```

---

## 🟡 MEDIUM VULNERABILITY: Weak User ID Detection

### The Vulnerability

The chat-loader.js tries 8 different methods to find a WordPress user ID:

```javascript
// dist/chat-loader.js:75-177
if (window.wpUserId) return String(window.wpUserId);
if (window.mepr_user && window.mepr_user.id) return window.mepr_user.id;
if (window.current_user_id) return window.current_user_id;
if (window.wpUserData && window.wpUserData.id) return window.wpUserData.id;
// ... 4 more methods
// Finally: Generate random UUID if all fail
```

**Problems:**
1. **All client-side** - can be manipulated in DevTools
2. **Inconsistent** - different WordPress setups expose different variables
3. **Fallback to UUID** - creates "anonymous" users with persistent IDs
4. **No verification** - server never checks if the user actually owns this ID

---

## 📊 DATA AT RISK

Based on code analysis, the following user data is accessible/modifiable:

### From `chat.js`:
- ✅ **Conversation History** - All messages between user and AI
- ✅ **Goals** - Career goals set by users (`saveGoal()`)
- ✅ **Progress** - Progress reports on goals (`saveProgress()`)
- ✅ **RAG Context** - Retrieved knowledge base articles
- ✅ **Tool Recommendations** - Which IG Network tools were recommended
- ✅ **Session Metadata** - Timestamps, contexts, session IDs

### Database Tables Affected:
```sql
conversations (user_id, context, created_at, updated_at)
messages (conversation_id, role, message, context, metadata)
chat_history (user_id, message, response, tool_recommendations)
goals (user_id, goal_text, deadline, status)
goal_progress (goal_id, user_id, progress_count, ...)
```

---

## 🎯 ATTACK SCENARIOS

### Scenario 1: Steal User Conversations

**Attacker Goal:** Read private career coaching conversations

**Steps:**
1. Guess or enumerate WordPress user IDs (often sequential: 1, 2, 3...)
2. For each ID, send chat request with `x-user-id: <ID>`
3. Extract conversation history from responses
4. Compile database of all users' private conversations

**Impact:** Complete privacy breach, GDPR violation

### Scenario 2: Sabotage User Goals

**Attacker Goal:** Mess with users' career goals

**Steps:**
1. Send chat message setting fake goals for victim: `x-user-id: 42`
2. Mark real goals as completed when they're not
3. User loses track of actual progress

**Impact:** Data integrity loss, user frustration

### Scenario 3: Impersonate Premium Members

**Attacker Goal:** Access premium features as free user

**Steps:**
1. Find premium MemberPress user ID
2. Set `x-user-id` to premium user's ID
3. Access all premium coaching features

**Impact:** Revenue loss, membership system bypass

### Scenario 4: Mass Data Exfiltration

**Attacker Goal:** Scrape entire database

**Steps:**
1. Script automated requests: `for (let i = 1; i <= 10000; i++) { fetch(..., 'x-user-id': i) }`
2. Download all conversations, goals, and history
3. Sell data or use for competitive intelligence

**Impact:** Complete database breach, legal liability

---

## 🔒 REQUIRED FIXES

### Priority 1: IMMEDIATE (Deploy Today)

**1. Implement WordPress JWT Authentication**

Add JWT verification to ALL Netlify Functions:

**Create `netlify/functions/lib/auth.js`:**
```javascript
import { jwtVerify } from 'jose';

export async function getUserFromRequest(event) {
  try {
    // Get token from Authorization header
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('[Auth] No token in Authorization header');
      return null;
    }

    // Verify JWT with server-side secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth] JWT_SECRET not configured');
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    console.log(`[Auth] Verified user ${payload.user_id}`);
    return payload;

  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}
```

**Update `chat.js`:**
```javascript
import { getUserFromRequest } from './lib/auth.js';

export const handler = async (event, context) => {
  // ... CORS handling ...

  try {
    // ✅ SECURE: Verify JWT and extract user ID
    const user = await getUserFromRequest(event);

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Please log in' })
      };
    }

    const userId = user.user_id;  // From VERIFIED token

    // Now userId is trustworthy!
    // ... rest of function ...
```

**Update `conversation-history.js`:**
```javascript
import { getUserFromRequest } from './lib/auth.js';

export const handler = async (event, context) => {
  // ... OPTIONS handling ...

  try {
    // ✅ SECURE: Verify JWT
    const user = await getUserFromRequest(event);

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const userId = user.user_id;

    // ... rest of function ...
```

**2. Update Client to Send JWT**

**Update `src/hooks/useChat.ts`:**
```typescript
const sendMessage = async (content: string) => {
  // Get JWT token from window (set by WordPress)
  const authToken = (window as any).__IG_CAREER_COACH_JWT__ ||
                    sessionStorage.getItem('auth_token');

  if (!authToken) {
    console.error('No auth token available');
    throw new Error('Authentication required');
  }

  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,  // ✅ Send JWT
    },
    body: JSON.stringify({
      message: content,
      conversationId,
      toolContext
    })
  });
```

**Update `dist/chat-loader.js`:**
```javascript
// Instead of passing user ID, pass JWT token
function getWordPressJWT() {
  // Get JWT from WordPress embed URL: ?context=<JWT>
  const urlParams = new URLSearchParams(window.location.search);
  const jwt = urlParams.get('context');

  if (jwt) {
    sessionStorage.setItem('auth_token', jwt);
    return jwt;
  }

  return sessionStorage.getItem('auth_token');
}

async function initializeChat() {
  const jwt = getWordPressJWT();

  // Store JWT globally for app to access
  window.__IG_CAREER_COACH_JWT__ = jwt;

  await loadChat();
}
```

**3. Add Dependencies**

```bash
cd /c/Users/13236/ig-career-coach
npm install jose
```

Update `package.json`:
```json
{
  "dependencies": {
    "jose": "^5.9.6"
  }
}
```

**4. Environment Variables**

Add to Netlify:
```env
JWT_SECRET=ea028b3abe0fbb157ac3b12e1247666bb46febd1b17dbd5001253d43289bb9db
```

(Same JWT_SECRET used by other IG Network tools)

---

### Priority 2: HIGH (This Week)

**1. Add Rate Limiting**

Install Upstash Redis for persistent rate limiting (like Resume Analyzer Pro):
```bash
npm install @upstash/ratelimit @upstash/redis
```

**2. Add Audit Logging**

Log all authentication attempts and data access:
```javascript
console.log(`[AUDIT] User ${user.user_id} accessed conversation ${sessionId}`);
```

**3. Remove x-user-id Header**

Delete all references to `x-user-id` header from codebase.

---

### Priority 3: MEDIUM (Next Sprint)

**1. Add CORS Restrictions**

Update CORS to only allow requests from WordPress:
```javascript
const allowedOrigins = [
  'https://members.theinterviewguys.com',
  'https://theinterviewguys.com'
];

const origin = event.headers.origin;
const headers = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  // ...
};
```

**2. Implement Session Tokens**

Add short-lived session tokens on top of JWT for additional security.

**3. Add Data Encryption**

Encrypt sensitive data (goals, messages) in database.

---

## 🔥 IMMEDIATE MITIGATION (Before Fix Deploy)

If you can't deploy the fix immediately:

**1. Disable the tool:**
- Remove chat-loader.js script from WordPress
- Show maintenance message

**2. Monitor database:**
```sql
-- Check for suspicious activity
SELECT user_id, COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 100;
```

**3. Alert users:**
- Email members about potential data exposure
- Offer password reset

---

## 📋 SECURITY CHECKLIST

After implementing fixes:

- [ ] JWT secret in environment variables (server-only)
- [ ] All Netlify Functions use `getUserFromRequest()`
- [ ] Client sends JWT in `Authorization: Bearer <token>` header
- [ ] No references to `x-user-id` header remain
- [ ] `jose` package installed
- [ ] Build succeeds with no errors
- [ ] Test: Try to access data with fake user ID → 401 Unauthorized
- [ ] Test: Try to access data with valid JWT → Success
- [ ] Test: Try to access another user's data → 403 Forbidden
- [ ] Rate limiting implemented
- [ ] Audit logging active
- [ ] CORS properly restricted

---

## 🔗 COMPARISON WITH OTHER TOOLS

All other IG Network tools have proper authentication:

**Resume Analyzer Pro:**
- ✅ WordPress JWT verification
- ✅ Server-side user ID extraction
- ✅ Ownership checks with verified user ID
- ✅ Rate limiting with Upstash
- ✅ No client-side user ID trust

**Cover Letter Generator:**
- ✅ WordPress JWT verification
- ✅ Server-side authentication
- ✅ Authorization header required
- ✅ Rate limiting implemented

**Career Hub:**
- ✅ WordPress JWT verification
- ✅ Token re-verification
- ✅ Data bleeding protection
- ✅ SessionStorage security

**IG Interview Coach:**
- ✅ WordPress JWT verification
- ✅ Server-side JWT verification endpoint
- ✅ Automatic auth header injection
- ✅ Build passing with security fixes

**IG Career Coach:**
- ❌ **NO JWT verification**
- ❌ **Trusts client-provided user ID**
- ❌ **Complete authentication bypass**
- ❌ **CRITICAL vulnerabilities**

---

## 📞 ACTION REQUIRED

**Immediate Steps:**
1. Read this entire report
2. Understand the severity (CRITICAL)
3. Decide: Deploy fix or disable tool?
4. If deploying: I can implement all fixes right now
5. If disabling: Remove from WordPress immediately

**This is NOT a minor issue. Every user's private data is at risk.**

---

**Report Generated:** November 21, 2025
**Security Auditor:** Claude Code
**Next Review:** After implementing fixes
**Estimated Fix Time:** 2-3 hours
