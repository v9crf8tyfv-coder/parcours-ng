"use client";

import { useEffect, useState } from "react";

/* ════════════════════════════════════════════════════════════════
   DONNÉES — Modifie uniquement ce bloc pour ajouter / changer un rôle.

   Chaque rôle :
     title      : nom affiché
     startDate  : "AAAA-MM-JJ HH:MM"
     endDate    : "AAAA-MM-JJ HH:MM"  ou  null  (= en cours)
     active     : true = badge vert "Actif"   /   false = "Terminé"
     icon       : chemin d'une image dans /public/logos/
   ════════════════════════════════════════════════════════════════ */

type Role = {
  title: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  icon: string;
};

const staffRoles: Role[] = [
  {
    title: "Modérateur Test White",
    startDate: "2025-07-06 18:34",
    endDate: "2025-08-17 17:40",
    active: false,
    icon: "/logos/modo_test.png",
  },
  {
    title: "Modérateur Confirmé",
    startDate: "2025-08-17 17:40",
    endDate: "2026-05-03 21:39",
    active: false,
    icon: "/logos/modo.png",
  },
  {
    title: "Modérateur Réserviste",
    startDate: "2026-05-03 21:39",
    endDate: null,
    active: true,
    icon: "/logos/modo.png",
  },
];

const journalismRoles: Role[] = [
  {
    title: "Journaliste White",
    startDate: "2025-08-03 17:12",
    endDate: null,
    active: true,
    icon: "/logos/journal.png",
  },
  {
    title: "Journaliste Indépendant",
    startDate: "2025-09-22 00:00",
    endDate: null,
    active: true,
    icon: "/logos/journal.png",
  },
  {
    title: "Communication White",
    startDate: "2026-05-30 18:46",
    endDate: null,
    active: true,
    icon: "/logos/white.png",
  },
];

const sections = [
  { title: "Staff White", icon: "/logos/white.png", roles: staffRoles },
  { title: "Journalisme", icon: "/logos/journal.png", roles: journalismRoles },
];

const PROFILE = {
  username: "ixtazzking",
  subtitle: "Parcours NationsGlory White",
};

/* ════════════════════════════════════════════════════════════════
   CALCULS DE DURÉE — automatiques, mis à jour avec le temps.
   ════════════════════════════════════════════════════════════════ */

const MS_PER_DAY = 86_400_000;

/** Nombre de jours exacts entre deux instants. */
function daysBetween(startMs: number, endMs: number): number {
  return Math.max(0, Math.floor((endMs - startMs) / MS_PER_DAY));
}

/** Décompose une durée en années / mois / jours (calendrier réel). */
function breakdown(startMs: number, endMs: number) {
  const s = new Date(startMs);
  const e = new Date(endMs);

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();

  // Si l'heure de fin est avant l'heure de début, le jour n'est pas complet.
  const startMin = s.getHours() * 60 + s.getMinutes();
  const endMin = e.getHours() * 60 + e.getMinutes();
  if (endMin < startMin) days -= 1;

  if (days < 0) {
    // Emprunte les jours du mois précédent la date de fin.
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

/** Total d'une section : du tout premier rôle jusqu'à aujourd'hui. */
function sectionTotal(roles: Role[], now: number) {
  const starts = roles.map((r) => new Date(r.startDate).getTime());
  const earliest = Math.min(...starts);
  const anyActive = roles.some((r) => r.active || !r.endDate);
  const end = anyActive
    ? now
    : Math.max(...roles.map((r) => new Date(r.endDate as string).getTime()));
  return breakdown(earliest, end);
}

/** "2025-07-06 18:34" → "06/07/2025 18h34" */
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

/** Tête de skin NationsGlory, avec sources de secours. */
function SkinHead({ size }: { size: number }) {
  const sources = [
    `https://skins.nationsglory.fr/face/${PROFILE.username}/${size * 2}`,
    `https://minotar.net/helm/${PROFILE.username}/${size * 2}.png`,
    `https://mc-heads.net/avatar/${PROFILE.username}/${size * 2}`,
  ];
  const [idx, setIdx] = useState(0);

  if (idx >= sources.length) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: "rgba(167,139,250,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.45,
          fontWeight: 800,
          color: "#c4b5fd",
        }}
      >
        {PROFILE.username[0].toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt={PROFILE.username}
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

/** Icône de rôle, avec repli sur une lettre si l'image manque. */
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
          fontWeight: 700,
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

/** Badge de statut Actif / Terminé. */
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
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.4)",
          color: "#4ade80",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <span
          className="pulse-dot"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px #22c55e",
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
        fontWeight: 600,
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

/* ════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [now, setNow] = useState<number>(() => Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // Recalcule l'heure courante : les compteurs avancent tout seuls.
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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0e0720 0%, #000000 62%)",
        color: "#fff",
        fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
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
      {/* Halo violet derrière l'en-tête */}
      <div
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 560,
          height: 360,
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.22), transparent 70%)",
          pointerEvents: "none",
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
              border: "1px solid rgba(167,139,250,0.25)",
              boxShadow: "0 10px 40px rgba(124,58,237,0.25)",
              marginBottom: 20,
            }}
          >
            <SkinHead size={isMobile ? 88 : 104} />
          </div>

          <h1
            style={{
              fontSize: isMobile ? 38 : 52,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              margin: 0,
              lineHeight: 1,
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {PROFILE.username}
          </h1>

          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(167,139,250,0.8)",
              fontWeight: 500,
            }}
          >
            {PROFILE.subtitle}
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
              {/* Titre + totaux */}
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
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    margin: 0,
                    fontSize: isMobile ? 19 : 23,
                    fontWeight: 700,
                    letterSpacing: "-0.4px",
                  }}
                >
                  <RoleIcon src={section.icon} alt={section.title} size={24} />
                  {section.title}
                </h2>

                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {totalBadges.map((txt) => (
                    <span
                      key={txt}
                      style={{
                        padding: "4px 11px",
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 600,
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

              {/* Rôles */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {section.roles.map((role, ri) => {
                  const startMs = new Date(role.startDate).getTime();
                  const endMs = role.endDate
                    ? new Date(role.endDate).getTime()
                    : now;
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
                          isHover
                            ? "rgba(167,139,250,0.3)"
                            : "rgba(255,255,255,0.05)"
                        }`,
                        transform: isHover && !isMobile ? "translateX(4px)" : "none",
                        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {/* Gauche : icône + nom + statut */}
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
                        <span style={{ fontSize: 14.5, fontWeight: 500 }}>
                          {role.title}
                        </span>
                        <StatusBadge active={role.active} />
                      </div>

                      {/* Droite : dates + nombre de jours */}
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
                            fontWeight: 600,
                            color: "#4ade80",
                          }}
                        >
                          {formatDate(role.startDate)}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>→</span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: role.endDate ? "#f87171" : "#4ade80",
                          }}
                        >
                          {role.endDate ? formatDate(role.endDate) : "en cours"}
                        </span>

                        <span
                          style={{
                            padding: "5px 11px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            background: "rgba(168,85,247,0.13)",
                            border: "1px solid rgba(168,85,247,0.4)",
                            color: "#c084fc",
                          }}
                        >
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
          <SkinHead size={18} />
          <span>
            Développé par{" "}
            <span style={{ color: "rgba(167,139,250,0.8)", fontWeight: 600 }}>
              {PROFILE.username}
            </span>
          </span>
        </footer>
      </div>

      {/* Animations légères */}
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1; }
          50%  { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .pulse-dot { animation: pulse 2s infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in { animation: none; opacity: 1; }
          .pulse-dot { animation: none; }
        }
      `}</style>
    </main>
  );
}
