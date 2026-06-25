"use client";

import { useEffect, useState } from "react";

/* ════════════════════════════════════════════════════════════════
   TYPES & THÈMES
   ════════════════════════════════════════════════════════════════ */

export type Role = {
  title: string;
  startDate: string; // "AAAA-MM-JJ HH:MM"
  endDate: string | null; // null = en cours
  active: boolean;
  icon: string; // image dans /public/logos/
};

export type Country = {
  name: string;
  flag: string;
  mark?: { logo: string; label: string; date: string };
  current?: boolean;
};

export type Section = { title: string; icon: string; roles: Role[] };

export type Theme = {
  bg: string;
  halo: string;
  frameBorder: string;
  frameGlow: string;
  accent: string; // texte sous-titre / footer (rgba)
  accentSolid: string; // point "." + bordure tooltip (hex)
  soft: string; // fond léger accent (rgba ~0.1)
  hoverBorder: string;
  fallbackBg: string;
  fallbackText: string;
};

export const THEMES: Record<"purple" | "blue", Theme> = {
  purple: {
    bg: "radial-gradient(ellipse at top, #0e0720 0%, #000000 62%)",
    halo: "rgba(124,58,237,0.22)",
    frameBorder: "rgba(167,139,250,0.25)",
    frameGlow: "rgba(124,58,237,0.25)",
    accent: "rgba(167,139,250,0.8)",
    accentSolid: "#a78bfa",
    soft: "rgba(167,139,250,0.1)",
    hoverBorder: "rgba(167,139,250,0.3)",
    fallbackBg: "rgba(167,139,250,0.15)",
    fallbackText: "#c4b5fd",
  },
  blue: {
    bg: "radial-gradient(ellipse at top, #061634 0%, #000000 62%)",
    halo: "rgba(37,99,235,0.24)",
    frameBorder: "rgba(96,165,250,0.3)",
    frameGlow: "rgba(37,99,235,0.3)",
    accent: "rgba(96,165,250,0.85)",
    accentSolid: "#60a5fa",
    soft: "rgba(96,165,250,0.1)",
    hoverBorder: "rgba(96,165,250,0.3)",
    fallbackBg: "rgba(96,165,250,0.15)",
    fallbackText: "#93c5fd",
  },
};

export type ProfileConfig = {
  username: string;
  subtitle: string;
  theme: Theme;
  sections: Section[];
  rp?: { title: string; icon: string; message: string };
  countries: Country[];
  otherHref: string; // cible du point "." en haut à droite
};

/* ════════════════════════════════════════════════════════════════
   CALCULS DE DURÉE
   ════════════════════════════════════════════════════════════════ */

const MS_PER_DAY = 86_400_000;

function daysBetween(startMs: number, endMs: number): number {
  return Math.max(0, Math.floor((endMs - startMs) / MS_PER_DAY));
}

function breakdown(startMs: number, endMs: number) {
  const s = new Date(startMs);
  const e = new Date(endMs);
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();
  const startMin = s.getHours() * 60 + s.getMinutes();
  const endMin = e.getHours() * 60 + e.getMinutes();
  if (endMin < startMin) days -= 1;
  if (days < 0) {
    days += new Date(e.getFullYear(), e.getMonth(), 0).getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
}

const plural = (n: number, sing: string, plur: string) =>
  `${n} ${n > 1 ? plur : sing}`;

function sectionTotal(roles: Role[], now: number) {
  const starts = roles.map((r) => new Date(r.startDate).getTime());
  const earliest = Math.min(...starts);
  const anyActive = roles.some((r) => r.active || !r.endDate);
  const end = anyActive
    ? now
    : Math.max(...roles.map((r) => new Date(r.endDate as string).getTime()));
  return { ...breakdown(earliest, end), totalDays: daysBetween(earliest, end) };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
    d.getHours()
  )}h${p(d.getMinutes())}`;
}

/* ════════════════════════════════════════════════════════════════
   PETITS COMPOSANTS
   ════════════════════════════════════════════════════════════════ */

function SkinHead({
  username,
  size,
  theme,
}: {
  username: string;
  size: number;
  theme: Theme;
}) {
  const sources = [
    `https://skins.nationsglory.fr/face/${username}/${size * 2}`,
    `https://minotar.net/helm/${username}/${size * 2}.png`,
    `https://mc-heads.net/avatar/${username}/${size * 2}`,
  ];
  const [idx, setIdx] = useState(0);

  if (idx >= sources.length) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: theme.fallbackBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.45,
          fontWeight: 400,
          color: theme.fallbackText,
        }}
      >
        {username[0].toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt={username}
      onError={() => setIdx((i) => i + 1)}
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        imageRendering: "pixelated",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function RoleIcon({ src, alt, size }: { src: string; alt: string; size: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          background: "rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          fontWeight: 400,
          color: "rgba(255,255,255,0.55)",
          flexShrink: 0,
        }}
      >
        {alt[0]}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 999,
          background: "rgba(22,163,74,0.12)",
          border: "1px solid rgba(22,163,74,0.4)",
          color: "#16a34a",
          fontSize: 11,
          fontWeight: 400,
        }}
      >
        <span
          className="pulse-dot"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#16a34a",
            boxShadow: "0 0 6px #16a34a",
          }}
        />
        Actif
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
        fontWeight: 400,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.3)",
        }}
      />
      Terminé
    </span>
  );
}

function CountryFlag({ src, name }: { src: string; name: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    const img = new window.Image();
    img.onload = () => {
      if (alive) setOk(true);
    };
    img.onerror = () => {
      if (alive) setOk(false);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  if (ok) {
    return (
      <img
        src={src}
        alt=""
        style={{
          height: 16,
          width: "auto",
          borderRadius: 3,
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 16,
        minWidth: 24,
        padding: "0 5px",
        borderRadius: 3,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontSize: 9,
        letterSpacing: 0.5,
        color: "rgba(255,255,255,0.6)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE PROFIL (réutilisable)
   ════════════════════════════════════════════════════════════════ */

export default function Profile({ config }: { config: ProfileConfig }) {
  const { username, subtitle, theme, sections, rp, countries, otherHref } = config;

  const [now, setNow] = useState<number>(() => Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const titleStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: 0,
    fontFamily: "var(--font-title), Arial, sans-serif",
    fontSize: isMobile ? 23 : 29,
    fontWeight: 600,
    letterSpacing: "-0.5px",
  };

  const dayBadgeStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 400,
    whiteSpace: "nowrap",
    background: active ? "rgba(34,197,94,0.13)" : "rgba(168,85,247,0.13)",
    border: active ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(168,85,247,0.4)",
    color: active ? "#4ade80" : "#c084fc",
  });

  const empty =
    sections.length === 0 && !rp && countries.length === 0;

  return (
    <main
      style={
        {
          minHeight: "100vh",
          background: theme.bg,
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
          ["--accent"]: theme.accentSolid,
        } as React.CSSProperties
      }
    >
      {/* Grille de fond discrète */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Halo derrière l'en-tête */}
      <div
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 560,
          height: 360,
          background: `radial-gradient(ellipse, ${theme.halo}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Point "." discret en haut à droite → autre profil */}
      <a
        href={otherHref}
        aria-label="Autre profil"
        className="dot-link"
        style={{
          position: "fixed",
          top: 16,
          right: 18,
          zIndex: 6,
          display: "block",
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          transition: "all 0.2s",
          cursor: "pointer",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 780,
          margin: "0 auto",
          padding: isMobile ? "44px 16px 80px" : "64px 24px 110px",
        }}
      >
        {/* ─────────── EN-TÊTE ─────────── */}
        <header
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: isMobile ? 40 : 56,
          }}
        >
          <div
            style={{
              padding: 7,
              borderRadius: 22,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.frameBorder}`,
              boxShadow: `0 10px 40px ${theme.frameGlow}`,
              marginBottom: 20,
            }}
          >
            <SkinHead username={username} size={isMobile ? 88 : 104} theme={theme} />
          </div>

          <h1
            style={{
              fontSize: isMobile ? 38 : 52,
              fontWeight: 400,
              letterSpacing: "-1.5px",
              margin: 0,
              lineHeight: 1,
              background:
                "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {username}
          </h1>

          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: theme.accent,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </p>
        </header>

        {/* ─────────── SECTIONS ─────────── */}
        {sections.map((section, si) => {
          const total = sectionTotal(section.roles, now);
          const totalBadges = [
            plural(total.years, "an", "ans"),
            `${total.months} mois`,
            plural(total.days, "jour", "jours"),
          ];

          return (
            <section
              key={section.title}
              className="fade-in"
              style={{
                borderRadius: 20,
                padding: isMobile ? 16 : 24,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                marginBottom: 22,
                animationDelay: `${0.08 * (si + 1)}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <h2 style={titleStyle}>
                  <RoleIcon src={section.icon} alt={section.title} size={24} />
                  {section.title}
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.3)",
                      letterSpacing: 0,
                      marginLeft: -4,
                    }}
                  >
                    ({total.totalDays}j)
                  </span>
                </h2>

                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {totalBadges.map((txt) => (
                    <span
                      key={txt}
                      style={{
                        padding: "4px 11px",
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 400,
                        background: "rgba(234,179,8,0.1)",
                        border: "1px solid rgba(234,179,8,0.35)",
                        color: "#facc15",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {txt}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {section.roles.map((role, ri) => {
                  const startMs = new Date(role.startDate).getTime();
                  const endMs = role.endDate ? new Date(role.endDate).getTime() : now;
                  const days = daysBetween(startMs, endMs);
                  const key = `${si}-${ri}`;
                  const isHover = hovered === key;

                  return (
                    <div
                      key={key}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        justifyContent: "space-between",
                        gap: isMobile ? 10 : 14,
                        padding: isMobile ? "13px 14px" : "13px 16px",
                        borderRadius: 13,
                        background: isHover
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.28)",
                        border: `1px solid ${
                          isHover ? theme.hoverBorder : "rgba(255,255,255,0.05)"
                        }`,
                        transform: isHover && !isMobile ? "translateX(4px)" : "none",
                        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                          flexWrap: "wrap",
                          minWidth: 0,
                        }}
                      >
                        <RoleIcon src={role.icon} alt={role.title} size={26} />
                        <span style={{ fontSize: 14.5, fontWeight: 400 }}>
                          {role.title}
                        </span>
                        <StatusBadge active={role.active} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11.5,
                            color: role.endDate ? "#c084fc" : "#4ade80",
                          }}
                        >
                          {formatDate(role.startDate)}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>→</span>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: role.endDate ? "#c084fc" : "#4ade80",
                          }}
                        >
                          {role.endDate ? formatDate(role.endDate) : "en cours"}
                        </span>
                        <span style={dayBadgeStyle(role.active)}>
                          {plural(days, "jour", "jours")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ─────────── ROLEPLAY (optionnel) ─────────── */}
        {rp && (
          <section
            className="fade-in"
            style={{
              borderRadius: 20,
              padding: isMobile ? 16 : 24,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 22,
              animationDelay: `${0.08 * (sections.length + 1)}s`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <h2 style={titleStyle}>
                <RoleIcon src={rp.icon} alt={rp.title} size={24} />
                {rp.title}
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: 0,
                    marginLeft: -4,
                  }}
                >
                  (0j)
                </span>
              </h2>

              <span
                style={{
                  padding: "4px 11px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  background: theme.soft,
                  border: `1px solid ${theme.frameBorder}`,
                  color: theme.fallbackText,
                  whiteSpace: "nowrap",
                }}
              >
                Bientôt
              </span>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: 13,
                background: "rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.05)",
                textAlign: "center",
                fontSize: 13,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {rp.message}
            </div>
          </section>
        )}

        {/* ─────────── PLACEHOLDER (profil vide) ─────────── */}
        {empty && (
          <div
            className="fade-in"
            style={{
              borderRadius: 20,
              padding: "28px 24px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              textAlign: "center",
              fontSize: 14,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Parcours bientôt disponible…
          </div>
        )}

        {/* ─────────── NATIONS / EMPIRES (discret) ─────────── */}
        {countries.length > 0 && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 9,
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              {countries.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <CountryFlag src={c.flag} name={c.name} />
                  <span>{c.name}</span>
                  {c.mark && (
                    <span className="natmark">
                      <img
                        src={c.mark.logo}
                        alt={c.mark.label}
                        style={{ height: 25, width: "auto", display: "block" }}
                      />
                      <span className="natmark-tip">
                        {c.mark.label} · {c.mark.date}
                      </span>
                    </span>
                  )}
                  {c.current && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "rgba(74,222,128,0.7)",
                        fontSize: 10.5,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#4ade80",
                          boxShadow: "0 0 5px #4ade80",
                        }}
                      />
                      Actuel
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── PIED DE PAGE ─────────── */}
        <footer
          style={{
            marginTop: 36,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <SkinHead username="ixtazzking" size={18} theme={theme} />
          <span>
            Développé par{" "}
            <span style={{ color: theme.accent }}>ixtazzking</span>
          </span>
        </footer>
      </div>

      {/* Signature discrète */}
      <div
        style={{
          position: "fixed",
          bottom: 14,
          right: 16,
          fontSize: 11,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.2)",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 5,
        }}
      >
        ᴅ.ɪ.ᴠ
      </div>

      {/* Animations + styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.15; }
        }
        .pulse-dot { animation: pulse 1.5s ease-in-out infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
        }

        .dot-link:hover {
          background: var(--accent) !important;
          box-shadow: 0 0 10px var(--accent);
          transform: scale(1.25);
        }

        .natmark { position: relative; display: inline-flex; align-items: center; cursor: help; }
        .natmark-tip {
          position: absolute;
          bottom: calc(100% + 7px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: rgba(12,14,28,0.96);
          border: 1px solid var(--accent);
          color: #eef2ff;
          font-family: Arial, sans-serif;
          font-size: 10.5px;
          padding: 4px 9px;
          border-radius: 7px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity .18s, transform .18s;
          box-shadow: 0 8px 24px rgba(0,0,0,0.45);
          z-index: 30;
        }
        .natmark:hover .natmark-tip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in { animation: none; opacity: 1; }
          .pulse-dot { animation: none; }
        }
      `}</style>
    </main>
  );
}
