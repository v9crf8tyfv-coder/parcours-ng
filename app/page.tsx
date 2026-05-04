"use client";

import { useEffect, useState } from "react";

/* ================= FORMAT DATE ================= */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} à ${hours}h${mins}`;
}

/* ================= DATA ================= */
const staffWhite = [
  {
    title: "Modérateur Test White",
    start: "2025-07-06 18:34",
    end: "2025-08-17 17:40",
    logo: "/logos/modo_test.png",
  },
  {
    title: "Modérateur Confirmé",
    start: "2025-08-17 17:40",
    end: "2026-05-03 21:39",
    logo: "/logos/modo.png",
  },
  {
    title: "Modérateur Réserviste",
    start: "2026-05-03 21:39",
    end: null,
    logo: "/logos/modo.png",
  },
];

const comWhite = [
  {
    title: "Journaliste White",
    start: "2025-08-03 17:12",
  },
  {
    title: "Journaliste Indépendant",
    start: "2025-09-22 00:00",
  },
];

/* ================= LIVE ================= */
function LiveBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#22c55e",
          animation: "pulse 2s infinite",
        }}
      />
      <span
        style={{
          color: "#22c55e",
          fontWeight: 700,
          fontSize: 12,
          animation: "pulse 2s infinite",
        }}
      >
        LIVE
      </span>
    </div>
  );
}

export default function Home() {
  const [now, setNow] = useState(Date.now());

  const head = "https://mc-heads.net/avatar/ixtazzking/120";

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        background: "radial-gradient(circle at top, #1a0b2e, #000000)",
        color: "white",
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Arial",
      }}
    >
      {/* ================= HERO ================= */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <h1 style={{ fontSize: 52 }}>ixtazzking</h1>

        {/* ================= AVATAR + CASE AJOUTÉE ================= */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 20,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={head}
            style={{
              width: 100,
              height: 100,
              borderRadius: 18,
            }}
          />
        </div>

        <p style={{ opacity: 0.6 }}>Parcours NationsGlory</p>
      </div>

      {/* ================= STAFF ================= */}
      <div
        style={{
          width: "65%",
          margin: "auto",
          borderRadius: 20,
          padding: 25,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30 }}>
          <img src="/logos/white.png" style={{ width: 28 }} />
          Staff White
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {staffWhite.map((item, i) => {
            const isLive = item.title === "Modérateur Réserviste";

            const days = Math.floor(
              ((item.end ? new Date(item.end).getTime() : now) -
                new Date(item.start).getTime()) /
                86400000
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={item.logo} style={{ width: 28 }} />

                  <div style={{ fontWeight: "bold" }}>{item.title}</div>

                  {isLive && <LiveBadge />}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {formatDate(item.start)} →{" "}
                    {item.end ? formatDate(item.end) : "en cours"}
                  </div>

                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: isLive
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(168,85,247,0.2)",
                      border: isLive
                        ? "1px solid #22c55e"
                        : "1px solid #a855f7",
                      color: isLive ? "#22c55e" : "#c084fc",
                      fontWeight: "bold",
                    }}
                  >
                    {days} jours
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= COM ================= */}
      <div
        style={{
          width: "65%",
          margin: "40px auto 0 auto",
          borderRadius: 20,
          padding: 25,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30 }}>
          <img src="/logos/journal.png" style={{ width: 28 }} />
          Journal / Com White
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {comWhite.map((item, i) => {
            const days = Math.floor(
              (now - new Date(item.start).getTime()) / 86400000
            );

            const isLive =
              item.title === "Journaliste White" ||
              item.title === "Journaliste Indépendant";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
                  {item.title}
                  {isLive && <LiveBadge />}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {formatDate(item.start)} → en cours
                  </div>

                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: "rgba(34,197,94,0.2)",
                      border: "1px solid #22c55e",
                      color: "#22c55e",
                      fontWeight: "bold",
                    }}
                  >
                    {days} jours
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}