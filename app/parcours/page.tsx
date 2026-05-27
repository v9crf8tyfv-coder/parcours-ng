"use client";

import { useEffect, useState } from "react";

/* ================= DATE ================= */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}h${mins}`;
}

/* ================= DATA ================= */
const staffWhite = [
  {
    title: "Modérateur Test",
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
    title: "Journaliste de l'Indépendant",
    start: "2025-09-22 00:00",
  },
];

/* ================= BADGE ACTIF ================= */
function ActifBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: 999,
        background: "rgba(8,138,56,0.15)",
        border: "1px solid #088a38",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#088a38",
          animation: "pulse 2s infinite",
        }}
      />
      <span style={{ color: "#088a38", fontWeight: 700, fontSize: 12 }}>
        Actif
      </span>
    </div>
  );
}

/* ================= BADGE TEMPS ================= */
function TimeBadge({ start, end, now }: any) {
  const startDate = new Date(start).getTime();
  const endDate = end ? new Date(end).getTime() : now;

  const days = Math.floor((endDate - startDate) / 86400000);
  const isActive = !end;

  return (
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  }}
>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{formatDate(start)}</span>

      <span style={{ opacity: 0.5 }}>→</span>

      <span
        style={{
          fontSize: 11,
          opacity: 0.7,
          color: end ? "#c084fc" : "#22c55e",
        }}
      >
        {end ? formatDate(end) : "en cours"}
      </span>

      <div
        style={{
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: "bold",
          background: isActive
            ? "rgba(34,197,94,0.15)"
            : "rgba(168,85,247,0.15)",
          border: isActive ? "1px solid #22c55e" : "1px solid #a855f7",
          color: isActive ? "#22c55e" : "#c084fc",
        }}
      >
        {days} jours
      </div>
    </div>
  );
}

/* ================= PAGE ================= */
function getDuration(start: string) {
  const startDate = new Date(start).getTime();
  const now = Date.now();

  const diff = now - startDate;

  const totalDays = Math.floor(diff / 86400000);
  const months = Math.floor(totalDays / 30);
  const years = Math.floor(months / 12);

  return { totalDays, months, years };
}
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
const [whiteOnline, setWhiteOnline] = useState(false);
const [globalOnline, setGlobalOnline] = useState(false);
const [now, setNow] = useState(Date.now());
const [likes, setLikes] = useState(0);
const [liked, setLiked] = useState(false);

useEffect(() => {
  const fetchStatus = () => {
    fetch("/api/servers")
      .then(res => res.json())
      .then(data => {
        setWhiteOnline(data.whiteOnline);
        setGlobalOnline(data.globalOnline);
      })
      .catch(() => {
        setWhiteOnline(false);
        setGlobalOnline(false);
      });
  };

  fetchStatus(); // premier appel immédiat
  const interval = setInterval(fetchStatus, 30000); // rafraîchit toutes les 30s
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const head = "https://mc-heads.net/avatar/ixtazzking/120";
  const handleLike = async () => {
  if (liked) return;

  const res = await fetch("/api/likes", {
    method: "POST",
  });

  const data = await res.json();

  setLikes(data.likes);
  setLiked(true);

  localStorage.setItem("liked-site", "true");
};

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
useEffect(() => {
  fetch("/api/likes")
    .then(res => res.json())
    .then(data => setLikes(data.likes));

  const alreadyLiked = localStorage.getItem("liked-site");

  if (alreadyLiked) {
    setLiked(true);
  }
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
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
  }}
>
  <button
    onClick={handleLike}
    disabled={liked}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: isMobile ? "8px 14px" : "10px 18px",
      borderRadius: 999,
      border: "1px solid #fde047",
      background: liked
        ? "rgba(253,224,71,0.22)"
        : "rgba(253,224,71,0.12)",
      color: "#fde047",
      fontWeight: "bold",
      fontSize: isMobile ? 12 : 13,
      cursor: liked ? "default" : "pointer",
      transition: "0.2s",
      minWidth: isMobile ? 140 : 170,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span>👍</span>
      <span>{likes} avis positifs</span>
    </div>

    <span
      style={{
        fontSize: 10,
        opacity: 0.7,
        fontWeight: 400,
      }}
    >
      {liked ? "Merci bcp ❤️" : "Un avis ? Clique ici !"}
    </span>
  </button>
</div>
      {/* IMPORTANT FIX : empêche l’étirement du bloc serveur */}
      <div
  style={{
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: 25,
    justifyContent: "center",
    alignItems: isMobile ? "center" : "flex-start",
  }}
>
        {/* LEFT */}
        <div style={{ width: isMobile ? "100%" : "45%" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: 25,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            {isMobile && (
  <div
    style={{
      fontSize: 12,
      opacity: 0.6,
      marginBottom: 6,
      letterSpacing: 1,
    }}
  >
    Adaptation mobile 📱
  </div>
)}
            <h1 style={{ fontSize: 52 }}>ixtazzking</h1>

            <div
              style={{
                width: 120,
                height: 120,
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
                style={{ width: 95, height: 95, borderRadius: 18 }}
              />
            </div>
          </div>

          {/* STAFF */}
          <div
            style={{
              borderRadius: 20,
              padding: 25,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ fontSize: 28, display: "flex", gap: 10, alignItems: "center" }}>
              <img src="/logos/white.png" style={{ width: 28, height: 28, objectFit: "contain" }} />
              Staff White
            </h2> <div style={{ display: "flex", justifyContent: "flex-end", marginTop: isMobile ? 10 : -30 }}>
  {(() => {
    const stats = getDuration(staffWhite[0].start);

    return (
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(234,179,8,0.15)",
          border: "1px solid #eab308",
          color: "#eab308",
          fontSize: 12
        }}>
          {stats.totalDays} jours
        </div>

        <div style={{
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(234,179,8,0.15)",
          border: "1px solid #eab308",
          color: "#eab308",
          fontSize: 12
        }}>
          {stats.months} mois
        </div>

        <div style={{
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(234,179,8,0.15)",
          border: "1px solid #eab308",
          color: "#eab308",
          fontSize: 12
        }}>
          {stats.years} ans
        </div>
      </div>
    );
  })()}
</div>

            {staffWhite.map((item, i) => {
              const isActif = item.title === "Modérateur Réserviste";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
justifyContent: "space-between",
alignItems: isMobile ? "flex-start" : "center",
flexDirection: isMobile ? "column" : "row",
gap: 12,
                    padding: isMobile ? 12 : 16,
                    marginTop: 10,
                    borderRadius: 14,
                    background: "rgba(0,0,0,0.45)",
                  }}
                >
                  <div
  style={{
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
                    <img src={item.logo} style={{ width: 28, height: 28, objectFit: "contain" }} />
                    <div>{item.title}</div>
                    {isActif && <ActifBadge />}
                  </div>

                  <TimeBadge start={item.start} end={item.end} now={now} />
                </div>
              );
            })}
          </div>

          {/* COM */}
          <div
            style={{
              marginTop: 25,
              borderRadius: 20,
              padding: 25,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ fontSize: 28, display: "flex", gap: 10, alignItems: "center" }}>
              <img src="/logos/journal.png" style={{ width: 28, height: 28, objectFit: "contain" }} />
              Journalisme, Communication White
            </h2>

            {comWhite.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
justifyContent: "space-between",
alignItems: isMobile ? "flex-start" : "center",
flexDirection: isMobile ? "column" : "row",
gap: 12,
                  padding: isMobile ? 12 : 16,
                  marginTop: 10,
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.45)",
                }}
              >
                <div
  style={{
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
                  <div>{item.title}</div>
                  <ActifBadge />
                </div>

                <TimeBadge start={item.start} end={null} now={now} />
              </div>
            ))}
          </div>
        </div>

        {/* LINE */}
        <div
  style={{
    display: isMobile ? "none" : "block",
    width: 2,
    minHeight: "80vh",
    background: "linear-gradient(to bottom, #0f0f0f, #7c3aed, #000)",
  }}
/>

        {/* RIGHT (FIX STOP AUTO STRETCH) */}
        <div
          style={{
            width: isMobile ? "100%" : "45%",
            borderRadius: 20,
            padding: 25,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            alignSelf: "flex-start", // 🔥 FIX PRINCIPAL
          }}
        >
          <h2 style={{ fontSize: 22 }}>Serveurs</h2>

          {/* WHITE */}
          <div
            style={{
              marginTop: 15,
              padding: 12,
              borderRadius: 12,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src="/logos/serveurwhite.png"
                style={{ width: 18, height: 18, objectFit: "contain" }}
              />
              <div>
                <div>Serveur White</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>
                  Statut en temps réel
                </div>
              </div>
            </div>

            <div
  style={{
    padding: "3px 10px",
    borderRadius: 999,
    background: whiteOnline
      ? "rgba(34,197,94,0.15)"
      : "rgba(239,68,68,0.15)",
    border: whiteOnline
      ? "1px solid #22c55e"
      : "1px solid #ef4444",
    color: whiteOnline ? "#22c55e" : "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
  }}
>
              {whiteOnline ? "ON" : "OFF"}
            </div>
          </div>

          {/* GLOBAL */}
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* LEFT INFO */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src="/logos/nationsglory.png"
                style={{ width: 18, height: 18, objectFit: "contain" }}
              />
              <div>
                <div>NationsGlory</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>
                  Statut en temps réel
                </div>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background: globalOnline
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
                border: globalOnline
                  ? "1px solid #22c55e"
                  : "1px solid #ef4444",
                color: globalOnline ? "#22c55e" : "#ef4444",
                fontSize: 11,
                fontWeight: "bold",
                animation: globalOnline ? "none" : "blink 1s infinite",
              }}
            >
              {globalOnline ? "ON" : "OFF"}
            </div>
          </div>
        </div>
      </div>

      {/* STYLE */}
      <style jsx>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.4;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}