import { useState, useEffect } from 'react';
import type { Message, ChatResponse } from '../types/chat';

// Helper function to determine if query is specific enough for sources
function isSpecificQuestion(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Don't show sources for these patterns
  const genericPatterns = [
    "i'm new here",
    "im new here",
    "show me around",
    "help me",
    "i need help",
    "get started",
    "what can you do",
    "hello",
    "hi there",
    "hey",
    "thanks",
    "thank you",
  ];
  
  // Check if query matches generic patterns
  for (const pattern of genericPatterns) {
    if (lowerQuery.includes(pattern)) {
      return false;
    }
  }
  
  // Show sources if query contains specific indicators
  const specificIndicators = [
    "what is",
    "how do i",
    "how to",
    "explain",
    "tell me about",
    "what are",
    "when should",
    "why",
    "difference between",
    "best practices",
    "tips for",
    "guide",
    "negotiate",
    "soar method",
    "star method",
    "ats",
    "resume",
    "cover letter",
    "interview",
  ];
  
  for (const indicator of specificIndicators) {
    if (lowerQuery.includes(indicator)) {
      return true;
    }
  }
  
  // Default: don't show sources unless query is 5+ words (likely specific)
  return query.split(' ').length >= 5;
}

function getWelcomeBackMessage(lastTool: string | null, days: number): string {
  const greeting = days > 7
    ? "Welcome back! It's been a while. 👋"
    : "Hey there! Good to see you again. 😊";

  switch (lastTool) {
    case 'resume-analyzer':
      return `${greeting} Last time we were working on your resume. Ready to continue optimizing it, or want to move on to cover letters?`;
    case 'interview-oracle':
      return `${greeting} Last time you were prepping for interviews. How did it go? Want to practice more, or shall we move to another area?`;
    case 'cover-letter-generator':
      return `${greeting} You were working on cover letters last time. Need more help with those, or ready to start your job search?`;
    default:
      return `${greeting} What would you like to work on today?`;
  }
}

export function useChat(toolContext: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [testimonialAsked, setTestimonialAsked] = useState(false);
  const [showTestimonialPrompt, setShowTestimonialPrompt] = useState(false);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ig-career-coach-conversation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMessages(data.messages || []);
        setConversationId(data.conversationId || null);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    }
  }, []);

  // Load testimonial status
  useEffect(() => {
    const asked = localStorage.getItem('ig-testimonial-asked');
    setTestimonialAsked(asked === 'true');
  }, []);

  // Check for return prompts (welcome back message)
  useEffect(() => {
    const lastVisit = localStorage.getItem('ig-last-visit');
    const now = Date.now();

    if (lastVisit) {
      const daysSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);

      if (daysSince >= 3 && messages.length === 0) {
        // Show welcome back message
        const lastTool = localStorage.getItem('ig-last-tool');
        const welcomeMessage = getWelcomeBackMessage(lastTool, daysSince);

        // Add as first "assistant" message
        setMessages([{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      }
    }

    // Update last visit
    localStorage.setItem('ig-last-visit', now.toString());
  }, []);

  // Track last tool used
  useEffect(() => {
    if (toolContext) {
      localStorage.setItem('ig-last-tool', toolContext);
    }
  }, [toolContext]);

  // Check if we should ask for testimonial
  useEffect(() => {
    // Don't ask if already asked
    if (testimonialAsked) return;

    // Don't ask if no messages yet
    if (messages.length < 10) return;

    // Check if last message shows positive sentiment
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== 'user') return;

    const positiveKeywords = [
      'thanks', 'thank you', 'helpful', 'helped', 'great',
      'perfect', 'awesome', 'excellent', 'amazing', 'love it',
      'exactly what i needed', 'this is great', 'appreciate'
    ];

    const hasPositiveSentiment = positiveKeywords.some(keyword =>
      lastMessage.content.toLowerCase().includes(keyword)
    );

    if (hasPositiveSentiment && messages.length >= 10) {
      // Wait 2 seconds after their message, then show prompt
      setTimeout(() => {
        setShowTestimonialPrompt(true);
      }, 2000);
    }
  }, [messages, testimonialAsked]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0 || conversationId) {
      localStorage.setItem('ig-career-coach-conversation', JSON.stringify({
        messages,
        conversationId
      }));
    }
  }, [messages, conversationId]);

  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId: conversationId,
          context: toolContext,
          userId: 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      const data = await response.json();

      // Determine if sources should be shown
      const shouldShowSources = isSpecificQuestion(content);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        sources: data.relatedArticles?.map((article: any) => ({
          title: article.title,
          url: article.url
        })),
        showSources: shouldShowSources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.sessionId);

    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to clear messages and return to welcome screen
  const clearMessages = () => {
    setMessages([]);
    // Keep conversationId to continue the same conversation
  };

  // Function to handle testimonial response
  const handleTestimonialResponse = (response: 'yes' | 'later' | 'no') => {
    setShowTestimonialPrompt(false);

    if (response === 'yes') {
      // Open testimonial form - replace with your actual URL
      window.open('https://forms.gle/your-testimonial-form', '_blank');
      localStorage.setItem('ig-testimonial-asked', 'true');
      setTestimonialAsked(true);
    } else if (response === 'no') {
      // Don't ask again
      localStorage.setItem('ig-testimonial-asked', 'true');
      setTestimonialAsked(true);
    }
    // If 'later', don't mark as asked - they might say yes next time
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    showTestimonialPrompt,
    handleTestimonialResponse
  };
}
