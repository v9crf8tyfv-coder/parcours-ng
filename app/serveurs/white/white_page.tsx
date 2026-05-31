"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/* ── Types ──────────────────────────────────────────────────────── */
type OnlineStatus = "online" | "recent" | "today" | "offline" | "unknown";

interface SearchResult {
  username:         string;
  onlineStatus:     OnlineStatus;
  nation:           string;
  skinHead:         string | null;
  todayMinutes:     number | null;
  yesterdayMinutes: number | null;
  lastLogin:        number | null;
  minutesAgo:       number | null;
  grade:            string | null;
  isPrime:          boolean;
}
interface TodayPlayer {
  name:       string;
  country:    string;
  minutes:    number;
  grade:      string;
  isPrime:    boolean;
  lastLogin:  number;
  minutesAgo: number;
}
interface TopPlayer {
  name:    string;
  country: string;
  minutes: number;
  grade:   string;
  isPrime: boolean;
}
interface TodayStats  { date: string; totalPlayers: number; players:    TodayPlayer[] }
interface YestStats   { date: string; totalPlayers: number; topPlayers: TopPlayer[]   }
interface ApiData {
  ok:            boolean;
  playerCount:   number | null;
  playerMax:     number | null;
  serverOpen:    boolean;
  serverUnknown: boolean;
  today:         TodayStats  | null;
  yesterday:     YestStats   | null;
  searchResult:  SearchResult | null;
  yoxoAvailable: boolean;
  timestamp:     string;
}

/* ── Helpers ─────────────────────────────────────────────────────*/
function fmtMin(m: number): string {
  if (!m) return "0 min";
  const h = Math.floor(m / 60), min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
}
function fmtAgo(min: number): string {
  if (min < 1)  return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `il y a ${h}h ${m}min` : `il y a ${h}h`;
}

const STATUS_CONFIG: Record<OnlineStatus, { dot: string; bg: string; border: string; label: string }> = {
  online:  { dot: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   label: "En ligne"         },
  recent:  { dot: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  label: "Récemment actif"  },
  today:   { dot: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)",  label: "Actif aujourd'hui" },
  offline: { dot: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", label: "Hors ligne" },
  unknown: { dot: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  label: "Inconnu"          },
};

function gradeBadge(grade: string): { bg: string; border: string; color: string } {
  const g = grade.toLowerCase();
  if (g.includes("admin") || g.includes("fondateur") || g.includes("responsable"))
    return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#fca5a5" };
  if (g.includes("super"))
    return { bg: "rgba(30,64,175,0.15)", border: "rgba(30,64,175,0.35)", color: "#93b4f5" };
  if (g.includes("+"))
    return { bg: "rgba(22,101,52,0.15)", border: "rgba(22,101,52,0.35)", color: "#6dbb8a" };
  if (g.includes("modo") || g.includes("modér"))
    return { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#86efac" };
  if (g.includes("test") || g.includes("réserv"))
    return { bg: "rgba(134,239,172,0.1)", border: "rgba(134,239,172,0.2)", color: "#bbf7d0" };
  if (g.includes("partenaire") || g.includes("testeur"))
    return { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", color: "#fde68a" };
  return { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" };
}

/* ── Composants ──────────────────────────────────────────────────*/
function McHead({ name, size = 36 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const px = size <= 16 ? 16 : size <= 32 ? 32 : 64;
  if (err) return (
    <div style={{ width: size, height: size, borderRadius: 7, background: "rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.45), fontWeight: 800, color: "#c4b5fd", flexShrink: 0 }}>
      {name[0]?.toUpperCase()}
    </div>
  );
  return <img src={`/api/skin/${encodeURIComponent(name)}?s=${px}`} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: 7, imageRendering: "pixelated", flexShrink: 0 }} />;
}

function NationBadge({ nation }: { nation: string }) {
  const [hov, setHov] = useState(false);
  if (!nation) return <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>—</span>;
  const hue = [...nation].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ padding: "2px 7px", borderRadius: 5, cursor: "default", background: `hsl(${hue},45%,22%)`, border: `1px solid hsl(${hue},50%,38%)`, fontSize: 9, fontWeight: 700, color: `hsl(${hue},70%,74%)`, letterSpacing: 0.5, textTransform: "uppercase", userSelect: "none" }}>
        {nation.slice(0, 3)}
      </div>
      {hov && <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "rgba(6,6,16,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", whiteSpace: "nowrap", fontSize: 11, color: "#e2e8f0", pointerEvents: "none", zIndex: 99, boxShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>🌍 {nation}</div>}
    </div>
  );
}

function GradePill({ grade }: { grade: string }) {
  if (!grade) return null;
  const { bg, border, color } = gradeBadge(grade);
  return <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: bg, border: `1px solid ${border}`, color, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{grade}</span>;
}

function StatusBadge({ status }: { status: OnlineStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: c.dot, boxShadow: status === "online" ? `0 0 6px ${c.dot}` : "none" }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: c.dot }}>{c.label}</span>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────────*/
export default function WhitePage() {
  const router = useRouter();
  const [data,       setData]       = useState<ApiData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [search,     setSearch]     = useState("");
  const [searching,  setSearching]  = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/white", { cache: "no-store" });
      const json = await res.json() as ApiData;
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    setSearchDone(false);
    setSearchResult(undefined);
    try {
      const res  = await fetch(`/api/white?search=${encodeURIComponent(q)}`, { cache: "no-store" });
      const json = await res.json() as ApiData;
      setSearchResult(json.searchResult);
    } catch { setSearchResult(null); }
    finally { setSearching(false); setSearchDone(true); }
  };

  const playerCount   = data?.playerCount   ?? null;
  const playerMax     = data?.playerMax     ?? null;
  const serverOpen    = data?.serverOpen    ?? false;
  const serverUnknown = data?.serverUnknown ?? true;
  const todayStats    = data?.today         ?? null;
  const yesterStats   = data?.yesterday     ?? null;
  const maxMin = yesterStats ? (yesterStats.topPlayers[0]?.minutes ?? 1) : 1;

  const serverColor  = serverOpen ? "#22c55e" : serverUnknown ? "#f59e0b" : "#ef4444";
  const serverBg     = serverOpen ? "rgba(34,197,94,0.1)" : serverUnknown ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  const serverBorder = serverOpen ? "rgba(34,197,94,0.35)" : serverUnknown ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)";
  const serverLabel  = loading ? "…" : serverOpen ? "Ouvert" : serverUnknown ? "?" : "Fermé";

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)", color: "white", fontFamily: "'Segoe UI', Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/")}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >← Retour</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>⚔️</span>
            <div>
              <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Serveur White</h1>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>{lastUpdate ? `Actualisé à ${lastUpdate}` : "Chargement…"}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 999, background: serverBg, border: `1px solid ${serverBorder}` }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: serverColor, boxShadow: serverOpen ? `0 0 8px ${serverColor}` : "none" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: serverColor }}>{serverLabel}</span>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: todayStats ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ borderRadius: 14, padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Joueurs connectés</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#a78bfa" }}>
              {loading ? "…" : playerCount !== null ? `${playerCount}${playerMax ? `/${playerMax}` : ""}` : "N/A"}
            </div>
          </div>
          {todayStats && (
            <div style={{ borderRadius: 14, padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Actifs aujourd'hui</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#22c55e" }}>{todayStats.totalPlayers}</div>
            </div>
          )}
          <div style={{ borderRadius: 14, padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Serveur</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>White</div>
          </div>
        </div>

        {/* ── RECHERCHE ── */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: searchDone ? 12 : 24 }}>
          <input ref={inputRef} type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchDone(false); setSearchResult(undefined); }}
            placeholder="Rechercher un joueur par pseudo…"
            style={{ flex: 1, padding: "11px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; e.currentTarget.style.background = "rgba(167,139,250,0.07)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          />
          <button type="submit" disabled={searching || !search.trim()}
            style={{ padding: "11px 20px", borderRadius: 12, background: searching || !search.trim() ? "rgba(167,139,250,0.12)" : "rgba(167,139,250,0.22)", border: "1px solid rgba(167,139,250,0.3)", color: searching || !search.trim() ? "rgba(167,139,250,0.35)" : "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: searching || !search.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {searching ? "…" : "Chercher"}
          </button>
        </form>

        {/* ── RÉSULTAT DE RECHERCHE ── */}
        {searchDone && (
          <div style={{ marginBottom: 24 }}>
            {!searchResult ? (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Joueur introuvable</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
                <McHead name={searchResult.username} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{searchResult.username}</span>
                    {searchResult.grade && <GradePill grade={searchResult.grade} />}
                    {searchResult.isPrime && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fde68a" }}>⭐ Prime</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <NationBadge nation={searchResult.nation} />
                    {searchResult.todayMinutes !== null && (
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Aujourd'hui : <span style={{ color: "#fff", fontWeight: 600 }}>{fmtMin(searchResult.todayMinutes)}</span></span>
                    )}
                    {searchResult.minutesAgo !== null && (
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{fmtAgo(searchResult.minutesAgo)}</span>
                    )}
                    {searchResult.yesterdayMinutes !== null && searchResult.todayMinutes === null && (
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Hier : <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{fmtMin(searchResult.yesterdayMinutes)}</span></span>
                    )}
                    {searchResult.todayMinutes === null && searchResult.yesterdayMinutes === null && (
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Pas de données récentes sur White</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={searchResult.onlineStatus} />
              </div>
            )}
          </div>
        )}

        {/* ── ACTIFS AUJOURD'HUI ── */}
        {todayStats && (
          <div style={{ borderRadius: 18, padding: "18px 16px", marginBottom: 16, background: "rgba(34,197,94,0.02)", border: "1px solid rgba(34,197,94,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>🟢</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Actifs aujourd'hui</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{todayStats.date}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>{todayStats.totalPlayers} joueur{todayStats.totalPlayers > 1 ? "s" : ""}</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 10 }}>Trié par dernière connexion · données Yoxo</div>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 80px 90px", gap: 8, padding: "0 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4, fontSize: 9, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
              <div /><div>Pseudo</div><div>Pays</div><div>Grade</div><div style={{ textAlign: "right" }}>Dernière co</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {todayStats.players.map((p) => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 80px 90px", gap: 8, alignItems: "center", padding: "7px 8px", borderRadius: 10, background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.08)" }}>
                  <McHead name={p.name} size={24} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    {p.isPrime && <span style={{ fontSize: 8, color: "#fde68a" }}>⭐</span>}
                  </div>
                  <NationBadge nation={p.country} />
                  <div>{p.grade ? <GradePill grade={p.grade} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>—</span>}</div>
                  <div style={{ textAlign: "right", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{fmtAgo(p.minutesAgo)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HIER SUR WHITE ── */}
        {yesterStats && (
          <div style={{ borderRadius: 18, padding: "18px 16px", marginBottom: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>📊</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Hier sur White</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{yesterStats.date}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{yesterStats.totalPlayers} joueurs</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 80px 100px", gap: 8, padding: "0 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4, fontSize: 9, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
              <div /><div>Pseudo</div><div>Pays</div><div>Grade</div><div style={{ textAlign: "right" }}>Temps</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {yesterStats.topPlayers.map((p, i) => {
                const pct = Math.round((p.minutes / maxMin) * 100);
                return (
                  <div key={p.name} style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 80px 100px", gap: 8, alignItems: "center", padding: "7px 8px", borderRadius: 10, background: i === 0 ? "rgba(167,139,250,0.06)" : "rgba(255,255,255,0.015)", border: `1px solid ${i === 0 ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)"}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, borderRadius: 10, background: "rgba(255,255,255,0.015)", pointerEvents: "none" }} />
                    <McHead name={p.name} size={24} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
                      {i === 0 && <span style={{ fontSize: 10 }}>🥇</span>}
                      {i === 1 && <span style={{ fontSize: 10 }}>🥈</span>}
                      {i === 2 && <span style={{ fontSize: 10 }}>🥉</span>}
                      <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      {p.isPrime && <span style={{ fontSize: 8, color: "#fde68a" }}>⭐</span>}
                    </div>
                    <div style={{ position: "relative" }}><NationBadge nation={p.country} /></div>
                    <div style={{ position: "relative" }}>{p.grade ? <GradePill grade={p.grade} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>—</span>}</div>
                    <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: i === 0 ? "#c4b5fd" : "rgba(255,255,255,0.65)", position: "relative" }}>{fmtMin(p.minutes)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center" }}>Données Yoxo · finalisées la nuit précédente</div>
          </div>
        )}

        {!todayStats && !yesterStats && !loading && (
          <div style={{ borderRadius: 14, padding: "20px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            📊 Les données Yoxo s&apos;afficheront ici dès qu&apos;elles seront disponibles
          </div>
        )}

        <div style={{ marginTop: 16, borderRadius: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          Actualisé toutes les 30 secondes · NationsGlory API + Yoxo
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <McHead name="ixtazzking" size={16} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>Développé par <span style={{ color: "rgba(167,139,250,0.65)", fontWeight: 600 }}>ixtazzking</span></span>
        </div>
        <button onClick={() => router.push("/staff")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 9, color: "rgba(167,139,250,0.5)", textDecoration: "underline" }}>Suivi staff →</button>
      </div>
    </main>
  );
}
