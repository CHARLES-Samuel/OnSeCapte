import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownView } from '../../ui/MarkdownView';
import { formatDescriptionPreview } from '../../../utils/format';

interface EventListDescriptionProps {
  description?: string | null;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
}

export const EventListDescription: React.FC<EventListDescriptionProps> = ({
  description,
  isExpanded,
  onToggleExpand,
}) => {
  const trimmed = description?.trim() || '';
  if (!trimmed) return null;

  const previewText = formatDescriptionPreview(trimmed);
  const canExpand =
    trimmed.length > 80 || trimmed.includes('\n') || trimmed.includes('#');

  return (
    <div className="pt-0.5 min-w-0">
      {!isExpanded ? (
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-1 sm:line-clamp-2 break-words leading-relaxed min-w-0 flex-1">
            {previewText}
          </p>
          {canExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-400 hover:text-primary-300 hover:underline shrink-0 transition"
              title="Déplier la description"
              aria-label="Déplier la description de l'événement"
            >
              <span>Voir plus</span>
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-1.5 mt-1 border-t border-slate-700/50 text-slate-300 min-w-0"
        >
          <MarkdownView content={trimmed} className="text-xs sm:text-sm" />
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-400 hover:text-primary-300 hover:underline mt-2 transition"
            title="Replier la description"
            aria-label="Replier la description de l'événement"
          >
            <span>Voir moins</span>
            <ChevronUp className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
