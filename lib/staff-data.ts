export interface Session {
  date: string;       // format "AAAA-MM-JJ"  ex: "2026-05-19"
  minutes: number;    // durée en minutes     ex: 90
  startTime?: number; // timestamp ms (connexion détectée)
  endTime?: number;   // timestamp ms (déconnexion détectée)
}

/* ─────────────────────────────────────────────────────────────────
   COMMENT AJOUTER DES HEURES :

   1. Trouve la semaine au format "AAAA-Www"
      → va sur whatweekisit.com pour trouver le numéro de semaine
      → ex : semaine du 25 mai 2026 = "2026-W22"

   2. Dans le bon username, ajoute ou modifie la semaine :
      "2026-W23": [
        { date: "2026-06-01", minutes: 90 },   ← 1h30 le 1er juin
        { date: "2026-06-03", minutes: 45 },   ← 45min le 3 juin
      ],

   3. Sauvegarde, et le site se met à jour automatiquement.
   ───────────────────────────────────────────────────────────────── */
export const STAFF_WEEKLY_DATA: Record<string, Record<string, Session[]>> = {

  ixtazzking: {
    "2026-W22": [],
    "2026-W21": [
      { date: "2026-05-20", minutes: 45 },
      { date: "2026-05-22", minutes: 30 },
    ],
    "2026-W20": [
      { date: "2026-05-12", minutes: 60 },
      { date: "2026-05-14", minutes: 45 },
      { date: "2026-05-16", minutes: 45 },
    ],
    "2026-W19": [
      { date: "2026-05-05", minutes: 30 },
    ],
  },

  Orionyx84: {
    "2026-W22": [],
    "2026-W21": [
      { date: "2026-05-19", minutes: 90 },
      { date: "2026-05-20", minutes: 75 },
      { date: "2026-05-21", minutes: 60 },
      { date: "2026-05-22", minutes: 75 },
    ],
    "2026-W20": [
      { date: "2026-05-11", minutes: 90 },
      { date: "2026-05-12", minutes: 120 },
      { date: "2026-05-13", minutes: 90 },
      { date: "2026-05-15", minutes: 120 },
      { date: "2026-05-16", minutes: 90 },
    ],
    "2026-W19": [
      { date: "2026-05-05", minutes: 120 },
      { date: "2026-05-06", minutes: 90 },
      { date: "2026-05-07", minutes: 60 },
      { date: "2026-05-08", minutes: 90 },
      { date: "2026-05-09", minutes: 60 },
    ],
  },

};

export function getWeekSessions(username: string, weekId: string): Session[] {
  const playerData = STAFF_WEEKLY_DATA[username];
  if (!playerData) return [];
  return playerData[weekId] ?? [];
}
