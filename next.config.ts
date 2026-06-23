import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite l'avertissement "workspace root" quand un autre package-lock.json
  // existe dans un dossier parent : on force la racine sur ce projet.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
