import React from 'react';
import {
  BarChart3, Users, CalendarCheck, CalendarClock, CalendarX2,
  Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2,
  Trophy, Star, MoreHorizontal
} from 'lucide-react';
import type { GroupEventStats } from '../../../utils/eventStatsUtils';
import type { EventCategory } from '../../../models/Event';

interface GroupStatsPanelProps {
  stats: GroupEventStats;
}

const CATEGORY_CONFIG: Record<EventCategory, { icon: React.ElementType; color: string }> = {
  'Restaurant': { icon: Utensils, color: 'text-orange-400' },
  'Jeux de rôle': { icon: Dices, color: 'text-purple-400' },
  'Soirée': { icon: PartyPopper, color: 'text-pink-400' },
  'Repas': { icon: Pizza, color: 'text-yellow-400' },
  'Sport': { icon: Dumbbell, color: 'text-green-400' },
  'Gaming': { icon: Gamepad2, color: 'text-blue-400' },
  'Autres': { icon: MoreHorizontal, color: 'text-slate-400' },
};

export const GroupStatsPanel: React.FC<GroupStatsPanelProps> = ({ stats }) => {
  const { totalEvents, byState, byCategory, activeMembers } = stats;

  const maxCategoryCount = Math.max(...Object.values(byCategory), 1);
  const topCategories = (Object.entries(byCategory) as [EventCategory, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <section
      aria-label="Statistiques du groupe"
      className="rounded-2xl border border-slate-800 bg-slate-800/40 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">Statistiques</h2>
      </div>

      <div className="p-5 space-y-6">

        {/* Résumé global */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            value={totalEvents}
            label="Événements créés"
            colorClass="text-white"
            bgClass="bg-primary-500/10 border-primary-500/20"
          />
          <StatCard
            icon={<CalendarClock className="w-4 h-4 text-amber-400" aria-hidden="true" />}
            value={byState.sondage}
            label="En recherche"
            colorClass="text-amber-400"
            bgClass="bg-amber-500/10 border-amber-500/20"
          />
          <StatCard
            icon={<CalendarCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />}
            value={byState.planifie}
            label="À venir"
            colorClass="text-emerald-400"
            bgClass="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard
            icon={<CalendarX2 className="w-4 h-4 text-slate-400" aria-hidden="true" />}
            value={byState.passe}
            label="Passés"
            colorClass="text-slate-400"
            bgClass="bg-slate-700/50 border-slate-600/30"
          />
        </div>

        {/* Répartition par catégorie */}
        {topCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              Activités favorites
            </h3>
            <ul className="space-y-2" aria-label="Répartition par catégorie">
              {topCategories.map(([cat, count]) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;

                return (
                  <li key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`flex items-center gap-1.5 font-medium ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {cat}
                      </span>
                      <span className="text-slate-400">{count} événement{count > 1 ? 's' : ''} · {pct}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemax={maxCategoryCount}
                      aria-label={`${cat} : ${count} événements`}
                      className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Membres les plus actifs */}
        {activeMembers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
              Membres les plus actifs
            </h3>
            <ol className="space-y-2" aria-label="Membres les plus actifs">
              {activeMembers.slice(0, 5).map((member, index) => (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50"
                >
                  <span
                    aria-hidden="true"
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : index === 1
                        ? 'bg-slate-400/20 text-slate-300'
                        : index === 2
                        ? 'bg-orange-600/20 text-orange-400'
                        : 'bg-slate-700/50 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-200 font-medium truncate">
                    {member.displayName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    <span
                      aria-label={`${member.eventsCreated} événements créés`}
                      title="Événements créés"
                      className="flex items-center gap-1"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      {member.eventsCreated}
                    </span>
                    <span
                      aria-label={`${member.availabilityResponses} réponses de disponibilité`}
                      title="Réponses de disponibilité"
                      className="flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                      {member.availabilityResponses}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {totalEvents === 0 && (
          <p className="text-center text-sm text-slate-500 py-4">
            Aucun événement créé pour l'instant. Créez le premier !
          </p>
        )}
      </div>
    </section>
  );
};

// ─── Sous-composant : carte de stat ─────────────────────────────────────────

interface StatCardProps {
  value: number;
  label: string;
  colorClass: string;
  bgClass: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, colorClass, bgClass, icon }) => (
  <div className={`rounded-xl border p-3 flex flex-col gap-1.5 ${bgClass}`}>
    {icon && <div>{icon}</div>}
    <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
    <span className="text-xs text-slate-400 leading-tight">{label}</span>
  </div>
);
