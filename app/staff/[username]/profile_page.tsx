"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { findPlayer } from "@/lib/staff-config";
import { getWeekSessions, type Session } from "@/lib/staff-data";
import {
  getISOWeekId,
  prevWeek,
  nextWeek,
  formatDateFr,
  minutesToHM,
  formatWeekRange,
} from "@/lib/week-utils";

/* ── Tête carrée NationsGlory ─────────────────────────────────── */
function NgHead({ username, size }: { username: string; size: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6,
        background: "rgba(74,124,89,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.45), fontWeight: 700, color: "#7eb895",
        flexShrink: 0,
      }}>
        {username[0].toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`/api/skin/${encodeURIComponent(username)}?s=64`}
      alt={username}
      onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: 6,
        imageRendering: "pixelated", objectFit: "cover",
        display: "block", flexShrink: 0,
      }}
    />
  );
}

/* ── Barre de progression animée ──────────────────────────────── */
function GoalBar({ current, goal }: { current: number; goal: number }) {
  const [width, setWidth] = useState(0);
  const pct     = goal > 0 ? Math.min(current / goal, 1) * 100 : 0;
  const reached = current >= goal;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{
      width: "100%", height: 10, borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%", width: `${width}%`, borderRadius: 999,
        background: reached
          ? "linear-gradient(90deg, #16a34a, #22c55e)"
          : "linear-gradient(90deg, #b91c1c, #ef4444)",
        transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: reached ? "0 0 14px rgba(34,197,94,0.5)" : "0 0 10px rgba(239,68,68,0.35)",
      }} />
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────── */
export default function ProfilePage({ username }: { username: string }) {
  const router = useRouter();

  /* ── Tous les hooks en premier ── */
  const [weekId,      setWeekId]      = useState(() => getISOWeekId(new Date()));
  const [hoveredRow,  setHoveredRow]  = useState<number | null>(null);
  const [sessions,    setSessions]    = useState<Session[]>([]);
  const [sessLoading, setSessLoading] = useState(true);

  const player        = findPlayer(username);
  const currentWeekId = getISOWeekId(new Date());
  const isCurrentWeek = weekId === currentWeekId;

  /* Charge les sessions depuis l'API (KV auto) ou les données statiques (fallback) */
  useEffect(() => {
    const p = findPlayer(username);
    if (!p) return;

    setSessLoading(true);
    const ctrl = new AbortController();

    fetch(
      `/api/staff/sessions/${encodeURIComponent(p.username)}?week=${encodeURIComponent(weekId)}`,
      { signal: ctrl.signal }
    )
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(() => {
        if (!ctrl.signal.aborted) setSessions(getWeekSessions(p.username, weekId));
      })
      .finally(() => { if (!ctrl.signal.aborted) setSessLoading(false); });

    return () => ctrl.abort();
  }, [weekId, username]);

  /* ── Joueur introuvable ── */
  if (!player) {
    return (
      <main style={{
        minHeight: "100vh", background: "#000", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 20, fontSize: 14 }}>Joueur introuvable</p>
          <button
            onClick={() => router.push("/staff")}
            style={{ background: "#1a6b3c", border: "none", color: "#fff", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13 }}
          >← Retour</button>
        </div>
      </main>
    );
  }

  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const totalMinutes   = sessions.reduce((s, sess) => s + sess.minutes, 0);
  const goalMinutes    = player.weeklyGoalMinutes;
  const goalReached    = totalMinutes >= goalMinutes;
  const goalProgress   = Math.min(totalMinutes, goalMinutes);

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)",
      color: "#fff",
      fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Responsive */}
      <style>{`
        @media (max-width: 520px) {
          .sg { grid-template-columns: 1fr 90px !important; }
          .sh { grid-template-columns: 1fr 90px !important; }
          .sv { display: none !important; }
          .fi { flex-direction: column !important; gap: 10px !important; }
          .fr { text-align: left !important; }
          .nl { font-size: 11px !important; }
        }
      `}</style>

      {/* Grille de fond */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* ─── Header ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/staff")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)",
              fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
          >← Retour</button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              border: `2px solid ${player.gradeColor}`,
              borderRadius: 8, overflow: "hidden", flexShrink: 0,
            }}>
              <NgHead username={player.username} size={36} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 19, fontWeight: 800, letterSpacing: "-0.3px", color: "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {player.username}
              </div>
              <div style={{
                display: "inline-block", fontSize: 9, fontWeight: 600,
                padding: "2px 7px", borderRadius: 4,
                background: player.gradeBg, border: `1px solid ${player.gradeColor}35`,
                color: player.gradeTextColor, letterSpacing: 0.5, textTransform: "uppercase",
              }}>
                {player.grade}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Navigation semaine ─── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, marginBottom: 14, padding: "0 2px",
        }}>
          <button
            onClick={() => setWeekId(prevWeek(weekId))}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "8px 14px", color: "rgba(255,255,255,0.55)",
              fontSize: 12, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}
          >← Précédente</button>

          <div className="nl" style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#fff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              Semaine du {formatWeekRange(weekId)}
            </div>
            {isCurrentWeek && (
              <div style={{ fontSize: 10, color: "rgba(78,160,107,0.8)", letterSpacing: 0.4, marginTop: 2 }}>
                ● Semaine en cours
              </div>
            )}
          </div>

          <button
            onClick={() => !isCurrentWeek && setWeekId(nextWeek(weekId))}
            style={{
              background: isCurrentWeek ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px",
              color: isCurrentWeek ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)",
              fontSize: 12, cursor: isCurrentWeek ? "not-allowed" : "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!isCurrentWeek) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; } }}
            onMouseLeave={e => { e.currentTarget.style.background=isCurrentWeek?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)"; e.currentTarget.style.color=isCurrentWeek?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.55)"; }}
          >Suivante →</button>
        </div>

        {/* ─── Tableau ─── */}
        <div style={{
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20,
        }}>
          {/* En-têtes */}
          <div className="sh" style={{
            display: "grid", gridTemplateColumns: "1fr 120px 80px",
            padding: "10px 16px",
            background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.05)",
            fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
          }}>
            <div>Date</div>
            <div>Durée</div>
            <div className="sv" style={{ textAlign: "right" }}>Serveur</div>
          </div>

          {/* Lignes */}
          {sessLoading ? (
            <div style={{
              padding: "32px 16px", textAlign: "center",
              color: "rgba(255,255,255,0.2)", fontSize: 12,
              background: "rgba(0,0,0,0.2)",
            }}>
              Chargement…
            </div>
          ) : sortedSessions.length === 0 ? (
            <div style={{
              padding: "40px 16px", textAlign: "center",
              color: "rgba(255,255,255,0.18)", fontSize: 13,
              background: "rgba(0,0,0,0.2)",
            }}>
              Aucune connexion enregistrée cette semaine
            </div>
          ) : (
            sortedSessions.map((session, i) => (
              <div
                key={`${session.date}-${i}`}
                className="sg"
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 80px",
                  padding: "12px 16px", alignItems: "center",
                  background: hoveredRow === i
                    ? "rgba(255,255,255,0.035)"
                    : i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
                  borderBottom: i < sortedSessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  {formatDateFr(session.date)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {minutesToHM(session.minutes)}
                </div>
                <div className="sv" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
                  White
                </div>
              </div>
            ))
          )}

          {/* Pied de tableau */}
          <div style={{
            background: "rgba(255,255,255,0.015)",
            borderTop: "1px solid rgba(255,255,255,0.06)", padding: "13px 16px",
          }}>
            <div className="fi" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              {/* Objectif — gauche */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: goalReached ? "#22c55e" : "#ef4444",
                  boxShadow: goalReached ? "0 0 6px #22c55e" : "0 0 4px #ef4444",
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: goalReached ? "#4ade80" : "#f87171" }}>
                  {minutesToHM(goalProgress)}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  / {minutesToHM(goalMinutes)}
                </span>
                <span style={{ fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginLeft: 2 }}>
                  objectif
                </span>
              </div>

              {/* Total — droite */}
              <div className="fr" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                  Temps total de la semaine
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginLeft: 8 }}>
                  {minutesToHM(totalMinutes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Heures de la semaine ─── */}
        <div style={{
          borderRadius: 12, padding: "22px 20px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap",
          }}>
            <div>
              <div style={{
                fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)", marginBottom: 7, fontWeight: 600,
              }}>Heures de la semaine</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
                <span style={{ color: goalReached ? "#4ade80" : "#f87171" }}>
                  {minutesToHM(goalProgress)}
                </span>
                <span style={{ fontSize: 17, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                  {" "}/ {minutesToHM(goalMinutes)}
                </span>
              </div>
            </div>

            <div style={{
              fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 999,
              background: goalReached ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${goalReached ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
              color: goalReached ? "#4ade80" : "#f87171",
              whiteSpace: "nowrap", alignSelf: "flex-start",
            }}>
              {goalReached ? "✓ Objectif atteint" : "Objectif non atteint"}
            </div>
          </div>

          <GoalBar current={goalProgress} goal={goalMinutes} />

          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 8,
            fontSize: 10, color: "rgba(255,255,255,0.15)",
          }}>
            <span>0h</span>
            <span>{minutesToHM(goalMinutes)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
