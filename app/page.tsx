"use client";

import Profile, { THEMES, type Role, type Country } from "./Profile";

/* ════════════════════════════════════════════════════════════════
   DONNÉES — ixtazzking. Modifie uniquement ce bloc.

   Chaque rôle : title / startDate "AAAA-MM-JJ HH:MM" / endDate (ou null) /
                 active (badge "Actif") / icon (image dans /public/logos/)
   ════════════════════════════════════════════════════════════════ */

const staffRoles: Role[] = [
  {
    title: "Modérateur Test",
    startDate: "2025-07-06 18:34",
    endDate: "2025-08-17 17:40",
    active: false,
    icon: "/logos/modo_test.png",
    candidatures: [
      { url: "https://nationsglory.fr/forums/thread/candidature-modo.128764", status: "Refusé" },
      { url: "https://nationsglory.fr/forums/thread/candidature-moderateur.130391", status: "Refusé" },
      { url: "https://nationsglory.fr/forums/thread/candidature-moderateurs.134745", status: "Accepté" },
    ],
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
    candidatures: [
      { url: "https://nationsglory.fr/forums/thread/ixtazzking.135691", status: "Accepté" },
    ],
  },
  {
    title: "Journaliste de l'Indépendant",
    startDate: "2025-09-22 00:00",
    endDate: null,
    active: true,
    icon: "/logos/indépendant.png",
  },
  {
    title: "Communication White",
    startDate: "2026-05-30 18:46",
    endDate: null,
    active: true,
    icon: "/logos/communication.png",
  },
];

const countries: Country[] = [
  { name: "TerreSnow", flag: "/logos/terresnow.png" },
  { name: "Roumanie", flag: "/logos/roumanie.png" },
  {
    name: "Mongolie",
    flag: "/logos/mongolie.png",
    mark: { logo: "/logos/paysref.png", label: "Passage Pays Référent", date: "26/12/2025" },
  },
  {
    name: "EmpireBooth",
    flag: "/logos/empirebooth.png",
    mark: { logo: "/logos/empirelogo.png", label: "Passage Empire", date: "26/01/2025" },
  },
  { name: "Italie", flag: "/logos/italie.png", current: true },
];

export default function Home() {
  return (
    <Profile
      config={{
        username: "ixtazzking",
        subtitle: "Parcours NationsGlory White",
        theme: THEMES.purple,
        index: 1,
        otherHref: "/orionyx84",
        sections: [
          { title: "Staff White", icon: "/logos/white.png", roles: staffRoles },
          { title: "Pôle Médias", icon: "/logos/journal.png", roles: journalismRoles },
        ],
        rp: {
          title: "RôlePlay White",
          icon: "/logos/rpwhite.png",
          message: "Pour bientôt…",
          groups: [{ title: "Justice", icon: "/logos/justice.png", roles: [] }],
        },
        countries,
      }}
    />
  );
}
