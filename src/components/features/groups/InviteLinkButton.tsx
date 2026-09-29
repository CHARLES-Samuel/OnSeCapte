import React, { useState, useCallback } from 'react';
import { Link2, CheckCheck } from 'lucide-react';
import { buildInviteUrl } from '../../../utils/eventStatsUtils';

interface InviteLinkButtonProps {
  inviteCode: string;
  className?: string;
}

/**
 * Bouton "Copier le lien d'invitation" avec retour visuel immédiat.
 * Génère un lien partageable à partir du code d'invitation du groupe.
 */
export const InviteLinkButton: React.FC<InviteLinkButtonProps> = ({ inviteCode, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = buildInviteUrl(inviteCode);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [inviteCode]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Lien d\'invitation copié !' : 'Copier le lien d\'invitation'}
      aria-live="polite"
      className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
      } ${className}`}
    >
      {copied ? (
        <>
          <CheckCheck className="w-4 h-4" aria-hidden="true" />
          <span>Lien copié !</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4 shrink-0 text-primary-400" aria-hidden="true" />
          <span className="hidden sm:inline">Inviter des amis</span>
          <span className="sm:hidden">Inviter</span>
        </>
      )}
    </button>
  );
};
