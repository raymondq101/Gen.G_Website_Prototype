# GEN.G Academy Website

Static site for GEN.G esports — home, teams, academy, practicum, and bootcamp pages. Beige/gold "Tiger Nation" visual system with Tourney display type, scroll-driven reveals, and a 3D GenRang mascot.

## Pages
- `index.html` / `GenG.dc.html` — home (hero, history, champion stats, sponsor ribbon)
- `Teams.dc.html` — six rosters with player cards
- `Academy.dc.html` — higher education, intensive training, pro pathway
- `Practicum.dc.html` — practicum program + pricing
- `Bootcamp.dc.html` — bootcamp experience with 3D scene

## Runtime
- `support.js` — component runtime required by every page (keep next to the HTML files)
- `genrang-3d.js`, `academy-scene.js` — three.js scenes
- `assets/` — mascot art + sponsor strip

## Run locally
Any static server from this folder, e.g. `npx serve` or `python3 -m http.server`, then open http://localhost:8000

## GitHub Pages
Settings → Pages → deploy from branch (root). The site is fully static; no build step.
