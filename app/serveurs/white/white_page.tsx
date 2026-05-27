"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const GRADE_STYLE: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "rgba(239,68,68,0.12)",   border: "#ef4444", text: "#fca5a5" },
  2: { bg: "rgba(30,64,175,0.15)",   border: "#1e40af", text: "#93b4f5" },
  3: { bg: "rgba(22,101,52,0.15)",   border: "#166534", text: "#6dbb8a" },
  4: { bg: "rgba(34,197,94,0.12)",   border: "#16a34a", text: "#86efac" },
  5: { bg: "rgba(134,239,172,0.1)",  border: "#4ade80", text: "#bbf7d0" },
};

function gradeStyle(level: number) {
  return GRADE_STYLE[level] ?? { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", text: "#ccc" };
}

/* Tête Minecraft — proxifiée via /api/skin pour éviter le blocage CORS de skins.nationsglory.fr */
function McHead({ name, size = 32 }: { name: string; src?: string; size?: number }) {
  const [err, setErr] = useState(false);
  const px = size <= 16 ? 16 : size <= 32 ? 32 : 64;
  const imgSrc = `/api/skin/${encodeURIComponent(name)}?s=${px}`;
  if (err) return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: "rgba(124,58,237,0.25)", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: Math.round(size * 0.4), fontWeight: 800,
      color: "#c4b5fd", flexShrink: 0,
    }}>
      {name[0]?.toUpperCase()}
    </div>
  );
  return (
    <img src={imgSrc} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: 6, imageRendering: "pixelated", flexShrink: 0 }} />
  );
}

/* Logo image avec fallback silencieux */
function Img({ src, size = 18 }: { src: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
}

/* Badge nation avec tooltip */
function NationBadge({ nation }: { nation: string }) {
  const [hov, setHov] = useState(false);
  if (!nation) return <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 10 }}>—</span>;
  const hue = [...nation].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          padding: "2px 7px", borderRadius: 4, cursor: "default",
          background: `hsl(${hue},48%,26%)`, border: `1px solid hsl(${hue},48%,40%)`,
          fontSize: 9, fontWeight: 700, color: `hsl(${hue},70%,75%)`,
          letterSpacing: 0.5, textTransform: "uppercase", userSelect: "none",
        }}
      >
        {nation.slice(0, 3)}
      </div>
      {hov && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 5px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(6,6,16,0.97)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 7, padding: "4px 10px", whiteSpace: "nowrap",
          fontSize: 10, color: "#e2e8f0", pointerEvents: "none", zIndex: 99,
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}>
          🌍 {nation}
        </div>
      )}
    </div>
  );
}

/* Pill statut */
function StatusPill({ online }: { online: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 999,
      background: online ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${online ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", display: "inline-block",
        background: online ? "#22c55e" : "rgba(255,255,255,0.18)",
        boxShadow: online ? "0 0 6px #22c55e" : "none",
      }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: online ? "#22c55e" : "rgba(255,255,255,0.28)", whiteSpace: "nowrap" }}>
        {online ? "En ligne" : "Hors ligne"}
      </span>
    </div>
  );
}

export default function WhiteDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/servers", { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  const playerCount: number | null = data?.playerCount ?? null;
  const playerMax: number | null = data?.playerMax ?? null;
  const serverOpen = playerCount !== null;
  const staff: any[] = data?.staff ?? [];
  const onlinePlayers: any[] = data?.onlinePlayers ?? [];
  const onlineStaff = staff.filter((s) => s.online);

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)",
      color: "white", fontFamily: "'Segoe UI', Arial, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/")} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "7px 14px", color: "rgba(255,255,255,0.6)",
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            ← Retour
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <Img src="/logos/serveurwhite.png" size={30} />
            <div>
              <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Serveur White</h1>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                {lastUpdate ? `Actualisé à ${lastUpdate}` : "Chargement…"}
              </p>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999,
            background: serverOpen ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${serverOpen ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: serverOpen ? "#22c55e" : "#ef4444", boxShadow: serverOpen ? "0 0 8px #22c55e" : "none" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: serverOpen ? "#22c55e" : "#ef4444" }}>
              {loading ? "…" : serverOpen ? "Ouvert" : "Fermé"}
            </span>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "👥", label: "Joueurs connectés", value: loading ? "…" : playerCount !== null ? `${playerCount}${playerMax ? `/${playerMax}` : ""}` : "N/A", color: "#a78bfa" },
            { icon: "🛡️", label: "Staff en ligne",    value: loading ? "…" : `${onlineStaff.length} / ${staff.length}`, color: "#22c55e" },
            { logoSrc: "/logos/serveurwhite.png", label: "Serveur", value: "White", color: "#ffffff" },
          ].map((c: any, i) => (
            <div key={i} style={{ borderRadius: 14, padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ height: 24, display: "flex", alignItems: "center", marginBottom: 4 }}>
                {c.logoSrc ? <Img src={c.logoSrc} size={22} /> : <span style={{ fontSize: 18 }}>{c.icon}</span>}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.color, letterSpacing: "-0.5px" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* ── JOUEURS EN LIGNE (seulement si des joueurs sont trackés et online) ── */}
        {(onlinePlayers.length > 0 || (!loading && data?.onlinePlayers !== undefined)) && (
          <div style={{ borderRadius: 18, padding: "18px 16px", marginBottom: 16, background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>👥</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Joueurs en ligne</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                {onlinePlayers.length} connecté{onlinePlayers.length > 1 ? "s" : ""}
              </span>
            </div>

            {onlinePlayers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                Aucun joueur suivi connecté en ce moment
              </div>
            ) : (
              <>
                {/* En-têtes */}
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px", gap: 10, padding: "0 10px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 6, fontSize: 9, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                  <div />
                  <div>Pseudo</div>
                  <div>Nation</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {onlinePlayers.map((p: any, i: number) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                      <McHead name={p.username} src={p.skinHead} size={32} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.username}</span>
                      <NationBadge nation={p.nation} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STAFF WHITE ── */}
        <div style={{ borderRadius: 18, padding: "18px 16px", marginBottom: 16, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Img src="/logos/serveurwhite.png" size={18} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Staff White</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              {onlineStaff.length} en ligne
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Chargement…</div>
          ) : staff.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
              Ajoute des pseudos dans <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>api/servers/route.ts</code> → STAFF_LIST
            </div>
          ) : (
            <>
              {/* En-têtes colonnes */}
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 140px 90px", gap: 10, alignItems: "center", padding: "0 10px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 6, fontSize: 9, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                <div />
                <div>Pseudo</div>
                <div>Grade</div>
                <div style={{ textAlign: "right" }}>Statut</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {staff.map((s: any, i: number) => {
                  const gs = gradeStyle(s.gradeLevel);
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "28px 1fr 140px 90px", gap: 10, alignItems: "center",
                      padding: "9px 10px", borderRadius: 11,
                      background: s.online ? "rgba(34,197,94,0.04)" : "rgba(0,0,0,0.2)",
                      border: `1px solid ${s.online ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.04)"}`,
                    }}>
                      {/* Logo grade */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {s.logo
                          ? <Img src={`/logos/${s.logo}`} size={20} />
                          : <span style={{ fontSize: 14 }}>👤</span>
                        }
                      </div>

                      {/* Pseudo */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <McHead name={s.username} src={s.skinHead} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.username}</span>
                      </div>

                      {/* Grade pill */}
                      <div>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                          background: gs.bg, border: `1px solid ${gs.border}30`, color: gs.text,
                          letterSpacing: 0.3,
                        }}>
                          {s.grade}
                        </span>
                      </div>

                      {/* Statut */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <StatusPill online={s.online} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          Données actualisées toutes les 15 secondes via l'API NationsGlory
        </div>
      </div>

      {/* Signature */}
      <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <McHead name="ixtazzking" size={16} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
            Développé par <span style={{ color: "rgba(167,139,250,0.65)", fontWeight: 600 }}>ixtazzking</span>
          </span>
        </div>
        <button onClick={() => router.push("/parcours")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 9, color: "rgba(167,139,250,0.5)", textDecoration: "underline" }}>
          Voir le parcours →
        </button>
      </div>
    </main>
  );
}