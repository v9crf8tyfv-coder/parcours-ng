"use client";

import Profile, { THEMES } from "../Profile";

/* ════════════════════════════════════════════════════════════════
   3ᵉ page — Zltoa (thème rouge). Parcours à compléter.
   ════════════════════════════════════════════════════════════════ */

export default function Zltoa() {
  return (
    <Profile
      config={{
        username: "Zltoa",
        subtitle: "Parcours NationsGlory White",
        theme: THEMES.red,
        index: 3,
        otherHref: "/",
        sections: [],
        countries: [],
      }}
    />
  );
}
