import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/* Charge .env.tracking si les vars ne sont pas déjà dans l'environnement */
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.tracking");
try {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* pas de .env.tracking = on utilise les vars système */ }

const STAFF    = ["ixtazzking", "Orionyx84"];
const NG_API   = "https://publicapi.nationsglory.fr";
const KV_URL   = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const API_KEY  = process.env.NATIONSGLORY_API_KEY;

if (!KV_URL || !KV_TOKEN) { console.error("Upstash non configuré"); process.exit(1); }
if (!API_KEY)             { console.error("NATIONSGLORY_API_KEY manquant"); process.exit(1); }

async function kv(cmd) {
  const r = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const json = await r.json();
  if (json.error) console.error(`[KV] erreur:`, json.error, "| cmd:", cmd[0], cmd[1]);
  return json.result;
}
const kvGet = async (k) => { const v = await kv(["GET", k]); return v ? JSON.parse(v) : null; };
const kvSet = async (k, v, ex) => kv(ex ? ["SET", k, JSON.stringify(v), "EX", ex] : ["SET", k, JSON.stringify(v)]);
const kvDel = async (k) => kv(["DEL", k]);

function getWeekId(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const w1 = new Date(date.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((date - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(wn).padStart(2, "0")}`;
}

const now = Date.now();

for (const username of STAFF) {
  try {
    const res = await fetch(`${NG_API}/user/${username}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Origin": "https://nationsglory.fr",
        "Referer": "https://nationsglory.fr/",
      },
    });

    if (!res.ok) {
      console.log(`${username}: API NG erreur ${res.status}`);
      continue;
    }

    const data     = await res.json();
    const isOnline = data?.servers?.white?.online ?? false;

    const prevOnline   = await kvGet(`staff:${username}:online`);
    const sessionStart = await kvGet(`staff:${username}:session_start`);

    if (!prevOnline && isOnline) {
      await kvSet(`staff:${username}:session_start`, now);
      console.log(`${username}: connecté`);

    } else if (prevOnline && !isOnline && sessionStart) {
      const minutes = Math.round((now - sessionStart) / 60000);
      if (minutes >= 2) {
        const weekId   = getWeekId(new Date());
        const date     = new Date().toISOString().slice(0, 10);
        const key      = `staff:${username}:sessions:${weekId}`;
        const existing = (await kvGet(key)) ?? [];
        existing.push({ date, minutes });
        await kvSet(key, existing, 60 * 60 * 24 * 120);
        console.log(`${username}: session ${minutes} min enregistrée`);
      } else {
        console.log(`${username}: session ${minutes} min ignorée (trop courte)`);
      }
      await kvDel(`staff:${username}:session_start`);

    } else {
      console.log(`${username}: ${isOnline ? "en ligne" : "hors ligne"}`);
    }

    await kvSet(`staff:${username}:online`, isOnline);

  } catch (err) {
    console.error(`${username}: erreur — ${err.message}`);
  }
}
