"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── CONFIG SERVEURS ─────────────────────────────────────────
   Pour ajouter un serveur : copie une ligne et change les valeurs.
   - id       : le nom dans l'URL (ex: /serveurs/white)
   - name     : ce qui s'affiche sur la carte
   - color    : la couleur principale de la carte
   - logo     : chemin vers l'image dans public/logos/
   - available: true = cliquable, false = grisé "bientôt"
   ────────────────────────────────────────────────────────────── */
const servers = [
  {
    id: "white",
    name: "White",
    color: "#ffffff",
    glow: "rgba(255,255,255,0.25)",
    logo: "/logos/serveurwhite.png",
    description: "Serveur principal",
    available: true,
  },
  {
    id: "blue",
    name: "Blue",
    color: "#378add",
    glow: "rgba(55,138,221,0.3)",
    logo: "/logos/serveurblue.png",
    description: "Bientôt disponible",
    available: false,
  },
  {
    id: "gold",
    name: "Gold",
    color: "#ef9f27",
    glow: "rgba(239,159,39,0.3)",
    logo: "/logos/serveurgold.png",
    description: "Bientôt disponible",
    available: false,
  },
];

export default function Home() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)",
        color: "white",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Grille de fond ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          pointerEvents: "none",
        }}
      />

      {/* ── Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img
          src="/logos/nationsglory.png"
          alt="NationsGlory"
          style={{ width: 30, height: 30, objectFit: "contain" }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <span style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          NationsGlory
        </span>
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          Dashboard informatif
        </span>
      </header>

      {/* ── Contenu central ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 24px 80px",
        }}
      >
        {/* Bouton Suivi Staff */}
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/staff")}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,107,60,0.15)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a6b3c80";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 30px rgba(26,107,60,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "10px 22px",
              color: "rgba(255,255,255,0.6)", fontSize: 13,
              cursor: "pointer", transition: "all 0.25s",
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                display: "inline-block", flexShrink: 0,
              }}
            />
            <span>Suivi Staff White</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>→</span>
          </button>
        </div>

        {/* Titre */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(167,139,250,0.7)",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            Sélectionne ton serveur
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              margin: 0,
              lineHeight: 1.15,
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Quel serveur veux-tu
            <br />
            consulter ?
          </h1>
        </div>

        {/* ── Cartes serveurs ── */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 700,
          }}
        >
          {servers.map((s) => {
            const isHovered = hovered === s.id;
            const hasLogo = !imgErrors[s.id];
            const dimmed = !s.available;

            return (
              <div
                key={s.id}
                onClick={() => s.available && router.push(`/serveurs/${s.id}`)}
                onMouseEnter={() => s.available && setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 190,
                  borderRadius: 20,
                  padding: "26px 20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  position: "relative",
                  overflow: "hidden",
                  cursor: s.available ? "pointer" : "default",
                  opacity: dimmed ? 0.35 : 1,
                  background: isHovered
                    ? `rgba(${hexToRgb(s.color)}, 0.1)`
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    isHovered
                      ? `rgba(${hexToRgb(s.color)}, 0.5)`
                      : "rgba(255,255,255,0.07)"
                  }`,
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: isHovered
                    ? "translateY(-6px) scale(1.03)"
                    : "translateY(0) scale(1)",
                  boxShadow: isHovered
                    ? `0 20px 60px ${s.glow}`
                    : "none",
                }}
              >
                {/* Halo au hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      top: -50,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 180,
                      height: 180,
                      background: `radial-gradient(ellipse, ${s.glow}, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Logo ou lettre de fallback */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `rgba(${hexToRgb(s.color)}, 0.08)`,
                    border: `1px solid rgba(${hexToRgb(s.color)}, 0.2)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {hasLogo ? (
                    <img
                      src={s.logo}
                      alt={s.name}
                      style={{ width: 44, height: 44, objectFit: "contain" }}
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [s.id]: true }))
                      }
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: s.color,
                        opacity: 0.7,
                      }}
                    >
                      {s.name[0]}
                    </span>
                  )}
                </div>

                {/* Nom + description */}
                <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: "-0.5px",
                      color: dimmed ? "rgba(255,255,255,0.5)" : s.color,
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 3,
                    }}
                  >
                    {s.description}
                  </div>
                </div>

                {/* Flèche */}
                {s.available && (
                  <div
                    style={{
                      fontSize: 16,
                      color: `rgba(${hexToRgb(s.color)}, 0.6)`,
                      transition: "transform 0.25s",
                      transform: isHovered ? "translateX(5px)" : "translateX(0)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Signature en bas à droite ── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <img
            src="https://mc-heads.net/avatar/ixtazzking/24"
            alt="ixtazzking"
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              imageRendering: "pixelated",
            }}
          />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Développé par{" "}
            <span style={{ color: "rgba(167,139,250,0.7)", fontWeight: 600 }}>
              ixtazzking
            </span>
          </span>
        </div>
        <button
          onClick={() => router.push("/parcours")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 10,
            color: "rgba(167,139,250,0.55)",
            textDecoration: "underline",
            textDecorationColor: "rgba(167,139,250,0.3)",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = "rgba(167,139,250,1)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = "rgba(167,139,250,0.55)")
          }
        >
          Voir le parcours →
        </button>
      </div>
    </main>
  );
}

/* ── Utilitaire : convertit "#ffffff" en "255,255,255" ── */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}