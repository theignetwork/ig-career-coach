import { useState } from 'react';
import { X } from 'lucide-react';
import type { GoalCheckIn } from '../types/chat';

interface GoalCheckInBannerProps {
  goalCheckIn: GoalCheckIn | null;
  onDismiss: () => void;
}

export function GoalCheckInBanner({ goalCheckIn, onDismiss }: GoalCheckInBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!goalCheckIn || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const getProgressPercentage = () => {
    if (!goalCheckIn.goal?.targetNumber) return 0;
    return Math.round((goalCheckIn.goal.currentProgress / goalCheckIn.goal.targetNumber) * 100);
  };

  const percentage = getProgressPercentage();

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-2 border-blue-500/30 rounded-xl p-4 animate-slide-down">
      <div className="flex gap-4 items-start">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">
          📊
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-base font-semibold text-blue-400">Quick Check-In</h4>
          </div>

          {goalCheckIn.goal && (
            <>
              <p className="text-sm text-text-light mb-3">
                You set a goal: <strong className="text-white">"{goalCheckIn.goal.goalText}"</strong>
              </p>

              {/* Progress Bar */}
              {goalCheckIn.goal.targetNumber > 0 && (
                <div className="mb-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted font-medium">
                    {goalCheckIn.goal.currentProgress} / {goalCheckIn.goal.targetNumber} {goalCheckIn.goal.goalType}
                    {percentage > 0 && ` (${percentage}%)`}
                  </p>
                </div>
              )}

              <p className="text-sm text-text-light/90 font-medium">
                How's it going? How many have you completed so far?
              </p>
            </>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Dismiss check-in"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  );
}
