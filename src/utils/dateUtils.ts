/**
 * Utilitaires purs pour la manipulation et le formatage des dates en français sans décalage de fuseau horaire.
 */

export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const formatDateStr = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateStr = (): string => {
  return formatDateStr(new Date());
};

export const formatDateShortFr = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatDateLongFr = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const isDateInRange = (dateStr: string, startDate?: string, endDate?: string): boolean => {
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
};

export const getDateRangeDays = (startDate: string, endDate: string): string[] => {
  const days: string[] = [];
  const current = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (current <= end) {
    days.push(formatDateStr(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export interface CalendarDayInfo {
  date: Date;
  dateStr: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  dayOfMonth: number;
}

export const getDaysInMonthGrid = (
  year: number,
  month: number
): (CalendarDayInfo | null)[] => {
  const grid: (CalendarDayInfo | null)[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Conversion pour que lundi soit le 1er jour (0 = Lun, 6 = Dim)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  for (let i = 0; i < startDayOfWeek; i++) {
    grid.push(null);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    grid.push({
      date: d,
      dateStr: formatDateStr(d),
      dayOfWeek: d.getDay(),
      dayOfMonth: i,
    });
  }

  return grid;
};

/**
 * Vérifie si une date (au format 'YYYY-MM-DD') est strictement antérieure à aujourd'hui.
 */
export const isDatePast = (dateStr: string): boolean => {
  return dateStr < getTodayDateStr();
};

/**
 * Calcule la date minimale autorisée pour une sélection (au moins aujourd'hui, et si range avec début ultérieur, startDate).
 */
export const getEffectiveMinDate = (dateMode?: string, startDate?: string): string => {
  const today = getTodayDateStr();
  if (dateMode === 'range' && startDate && startDate > today) {
    return startDate;
  }
  return today;
};

/**
 * Valide si une date peut être sélectionnée/verrouillée pour un événement.
 * Vérifie l'interdiction de choisir une date passée et le respect strict de la plage éventuelle.
 */
export const validateEventDateSelection = (
  dateStr: string,
  dateMode?: string,
  startDate?: string,
  endDate?: string
): { isValid: boolean; errorMessage?: string } => {
  if (isDatePast(dateStr)) {
    return {
      isValid: false,
      errorMessage: "Impossible de fixer une date à un jour déjà passé.",
    };
  }

  if (dateMode === 'range') {
    if (startDate && dateStr < startDate) {
      return {
        isValid: false,
        errorMessage: `La date doit être postérieure ou égale au début de la plage (${formatDateShortFr(startDate)}).`,
      };
    }
    if (endDate && dateStr > endDate) {
      return {
        isValid: false,
        errorMessage: `La date ne peut pas dépasser la fin de la plage (${formatDateShortFr(endDate)}).`,
      };
    }
  }

  return { isValid: true };
};
