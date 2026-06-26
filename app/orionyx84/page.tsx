"use client";

import Profile, { THEMES, type Role } from "../Profile";

/* ════════════════════════════════════════════════════════════════
   Page du pote — Orionyx84 (thème bleu).
   ════════════════════════════════════════════════════════════════ */

const staffRoles: Role[] = [
  {
    title: "Modérateur Test",
    startDate: "2026-01-11 17:45",
    endDate: "2026-02-01 17:47",
    active: false,
    icon: "/logos/modo_test.png",
    candidatures: [
      {
        url: "https://nationsglory.fr/forums/thread/candidature-moderateur-d039orionyx84.237379",
        status: "Accepté",
      },
    ],
  },
  {
    title: "Modérateur Confirmé",
    startDate: "2026-02-01 17:47",
    endDate: "2026-05-03 18:04",
    active: false,
    icon: "/logos/modo.png",
  },
  {
    title: "Modérateur Plus",
    startDate: "2026-05-03 18:04",
    endDate: null,
    active: true,
    icon: "/logos/modoplus.png",
    iconSize: 34,
  },
];

// RP — faction Conservateurs (rangs)
const conservateurRanks: Role[] = [
  {
    title: "Chevalier",
    startDate: "2025-11-09 11:39",
    endDate: "2025-11-30 19:21",
    active: false,
    icon: "/logos/chevalier.png",
    candidatures: [
      {
        url: "https://nationsglory.fr/forums/thread/candidature-rp-conservateur-orionyx84.139827",
        status: "Accepté",
      },
    ],
  },
  {
    title: "Baron",
    startDate: "2025-11-30 19:21",
    endDate: "2026-01-11 20:46",
    active: false,
    icon: "/logos/baron.png",
  },
  {
    title: "Duc",
    startDate: "2026-01-11 20:46",
    endDate: null,
    active: true,
    icon: "/logos/duc.png",
  },
];

export default function Orionyx84() {
  return (
    <Profile
      config={{
        username: "Orionyx84",
        subtitle: "Parcours NationsGlory White",
        theme: THEMES.blue,
        index: 2,
        otherHref: "/zltoa",
        sections: [
          { title: "Staff White", icon: "/logos/white.png", roles: staffRoles },
        ],
        rp: {
          title: "RôlePlay White",
          icon: "/logos/rpwhite.png",
          groups: [
            {
              title: "Conservateurs",
              icon: "/logos/conservateur.png",
              roles: conservateurRanks,
            },
          ],
        },
        countries: [],
      }}
    />
  );
}
