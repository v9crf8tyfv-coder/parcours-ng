# Parcours NationsGlory — ixtazzking

Site personnel **public** affichant le parcours NationsGlory White de `ixtazzking`
(staff + journalisme/communication). Une seule page, sombre, responsive, sans dépendance externe.

Construit avec **Next.js 16** + **React 19**. Page 100 % statique → hébergeable gratuitement sur Vercel.

## Modifier / ajouter un rôle

Tout se passe en haut de [`app/page.tsx`](app/page.tsx), dans les tableaux `staffRoles`
et `journalismRoles`. Chaque rôle :

```ts
{
  title:     "Modérateur Confirmé",      // nom affiché
  startDate: "2025-08-17 17:40",          // "AAAA-MM-JJ HH:MM"
  endDate:   "2026-05-03 21:39",          // date de fin OU null (= en cours)
  active:    false,                       // true → badge vert "Actif"
  icon:      "/logos/modo.png",           // image dans /public/logos/
}
```

- Le **nombre de jours**, les **totaux** (années / mois / jours) et le badge **Actif**
  sont calculés automatiquement et avancent tout seuls avec le temps.
- Pour ajouter une icône : dépose le fichier dans `public/logos/` puis renseigne `icon`.

## Lancer en local

```bash
npm install      # la première fois
npm run dev
```

Puis ouvre http://localhost:3000

## Déployer sur Vercel

Le projet est déjà relié à GitHub et à Vercel, donc :

1. Commit + push sur `main` :
   ```bash
   git add -A
   git commit -m "maj parcours"
   git push
   ```
2. Vercel rebuild automatiquement et publie le lien public.

### Première mise en ligne (si jamais à refaire de zéro)

1. Crée un compte sur https://vercel.com puis « Add New → Project ».
2. Importe le dépôt GitHub `parcours-ng` (framework détecté : Next.js, rien à configurer).
3. Clique **Deploy** → tu obtiens un lien public du type `https://parcours-ng.vercel.app`,
   accessible par tout le monde.

En CLI : `npm i -g vercel`, puis `vercel` (préversion) ou `vercel --prod` (production).
