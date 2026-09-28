import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { GroupPlanning, AvailabilityStatus } from '../../../models/Group';
import { CheckCircle, HelpCircle, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface GroupPlanningTabProps {
  groupId: string;
  currentUserId: string;
  plannings: GroupPlanning[];
  onUpdatePlanning: (userId: string, dates: Record<string, AvailabilityStatus>) => Promise<boolean>;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const GroupPlanningTab: React.FC<GroupPlanningTabProps> = ({
  currentUserId,
  plannings,
  onUpdatePlanning,
}) => {
  const EMPTY_PLANNING: Record<string, AvailabilityStatus> = useMemo(() => ({}), []);
  const myPlanning = useMemo(() => plannings.find(p => p.userId === currentUserId)?.dates || EMPTY_PLANNING, [plannings, currentUserId, EMPTY_PLANNING]);
  
  const [pendingDates, setPendingDates] = useState<Record<string, AvailabilityStatus> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The displayed dates are a merge of Firestore truth and any pending changes
  const displayDates = useMemo(() => {
    return pendingDates ?? myPlanning;
  }, [myPlanning, pendingDates]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const todayDateStr = useMemo(() => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<Record<string, AvailabilityStatus> | null>(null);

  const saveDates = (newDates: Record<string, AvailabilityStatus>) => {
    setPendingDates(newDates);
    pendingSaveRef.current = newDates;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSaving(true);
    
    timeoutRef.current = setTimeout(async () => {
      // Create a snapshot of what we are saving to avoid race conditions
      const datesToSave = pendingSaveRef.current;
      if (!datesToSave) return;
      
      const success = await onUpdatePlanning(currentUserId, datesToSave);
      
      if (!success) {
        // If it failed, show an alert and keep the pending dates (or revert)
        // Here we choose to revert the pending state since the server rejected it
        alert("Erreur lors de la sauvegarde du planning. Veuillez réessayer.");
        if (pendingSaveRef.current === datesToSave) {
          pendingSaveRef.current = null;
          setPendingDates(null);
          setIsSaving(false);
        }
        return;
      }
      
      // If no new changes happened while saving, we can clear the pending state
      // myPlanning will now reflect these changes via Firestore onSnapshot
      if (pendingSaveRef.current === datesToSave) {
        pendingSaveRef.current = null;
        // Add a tiny delay to ensure React state batching of `myPlanning` finishes
        setTimeout(() => {
          setPendingDates((current) => current === datesToSave ? null : current);
          setIsSaving(false);
        }, 300);
      }
    }, 500);
  };

  // Flush save on unmount if there's still a pending save
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pendingSaveRef.current) {
        onUpdatePlanning(currentUserId, pendingSaveRef.current);
      }
    };
  }, [currentUserId, onUpdatePlanning]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days: ({ date: Date; dateStr: string; dayOfWeek: number } | null)[] = [];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-');
      days.push({ date: d, dateStr, dayOfWeek: d.getDay() });
    }
    
    return days;
  }, [currentMonth]);

  const toggleStatus = (currentStatus: AvailabilityStatus | undefined): AvailabilityStatus => {
    if (!currentStatus || currentStatus === 'unavailable') return 'available';
    if (currentStatus === 'available') return 'maybe';
    return 'unavailable';
  };

  const handleToggleDate = (dateStr: string) => {
    const currentStatus = displayDates[dateStr] || 'unavailable';
    const nextStatus = toggleStatus(currentStatus);
    
    const newDates = {
      ...displayDates,
      [dateStr]: nextStatus
    };
    saveDates(newDates);
  };

  const handleHeaderClick = (dayIndex: number) => {
    const jsDay = dayIndex === 6 ? 0 : dayIndex + 1;
    const monthDays = daysInMonth.filter(d => d !== null && d.dayOfWeek === jsDay) as {dateStr: string}[];
    if (monthDays.length === 0) return;
    
    const firstStatus = displayDates[monthDays[0].dateStr] || 'unavailable';
    const nextStatus = toggleStatus(firstStatus);
    
    const newDates = { ...displayDates };
    monthDays.forEach(d => {
      newDates[d.dateStr] = nextStatus;
    });
    
    saveDates(newDates);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Restrict past months and > +3 months
  const isPrevDisabled = useMemo(() => {
    const now = new Date();
    return currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() === now.getMonth();
  }, [currentMonth]);

  const isNextDisabled = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    return currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() === now.getMonth();
  }, [currentMonth]);

  const getStatusColor = (status: AvailabilityStatus | undefined, isPast: boolean) => {
    if (isPast) return 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed';
    if (status === 'available') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30';
    if (status === 'maybe') return 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30';
    return 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white';
  };

  const getStatusIcon = (status: AvailabilityStatus | undefined) => {
    if (status === 'available') return <CheckCircle className="w-4 h-4 mx-auto mb-0.5" />;
    if (status === 'maybe') return <HelpCircle className="w-4 h-4 mx-auto mb-0.5" />;
    return <XCircle className="w-4 h-4 mx-auto mb-0.5 opacity-40" />;
  };

  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm relative">
        
        {/* Header and Autosave Indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Mon Planning
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Clique sur un jour pour changer ta disponibilité. Sauvegarde automatique.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium h-8">
            {isSaving ? (
              <span className="text-primary-400 flex items-center gap-1.5 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
              </span>
            ) : pendingDates !== null ? (
               <span className="text-slate-400 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                En attente...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-opacity">
                <CheckCircle className="w-3.5 h-3.5" /> À jour
              </span>
            )}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <button 
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-semibold text-slate-200 capitalize text-lg tracking-wide">
            {monthLabel}
          </div>
          <button 
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Headers */}
          {WEEK_DAYS.map((day, idx) => (
            <div 
              key={day}
              onClick={() => handleHeaderClick(idx)}
              title={`Basculer tous les ${day} de ce mois`}
              className="text-center text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider py-2 cursor-pointer hover:text-white transition bg-slate-900/40 rounded-lg border border-slate-800/50 hover:bg-slate-700 select-none active:scale-95"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {daysInMonth.map((dayObj, idx) => {
            if (!dayObj) {
              return <div key={`empty-${idx}`} className="p-2 sm:p-4 rounded-xl" />;
            }
            const status = displayDates[dayObj.dateStr];
            const isPast = dayObj.dateStr < todayDateStr;

            return (
              <div 
                key={dayObj.dateStr}
                onClick={() => !isPast && handleToggleDate(dayObj.dateStr)}
                className={`flex flex-col items-center justify-center py-2 px-1 sm:p-3 rounded-xl border transition-all select-none ${isPast ? 'cursor-not-allowed' : 'cursor-pointer active:scale-90'} ${getStatusColor(status, isPast)}`}
              >
                <span className="text-[10px] sm:text-xs font-bold mb-1 opacity-80 hidden sm:block">
                  {getStatusIcon(status)}
                </span>
                <span className="text-sm sm:text-lg font-bold">
                  {dayObj.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start text-xs text-slate-400 font-medium bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div> Dispo</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div> À confirmer</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div> Indispo</div>
        </div>

      </div>
    </div>
  );
};
