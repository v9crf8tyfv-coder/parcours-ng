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
  return (await r.json()).result;
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
      headers: { Authorization: `Bearer ${API_KEY}` },
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
