const DAYS_FR = [
  "Dimanche", "Lundi", "Mardi", "Mercredi",
  "Jeudi", "Vendredi", "Samedi",
];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Retourne l'identifiant ISO de semaine ex: "2026-W22" pour aujourd'hui */
export function getISOWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

/** Lundi de la semaine donnée */
export function getWeekMonday(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + (week - 1) * 7);
  return monday;
}

/** Dimanche de la semaine donnée */
export function getWeekSunday(weekId: string): Date {
  const monday = getWeekMonday(weekId);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return sunday;
}

/** Semaine précédente */
export function prevWeek(weekId: string): string {
  const monday = getWeekMonday(weekId);
  const prev = new Date(monday);
  prev.setUTCDate(monday.getUTCDate() - 7);
  return getISOWeekId(prev);
}

/** Semaine suivante */
export function nextWeek(weekId: string): string {
  const monday = getWeekMonday(weekId);
  const next = new Date(monday);
  next.setUTCDate(monday.getUTCDate() + 7);
  return getISOWeekId(next);
}

/** "Mercredi 20 mai" depuis "2026-05-20" */
export function formatDateFr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayName = DAYS_FR[date.getUTCDay()];
  const monthName = MONTHS_FR[date.getUTCMonth()];
  return `${dayName} ${d} ${monthName}`;
}

/** 90 → "1h 30min" | 60 → "1h" | 45 → "45min" | 0 → "0h" */
export function minutesToHM(minutes: number): string {
  if (minutes === 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** "25 – 31 mai 2026" ou "28 avr – 4 mai 2026" */
export function formatWeekRange(weekId: string): string {
  const start = getWeekMonday(weekId);
  const end = getWeekSunday(weekId);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = MONTHS_FR[start.getUTCMonth()];
  const endMonth = MONTHS_FR[end.getUTCMonth()];

  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${startDay} – ${endDay} ${startMonth} ${start.getUTCFullYear()}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${start.getUTCFullYear()}`;
}
