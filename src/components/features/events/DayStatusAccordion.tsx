import React, { useState } from 'react';
import { CheckCircle, HelpCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemberProfile } from '../../../models/Group';
import { DayMemberChip } from './DayMemberChip';

interface DayStatusAccordionProps {
  available: string[];
  maybe: string[];
  unavailable: string[];
  memberProfiles: Record<string, MemberProfile>;
  currentUserId?: string;
}

const MAX_DISPLAY_COUNT = 8;

interface StatusSectionConfig {
  id: 'available' | 'maybe' | 'unavailable';
  title: string;
  count: number;
  icon: React.ReactNode;
  headerTextColor: string;
  badgeBgColor: string;
  emptyMessage: string;
  userIds: string[];
}

export const DayStatusAccordion: React.FC<DayStatusAccordionProps> = ({
  available,
  maybe,
  unavailable,
  memberProfiles,
  currentUserId,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    available: true,
    maybe: maybe.length > 0,
    unavailable: false,
  });

  const [expandedAll, setExpandedAll] = useState<Record<string, boolean>>({
    available: false,
    maybe: false,
    unavailable: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandAll = (id: string) => {
    setExpandedAll((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sections: StatusSectionConfig[] = [
    {
      id: 'available',
      title: 'Disponibles',
      count: available.length,
      icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />,
      headerTextColor: 'text-emerald-400',
      badgeBgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      emptyMessage: 'Aucun membre disponible',
      userIds: available,
    },
    {
      id: 'maybe',
      title: 'À confirmer',
      count: maybe.length,
      icon: <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />,
      headerTextColor: 'text-amber-400',
      badgeBgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      emptyMessage: 'Aucun membre incertain',
      userIds: maybe,
    },
    {
      id: 'unavailable',
      title: 'Indisponibles',
      count: unavailable.length,
      icon: <XCircle className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />,
      headerTextColor: 'text-slate-200',
      badgeBgColor: 'bg-slate-700/60 text-slate-200 border-slate-600',
      emptyMessage: 'Aucun membre indisponible',
      userIds: unavailable,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {sections.map((section) => {
        const isOpen = openSections[section.id];
        const isShowAll = expandedAll[section.id];
        const hasOverflow = section.userIds.length > MAX_DISPLAY_COUNT;
        const visibleUserIds = isShowAll
          ? section.userIds
          : section.userIds.slice(0, MAX_DISPLAY_COUNT);

        return (
          <div
            key={section.id}
            className="bg-slate-800/50 border border-slate-700/70 rounded-xl overflow-hidden shadow-sm transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-800/80 transition cursor-pointer min-h-[44px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {section.icon}
                <span className={`text-xs sm:text-sm font-bold truncate ${section.headerTextColor}`}>
                  {section.title}
                </span>
              </div>

              {/* Groupe décompte + chevron à droite avec espacement dédié */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${section.badgeBgColor}`}
                >
                  {section.count}
                </span>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-700/70 transition shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="p-3.5 pt-1.5 sm:p-4 sm:pt-2 border-t border-slate-700/40 space-y-2">
                {section.userIds.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    {section.emptyMessage}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {visibleUserIds.map((uid) => (
                        <DayMemberChip
                          key={uid}
                          uid={uid}
                          profile={memberProfiles[uid]}
                          isMe={uid === currentUserId}
                          status={section.id}
                        />
                      ))}
                    </div>

                    {hasOverflow && (
                      <button
                        type="button"
                        onClick={() => toggleExpandAll(section.id)}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300 font-medium py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 w-full text-center transition min-h-[34px] cursor-pointer"
                      >
                        {isShowAll
                          ? 'Voir moins'
                          : `+${section.userIds.length - MAX_DISPLAY_COUNT} autre${
                              section.userIds.length - MAX_DISPLAY_COUNT > 1 ? 's' : ''
                            } membre${
                              section.userIds.length - MAX_DISPLAY_COUNT > 1 ? 's' : ''
                            }`}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
