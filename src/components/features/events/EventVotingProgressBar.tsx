import React from 'react';

interface EventVotingProgressBarProps {
  isLocked: boolean;
  respondedMembers: number;
  totalMembers: number;
  participatingCount: number;
  unavailableCount: number;
  missingResponses: number;
}

export const EventVotingProgressBar: React.FC<EventVotingProgressBarProps> = ({
  isLocked,
  respondedMembers,
  totalMembers,
  participatingCount,
  unavailableCount,
  missingResponses,
}) => {
  const isFull = respondedMembers === totalMembers;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs sm:text-sm">
        <span className="text-slate-400">
          {isLocked ? 'Présences confirmées' : 'Progression des réponses'}
        </span>
        <span
          className={`font-bold ${
            isLocked || isFull ? 'text-emerald-400' : 'text-primary-400'
          }`}
        >
          {isLocked
            ? `${participatingCount} présent(s) • ${unavailableCount} indispo.`
            : `${respondedMembers} / ${totalMembers} membres`}
        </span>
      </div>
      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isLocked || isFull ? 'bg-emerald-500' : 'bg-primary-500'
          }`}
          style={{
            width: `${
              isLocked
                ? (participatingCount / Math.max(totalMembers, 1)) * 100
                : (respondedMembers / Math.max(totalMembers, 1)) * 100
            }%`,
          }}
        />
      </div>
      {missingResponses > 0 && !isLocked && (
        <p className="text-xs text-amber-400/90 pt-0.5">
          En attente de réponse de {missingResponses} membre(s).
        </p>
      )}
    </div>
  );
};
