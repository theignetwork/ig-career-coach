import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function saveToHistory(userId, userMessage, assistantMessage, toolContext = 'general', toolsRecommended = []) {
  try {
    // Save user message
    await supabase.from('chat_history').insert({
      user_id: userId,
      message: userMessage,
      role: 'user',
      tool_context: toolContext
    });

    // Save assistant message with tools recommended
    await supabase.from('chat_history').insert({
      user_id: userId,
      message: assistantMessage,
      role: 'assistant',
      tool_context: toolContext,
      tools_recommended: toolsRecommended.length > 0 ? toolsRecommended : null
    });

    console.log('Chat history saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save chat history:', error);
    return false; // Don't throw, just log and return false
  }
}
