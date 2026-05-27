"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAYERS } from "@/lib/staff-config";

/* Tête carrée NationsGlory (pas ronde — c'est une head, pas une photo de profil) */
function NgHead({ username, size }: { username: string; size: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6,
        background: "rgba(74,124,89,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.45), fontWeight: 700, color: "#7eb895",
        flexShrink: 0, imageRendering: "pixelated",
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

function hexRgb(hex: string): string {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

export default function StaffHome() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)",
      color: "#fff",
      fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grille */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 2, padding: "22px 28px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "7px 14px",
            color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
        >← Retour</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Suivi Staff</span>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>White</span>
      </header>

      {/* Contenu */}
      <div style={{
        position: "relative", zIndex: 1, flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 24px 80px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
            color: "rgba(78,160,107,0.7)", marginBottom: 12, fontWeight: 500, margin: "0 0 12px",
          }}>Activité hebdomadaire</p>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 800,
            letterSpacing: "-1.2px", margin: "0 0 10px", lineHeight: 1.2,
            background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Modérateurs White</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Suivi du temps de connexion par semaine
          </p>
        </div>

        {/* Cartes */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
          {PLAYERS.map(player => {
            const hov = hovered === player.username;
            return (
              <div
                key={player.username}
                onMouseEnter={() => setHovered(player.username)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/staff/${player.username}`)}
                style={{
                  width: "min(280px, calc(100vw - 48px))",
                  padding: "20px 18px", borderRadius: 12,
                  background: hov ? `rgba(${hexRgb(player.gradeColor)},0.07)` : "rgba(255,255,255,0.025)",
                  border: `1px solid ${hov ? player.gradeColor+"50" : "rgba(255,255,255,0.06)"}`,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  transform: hov ? "translateY(-5px)" : "none",
                  boxShadow: hov ? `0 20px 50px rgba(${hexRgb(player.gradeColor)},0.12)` : "none",
                  display: "flex", alignItems: "center", gap: 14,
                  position: "relative", overflow: "hidden",
                }}
              >
                {hov && (
                  <div style={{
                    position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
                    width: 200, height: 160,
                    background: `radial-gradient(ellipse, rgba(${hexRgb(player.gradeColor)},0.12), transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                )}

                {/* Tête NationsGlory — carrée */}
                <div style={{
                  flexShrink: 0,
                  border: `2px solid ${hov ? player.gradeColor : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8, transition: "border-color 0.25s",
                  overflow: "hidden",
                  position: "relative", zIndex: 1,
                }}>
                  <NgHead username={player.username} size={52} />
                </div>

                {/* Infos */}
                <div style={{ flex: 1, textAlign: "left", position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>
                    {player.username}
                  </div>
                  <div style={{
                    display: "inline-block", fontSize: 9, fontWeight: 600,
                    padding: "2px 8px", borderRadius: 4,
                    background: player.gradeBg, border: `1px solid ${player.gradeColor}35`,
                    color: player.gradeTextColor, letterSpacing: 0.5,
                    textTransform: "uppercase", marginBottom: 12,
                  }}>
                    {player.grade}
                  </div>
                  <br />
                  <div style={{
                    display: "inline-block", fontSize: 11, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 6,
                    background: hov ? player.gradeColor : "rgba(255,255,255,0.06)",
                    color: hov ? "#fff" : "rgba(255,255,255,0.45)",
                    transition: "all 0.2s", letterSpacing: 0.3,
                  }}>
                    Voir le profil →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
