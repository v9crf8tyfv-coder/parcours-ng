"use client";

import Profile, { THEMES } from "../Profile";

/* ════════════════════════════════════════════════════════════════
   Page du pote — Orionyx84 (thème bleu).
   Parcours à compléter : remplis sections / rp / countries comme
   sur la page de ixtazzking (voir app/page.tsx).
   ════════════════════════════════════════════════════════════════ */

export default function Orionyx84() {
  return (
    <Profile
      config={{
        username: "Orionyx84",
        subtitle: "Parcours NationsGlory White",
        theme: THEMES.blue,
        otherHref: "/",
        sections: [],
        countries: [],
      }}
    />
  );
}
