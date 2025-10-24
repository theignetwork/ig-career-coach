import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Detect if user is setting a goal
 */
export function isSettingGoal(message) {
  const goalIndicators = [
    'i want to',
    'i need to',
    'i\'m going to',
    'i\'ll',
    'remind me to',
    'set a goal',
    'my goal is',
    'i should',
    'i plan to',
    'help me stay accountable',
    'keep me on track'
  ];

  const messageLower = message.toLowerCase();

  // Must have a goal indicator AND a number
  const hasIndicator = goalIndicators.some(indicator => messageLower.includes(indicator));
  const hasNumber = /\d+/.test(message);

  return hasIndicator && hasNumber;
}

/**
 * Parse goal from user message
 */
export function parseGoal(message) {
  const messageLower = message.toLowerCase();

  // Extract number
  const numberMatch = message.match(/(\d+)/);
  const targetNumber = numberMatch ? parseInt(numberMatch[1]) : null;

  // Determine goal type based on keywords
  let goalType = 'general';
  if (messageLower.includes('appli') || messageLower.includes('apply')) {
    goalType = 'applications';
  } else if (messageLower.includes('network') || messageLower.includes('reach out') || messageLower.includes('connect')) {
    goalType = 'networking';
  } else if (messageLower.includes('follow up') || messageLower.includes('follow-up')) {
    goalType = 'follow_ups';
  } else if (messageLower.includes('interview')) {
    goalType = 'interviews';
  } else if (messageLower.includes('resume') || messageLower.includes('cv')) {
    goalType = 'resume_updates';
  }

  // Determine time period
  let targetPeriod = 'week'; // default
  if (messageLower.includes('today') || messageLower.includes('day')) {
    targetPeriod = 'day';
  } else if (messageLower.includes('week')) {
    targetPeriod = 'week';
  } else if (messageLower.includes('month')) {
    targetPeriod = 'month';
  }

  return {
    goalType,
    goalText: message.trim(),
    targetNumber,
    targetPeriod
  };
}

/**
 * Save a goal to the database
 */
export async function saveGoal(userId, goalData) {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: goalData.goalType,
        goal_text: goalData.goalText,
        target_number: goalData.targetNumber,
        target_period: goalData.targetPeriod,
        status: 'active',
        last_check_in: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving goal:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveGoal:', error);
    return null;
  }
}

/**
 * Get active goals for a user that need check-in
 */
export async function getGoalsNeedingCheckIn(userId) {
  try {
    // Get active goals that haven't been checked in the last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data, error } = await supabase
      .from('user_goals')
      .select(`
        *,
        goal_progress(progress_count, check_in_date)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`last_check_in.is.null,last_check_in.lt.${twoDaysAgo.toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1); // Only check in on one goal at a time

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGoalsNeedingCheckIn:', error);
    return [];
  }
}

/**
 * Detect if user is reporting progress
 */
export function isReportingProgress(message) {
  const progressIndicators = [
    'i\'ve applied',
    'i applied',
    'i\'ve done',
    'i did',
    'i completed',
    'i finished',
    'i sent',
    'i reached out',
    'i connected',
    'so far',
    'i\'ve gotten',
    'progress'
  ];

  const messageLower = message.toLowerCase();
  return progressIndicators.some(indicator => messageLower.includes(indicator));
}

/**
 * Parse progress from user message
 */
export function parseProgress(message) {
  // Extract number from message
  const numberMatch = message.match(/(\d+)/);
  const progressCount = numberMatch ? parseInt(numberMatch[1]) : null;

  return {
    progressCount,
    progressNote: message.trim()
  };
}

/**
 * Save progress update
 */
export async function saveProgress(userId, goalId, progressData) {
  try {
    // Save progress
    const { error: progressError } = await supabase
      .from('goal_progress')
      .insert({
        goal_id: goalId,
        user_id: userId,
        progress_count: progressData.progressCount,
        progress_note: progressData.progressNote
      });

    if (progressError) {
      console.error('Error saving progress:', progressError);
      return false;
    }

    // Update last check-in time on goal
    const { error: updateError } = await supabase
      .from('user_goals')
      .update({ last_check_in: new Date().toISOString() })
      .eq('id', goalId);

    if (updateError) {
      console.error('Error updating goal check-in:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Error in saveProgress:', error);
    return false;
  }
}

/**
 * Mark a goal as completed
 */
export async function completeGoal(goalId) {
  try {
    const { error } = await supabase
      .from('user_goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) {
      console.error('Error completing goal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in completeGoal:', error);
    return false;
  }
}

/**
 * Get all active goals for display
 */
export async function getActiveGoals(userId) {
  try {
    const { data, error } = await supabase
      .from('user_goal_summary')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active goals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveGoals:', error);
    return [];
  }
}

/**
 * Format goal check-in message
 */
export function formatGoalCheckIn(goal) {
  const timeAgo = getTimeAgo(goal.created_at);

  let message = `\n\n📊 **Quick Check-In**\n`;
  message += `${timeAgo} you set a goal: "${goal.goal_text}"\n\n`;

  if (goal.target_number) {
    message += `Target: ${goal.target_number} ${getGoalTypeLabel(goal.goal_type)}`;
    if (goal.target_period) {
      message += ` per ${goal.target_period}`;
    }
    message += `\n\n`;
  }

  message += `How's it going? How many have you completed so far?`;

  return message;
}

/**
 * Format progress celebration message
 */
export function formatProgressCelebration(goal, progressCount, totalProgress) {
  let message = '';

  if (goal.target_number && totalProgress >= goal.target_number) {
    // Goal completed!
    message = `\n\n🎉 **AMAZING!** You hit your goal!\n`;
    message += `${totalProgress}/${goal.target_number} ${getGoalTypeLabel(goal.goal_type)} `;
    message += `- that's the kind of consistency that gets results! 💪\n\n`;
    message += `Want to set a new goal for next ${goal.target_period}?`;
  } else if (goal.target_number) {
    // Progress update
    const percentage = Math.round((totalProgress / goal.target_number) * 100);
    message = `\n\n💪 **Nice work!**\n`;
    message += `You're at ${totalProgress}/${goal.target_number} ${getGoalTypeLabel(goal.goal_type)} `;
    message += `(${percentage}% of your goal). `;

    if (percentage >= 80) {
      message += `You're so close! Keep pushing! 🔥`;
    } else if (percentage >= 50) {
      message += `You're over halfway there! 🚀`;
    } else {
      message += `Keep at it - every step counts! 💪`;
    }
  } else {
    // No target number, just acknowledge
    message = `\n\n✅ **Good stuff!** Thanks for the update.\n`;
    message += `${progressCount} ${getGoalTypeLabel(goal.goal_type)} completed. `;
    message += `That's the consistency that gets results! 💪`;
  }

  return message;
}

/**
 * Format goal confirmation message
 */
export function formatGoalConfirmation(goal) {
  let message = `\n\n✅ **Goal Set!**\n`;

  if (goal.target_number) {
    message += `I'll help you stay accountable for: ${goal.target_number} ${getGoalTypeLabel(goal.goal_type)}`;
    if (goal.target_period) {
      message += ` per ${goal.target_period}`;
    }
    message += `\n\n`;
  } else {
    message += `I'll help you stay on track with: "${goal.goal_text}"\n\n`;
  }

  message += `I'll check in with you about this in our future conversations. `;
  message += `How many have you completed so far?`;

  return message;
}

// Helper functions
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Earlier today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return 'A while back';
}

function getGoalTypeLabel(goalType) {
  const labels = {
    'applications': 'applications',
    'networking': 'connections',
    'follow_ups': 'follow-ups',
    'interviews': 'interviews',
    'resume_updates': 'resume updates',
    'general': 'items'
  };
  return labels[goalType] || 'items';
}
