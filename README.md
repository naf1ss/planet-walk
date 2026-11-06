# Planet Walk

An interactive 3D solar system journey across Gettysburg College — the digital companion to the campus Planet Walk, a walkable scale model that runs about 7,561 ft (1.43 mi) from the Sun at the Hatter Planetarium to Pluto at the College Observatory.

By Md Nafisul Hasan Sami.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Scroll from the Milky Way into the solar system, then tap a world |
| `/planet/[name]` | One page per stop (`sun`, `mercury` … `pluto`): facts, campus marker, tile. Also the QR-code destination |
| `/map` | Campus map of every stop with location photos |
| `/tracker` | Walk passport: checklist, timer and distance, saved on the phone |
| `/about` | The story behind the project |

## Editing content

- Planet text, facts and campus markers: `lib/planet-content.ts`
- Map coordinates: `lib/campus-map-stops.ts`
- Walk distances: `lib/planetData.ts`
- 3D sizes and orbits: `lib/planets.ts`
- Navigation: `lib/nav.ts`
- Site name, tagline, author: `lib/constants.ts`

Planet surface textures live in `public/textures` (2048 px, used on planet pages) and `public/textures/sm` (1024 px, used on the home page). Keep both in sync if you replace one.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build check
```

Built with Next.js, React Three Fiber, GSAP and Leaflet. Deployed on Vercel: every push to `main` goes live.
