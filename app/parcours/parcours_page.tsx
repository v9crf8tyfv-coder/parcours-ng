"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  { title: "Modérateur Test", start: "2025-07-06 18:34", end: "2025-08-17 17:40", logo: "/logos/modo_test.png" },
  { title: "Modérateur Confirmé", start: "2025-08-17 17:40", end: "2026-05-03 21:39", logo: "/logos/modo.png" },
  { title: "Modérateur Réserviste", start: "2026-05-03 21:39", end: null, logo: "/logos/modo.png" },
];

const comWhite = [
  { title: "Journaliste White", start: "2025-08-03 17:12" },
  { title: "Journaliste de l'Indépendant", start: "2025-09-22 00:00" },
];

/* ================= BADGE ACTIF ================= */
function ActifBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 999, background: "rgba(8,138,56,0.15)", border: "1px solid #088a38" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#088a38", animation: "pulse 2s infinite" }} />
      <span style={{ color: "#088a38", fontWeight: 700, fontSize: 12 }}>Actif</span>
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
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{formatDate(start)}</span>
      <span style={{ opacity: 0.5 }}>→</span>
      <span style={{ fontSize: 11, opacity: 0.7, color: end ? "#c084fc" : "#22c55e" }}>
        {end ? formatDate(end) : "en cours"}
      </span>
      <div style={{
        padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: "bold",
        background: isActive ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.15)",
        border: isActive ? "1px solid #22c55e" : "1px solid #a855f7",
        color: isActive ? "#22c55e" : "#c084fc",
      }}>
        {days} jours
      </div>
    </div>
  );
}

function getDuration(start: string) {
  const diff = Date.now() - new Date(start).getTime();
  const totalDays = Math.floor(diff / 86400000);
  const months = Math.floor(totalDays / 30);
  const years = Math.floor(months / 12);
  return { totalDays, months, years };
}

/* ================= PAGE ================= */
export default function Parcours() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/likes")
      .then((res) => res.json())
      .then((data) => setLikes(data.likes))
      .catch(() => {});
    if (typeof window !== "undefined" && localStorage.getItem("liked-site")) {
      setLiked(true);
    }
  }, []);

  const handleLike = async () => {
    if (liked) return;
    const res = await fetch("/api/likes", { method: "POST" });
    const data = await res.json();
    setLikes(data.likes);
    setLiked(true);
    localStorage.setItem("liked-site", "true");
  };

  const head = "https://skins.nationsglory.fr/face/ixtazzking/120";

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d0618 0%, #000000 60%)",
      color: "white",
      padding: isMobile ? "20px 16px" : "32px 40px",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grille de fond */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "56px 56px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>

        {/* Bouton retour */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 5, marginBottom: 24,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "7px 14px", color: "rgba(255,255,255,0.6)",
            fontSize: 13, cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >
          ← Retour à l'accueil
        </button>

        {/* Like */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button
            onClick={handleLike}
            disabled={liked}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: isMobile ? "8px 14px" : "10px 18px", borderRadius: 999,
              border: "1px solid #fde047", background: liked ? "rgba(253,224,71,0.22)" : "rgba(253,224,71,0.12)",
              color: "#fde047", fontWeight: "bold", fontSize: isMobile ? 12 : 13,
              cursor: liked ? "default" : "pointer", transition: "0.2s", minWidth: isMobile ? 140 : 170,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>👍</span>
              <span>{likes} avis positifs</span>
            </div>
            <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>
              {liked ? "Merci bcp ❤️" : "Un avis ? Clique ici !"}
            </span>
          </button>
        </div>

        {/* PROFIL */}
        <div style={{ textAlign: "center", marginBottom: 25, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, letterSpacing: "-1px", margin: 0 }}>ixtazzking</h1>
          <div style={{
            width: 110, height: 110, borderRadius: 18,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={head} alt="ixtazzking" style={{ width: 90, height: 90, borderRadius: 16, imageRendering: "pixelated" }} />
          </div>
        </div>

        {/* STAFF WHITE */}
        <div style={{ borderRadius: 18, padding: isMobile ? 16 : 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: isMobile ? 20 : 26, display: "flex", gap: 8, alignItems: "center", margin: 0 }}>
              <img src="/logos/white.png" style={{ width: 24, height: 24, objectFit: "contain" }} />
              Staff White
            </h2>
            {(() => {
              const stats = getDuration(staffWhite[0].start);
              return (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[`${stats.totalDays} jours`, `${stats.months} mois`, `${stats.years} ans`].map((txt, i) => (
                    <div key={i} style={{
                      padding: "3px 9px", borderRadius: 999, fontSize: 11,
                      background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.4)", color: "#eab308",
                    }}>{txt}</div>
                  ))}
                </div>
              );
            })()}
          </div>

          {staffWhite.map((item, i) => {
            const isActif = !item.end;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row", gap: 10,
                padding: isMobile ? 12 : 14, marginTop: 8, borderRadius: 12, background: "rgba(0,0,0,0.35)",
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <img src={item.logo} style={{ width: 24, height: 24, objectFit: "contain" }} />
                  <span style={{ fontSize: 14 }}>{item.title}</span>
                  {isActif && <ActifBadge />}
                </div>
                <TimeBadge start={item.start} end={item.end} now={now} />
              </div>
            );
          })}
        </div>

        {/* COM WHITE */}
        <div style={{ borderRadius: 18, padding: isMobile ? 16 : 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: isMobile ? 20 : 26, display: "flex", gap: 8, alignItems: "center", margin: "0 0 14px" }}>
            <img src="/logos/journal.png" style={{ width: 24, height: 24, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            Journalisme, Communication White
          </h2>

          {comWhite.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row", gap: 10,
              padding: isMobile ? 12 : 14, marginTop: 8, borderRadius: 12, background: "rgba(0,0,0,0.35)",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>{item.title}</span>
                <ActifBadge />
              </div>
              <TimeBadge start={item.start} end={null} now={now} />
            </div>
          ))}
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