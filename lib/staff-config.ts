export interface Player {
  username: string;
  grade: string;
  gradeColor: string;
  gradeTextColor: string;
  gradeBg: string;
  weeklyGoalMinutes: number;
}

/* ─────────────────────────────────────────────────────────────────
   AJOUTER UN STAFF : copie un bloc et change les valeurs.
   weeklyGoalMinutes : objectif en minutes (2h = 120, 7h = 420)
   gradeColor        : couleur hex de la bordure/accent
   gradeTextColor    : couleur du texte du badge
   gradeBg           : fond semi-transparent du badge
   ───────────────────────────────────────────────────────────────── */
export const PLAYERS: Player[] = [
  {
    username: "ixtazzking",
    grade: "Modérateur réserviste",
    gradeColor: "#4a7c59",
    gradeTextColor: "#7eb895",
    gradeBg: "rgba(74,124,89,0.15)",
    weeklyGoalMinutes: 120,
  },
  {
    username: "Orionyx84",
    grade: "Modérateur+",
    gradeColor: "#1a6b3c",
    gradeTextColor: "#4dae78",
    gradeBg: "rgba(26,107,60,0.15)",
    weeklyGoalMinutes: 420,
  },
];

export function findPlayer(username: string): Player | undefined {
  return PLAYERS.find(
    (p) => p.username.toLowerCase() === username.toLowerCase()
  );
}
