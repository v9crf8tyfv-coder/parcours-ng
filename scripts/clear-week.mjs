import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
} catch {}

const KV_URL   = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const kv = async (cmd) => {
  const r = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  return (await r.json()).result;
};

// Semaine courante
const d = new Date();
d.setHours(0,0,0,0);
d.setDate(d.getDate() + 3 - ((d.getDay()+6)%7));
const w1 = new Date(d.getFullYear(), 0, 4);
const wn = 1 + Math.round(((d-w1)/86400000 - 3 + ((w1.getDay()+6)%7))/7);
const weekId = `${d.getFullYear()}-W${String(wn).padStart(2,"0")}`;

const keys = [
  `staff:ixtazzking:sessions:${weekId}`,
  `staff:Orionyx84:sessions:${weekId}`,
  "staff:ixtazzking:online",
  "staff:ixtazzking:session_start",
  "staff:Orionyx84:online",
  "staff:Orionyx84:session_start",
];

for (const key of keys) {
  await kv(["DEL", key]);
  console.log(`Supprimé : ${key}`);
}

console.log(`\n✅ Semaine ${weekId} remise à zéro.`);
