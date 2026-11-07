import { PLANET_SLUGS } from "@/lib/constants";

/** Route bodies: Sun + all walk stops (including Ceres) */
export const BODY_SLUGS = ["sun", ...PLANET_SLUGS] as const;
export type BodySlug = (typeof BODY_SLUGS)[number];

export type CampusMarker = {
  /** 0–100 on schematic campus map */
  x: number;
  y: number;
  label: string;
  landmark: string;
};

export type BodyContent = {
  slug: BodySlug;
  name: string;
  subtitle: string;
  /** Physical campus location of the walk marker */
  markerLocation: string;
  /** Campus-tied narrative shown under the marker on the hero screen */
  heroFact: string;
  /** Ceramic tile with vinyl-printed art (drawn digitally) */
  tileImage: string;
  tileCaption: string;
  /** Globe texture for fly-through */
  texture: string;
  color: string;
  size: number;
  /** Bulleted facts (minimum 4; excludes heroFact) */
  facts: string[];
  campus: CampusMarker;
  /** Special narrative roles */
  role?: "planetarium" | "observatory";
};

/**
 * Guided-journey content for QR /planet/[name] pages.
 * Campus markers are schematic positions along the Gettysburg Planet Walk.
 */
export const BODY_CONTENT: Record<BodySlug, BodyContent> = {
  sun: {
    slug: "sun",
    name: "The Sun",
    subtitle: "Planetarium · journey origin",
    markerLocation: "The center of the planetarium",
    heroFact:
      "On the campus walk, the journey begins with the Sun, located in the center of the Gettysburg College planetarium.",
    tileImage: "/tiles/cut/sun.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Solar disc",
    texture: "/textures/sun.jpg",
    color: "#ffcc66",
    size: 1.6,
    role: "planetarium",
    facts: [
      "Contains about 99.86% of all mass in the solar system.",
      "At true walk scale the Sun would be microscopic; the tile stands in so you can see the star.",
      "Light leaving the Sun takes about 8 minutes to reach Earth — and 5.5 hours to reach Pluto.",
      "The Sun fuses about 600 million tons of hydrogen into helium every second.",
    ],
    campus: {
      x: 18,
      y: 62,
      label: "Sun",
      landmark: "The center of the planetarium",
    },
  },
  mercury: {
    slug: "mercury",
    name: "Mercury",
    subtitle: "Innermost World - Planetarium Wall",
    markerLocation: "The wall of the planetarium",
    heroFact:
      "On the campus walk, Mercury's marker is mounted on the wall of the planetarium — the first stop outward from the Sun.",
    tileImage: "/tiles/cut/mercury.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Caloris Basin",
    texture: "/textures/mercury.jpg",
    color: "#a8a29e",
    size: 0.55,
    facts: [
      "A year on Mercury is only 88 Earth days.",
      "It races around the Sun at roughly 107,000 mph.",
      "Dayside temperatures can exceed 800°F; nights plunge below −280°F.",
      "In 2012, NASA's Messenger spacecraft observed water ice in permanently shadowed craters near Mercury's poles.",
    ],
    campus: {
      x: 26,
      y: 58,
      label: "Mercury",
      landmark: "The wall of the planetarium",
    },
  },
  venus: {
    slug: "venus",
    name: "Venus",
    subtitle: "Earth’s twin · cloud world",
    markerLocation: "The Physics and Astronomy Atrium",
    heroFact:
      "Venus is the hottest planet — about 870°F at the surface, hotter than Mercury even though it orbits nearly twice as far from the Sun.",
    tileImage: "/tiles/cut/venus.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Cloud swirls",
    texture: "/textures/venus.jpg",
    color: "#e8c07a",
    size: 0.7,
    facts: [
      "Venus is unique in that its spin rotation is reversed relative to most other planets, meaning that, on Venus, the Sun rises in the west and sets in the east.",
      "A Venusian day (243 Earth days) is longer than its year (225 Earth days).",
      "Surface pressure is about 90× Earth’s — like being nearly a mile underwater.",
      "Its thick CO₂ atmosphere creates a runaway greenhouse effect.",
    ],
    campus: {
      x: 34,
      y: 54,
      label: "Venus",
      landmark: "The Physics and Astronomy Atrium",
    },
  },
  earth: {
    slug: "earth",
    name: "Earth",
    subtitle: "Home · 1 Astronomical Unit",
    markerLocation: "Physics Student Lounge",
    heroFact:
      "\"That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.\" — Carl Sagan",
    tileImage: "/tiles/cut/earth.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Americas / Atlantic",
    texture: "/textures/earth.jpg",
    color: "#3b82c4",
    size: 0.75,
    facts: [
      "Earth sits about 1 Astronomical Unit from the Sun — about 93 million miles, the measuring stick for the whole walk.",
      "At this scale, the Moon would sit only ~1.3 inches from a pea-sized Earth.",
      "Liquid water and a protective magnetic field make Earth uniquely habitable (so far).",
      "Earth's atmosphere is about 78% nitrogen and 21% oxygen — a rare balance that supports complex life.",
    ],
    campus: {
      x: 42,
      y: 50,
      label: "Earth",
      landmark: "Physics Student Lounge",
    },
  },
  mars: {
    slug: "mars",
    name: "Mars",
    subtitle: "The Red Planet",
    markerLocation: "Plank Basement",
    heroFact: "Mars is red because it's rusty — iron-oxide dust coats the surface and tints its sky a pale butterscotch.",
    tileImage: "/tiles/cut/mars.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Valles Marineris",
    texture: "/textures/mars.jpg",
    color: "#c45c3a",
    size: 0.6,
    facts: [
      "All four inner terrestrial planets fit in roughly the first 4% of the campus walk.",
      "Valles Marineris dwarfs Earth’s Grand Canyon — thousands of miles long.",
      "Mars has the tallest volcano we know: Olympus Mons.",
      "Mars has roughly 38% of Earth's gravitational force, meaning that you'd weigh only about a third as much on Mars as you do on the Earth.",
      "A day on Mars is ~24 hours 40 minutes — almost Earthlike.",
    ],
    campus: {
      x: 50,
      y: 46,
      label: "Mars",
      landmark: "Plank Basement",
    },
  },
  ceres: {
    slug: "ceres",
    name: "Ceres",
    subtitle: "Dwarf planet · asteroid belt",
    markerLocation: "Glatfelter Lodge",
    heroFact:
      "On the campus walk, Ceres is marked at Glatfelter Lodge — bridging the rocky inner worlds and the gas giants.",
    tileImage: "/tiles/cut/ceres.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Ceres",
    texture: "/textures/ceres.jpg",
    color: "#c4b5a0",
    size: 0.14,
    facts: [
      "Ceres is the largest body in the asteroid belt and was the first object discovered there — Giuseppe Piazzi spotted it on January 1, 1801.",
      "The IAU classifies Ceres as a dwarf planet; it contains roughly a third of the asteroid belt's total mass.",
      "NASA's Dawn spacecraft orbited Ceres from 2015 to 2018, mapping bright salt deposits in Occator Crater.",
      "Ahuna Mons is a cryovolcano on Ceres — a dome of salty ice thought to have erupted from a briny subsurface reservoir.",
    ],
    campus: {
      x: 56,
      y: 43,
      label: "Ceres",
      landmark: "Glatfelter Lodge",
    },
  },
  jupiter: {
    slug: "jupiter",
    name: "Jupiter",
    subtitle: "King of planets",
    markerLocation: "Science Center Walkway",
    heroFact:
      "Jupiter is more than twice as massive as all the other planets in the solar system combined.",
    tileImage: "/tiles/cut/jupiter.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Great Red Spot",
    texture: "/textures/jupiter.jpg",
    color: "#d4a574",
    size: 1.35,
    facts: [
      "About 1,300 Earths could fit inside Jupiter.",
      "The Great Red Spot is a storm larger than Earth, centuries old.",
      "Its gravity shepherds asteroids and deflects many comets.",
      "Jupiter has the strongest planet-wide magnetic field in the solar system apart from the Sun.",
    ],
    campus: {
      x: 62,
      y: 40,
      label: "Jupiter",
      landmark: "Science Center Walkway",
    },
  },
  saturn: {
    slug: "saturn",
    name: "Saturn",
    subtitle: "Ringed giant",
    markerLocation: "Glatfelter basement",
    heroFact: "Saturn has more known moons than any other planet — over 270 and counting.",
    tileImage: "/tiles/cut/saturn.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Cloud bands",
    texture: "/textures/saturn.jpg",
    color: "#e6d5a8",
    size: 1.2,
    facts: [
      "Saturn’s rings span ~175,000 miles but are only tens of feet thick in places.",
      "If Saturn were a basketball, the rings would be paper-thin.",
      "It is less dense than water — it would float in a vast enough bathtub.",
      "Titan, its largest moon, has lakes of liquid methane.",
    ],
    campus: {
      x: 72,
      y: 36,
      label: "Saturn",
      landmark: "Glatfelter basement",
    },
  },
  uranus: {
    slug: "uranus",
    name: "Uranus",
    subtitle: "Ice giant · tipped world",
    markerLocation: "Outside Schmucker Ceramics Studio",
    heroFact:
      "Because Uranus is tipped on its side, each pole gets about 42 years of nonstop sunlight, then 42 years of darkness.",
    tileImage: "/tiles/cut/uranus.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Atmosphere",
    texture: "/textures/uranus.jpg",
    color: "#7ec8c8",
    size: 0.85,
    facts: [
      "Uranus rotates on its side — likely from an ancient collision.",
      "At 19 Astronomical Units, sunlight is about 1/361 as bright as on Earth.",
      "It was the first planet discovered with a telescope (1781).",
      "Methane in its atmosphere gives the cyan-blue color.",
    ],
    campus: {
      x: 80,
      y: 30,
      label: "Uranus",
      landmark: "Outside Schmucker Ceramics Studio",
    },
  },
  neptune: {
    slug: "neptune",
    name: "Neptune",
    subtitle: "Windiest world",
    markerLocation: "Outside Admissions",
    heroFact: "Neptune was found with math before anyone saw it — astronomers predicted its position from tugs on Uranus's orbit and spotted it in 1846.",
    tileImage: "/tiles/cut/neptune.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Dark Spot region",
    texture: "/textures/neptune.jpg",
    color: "#4169e1",
    size: 0.82,
    facts: [
      "Neptune’s winds can top 1,200 mph — faster than sound on Earth.",
      "Voyager 2 is the only spacecraft to have visited (1989).",
      "It takes sunlight ~4 hours to reach Neptune.",
      "Triton orbits backward and may be a captured Kuiper Belt object.",
    ],
    campus: {
      x: 86,
      y: 24,
      label: "Neptune",
      landmark: "Outside Admissions",
    },
  },
  pluto: {
    slug: "pluto",
    name: "Pluto",
    subtitle: "Observatory finale · Tombaugh Regio",
    markerLocation: "Gettysburg College Observatory",
    heroFact:
      "The campus walk ends at the Gettysburg College Observatory — Pluto's physical station.",
    tileImage: "/tiles/cut/pluto.jpg",
    tileCaption: "7×5″ ceramic tile · art drawn digitally, printed on vinyl · Heart glacier",
    texture: "/textures/pluto.jpg",
    color: "#c4b5a0",
    size: 0.5,
    role: "observatory",
    facts: [
      "New Horizons revealed a heart-shaped nitrogen glacier (Sputnik Planitia).",
      "You walk about 1.43 miles (7,561 ft) to stand in for ~3.67 billion real miles.",
      "Light still needs ~5.5 hours to cross the real Sun–Pluto gap.",
      "Pluto's largest moon, Charon, is so massive that both bodies orbit a point in space between them.",
    ],
    campus: {
      x: 92,
      y: 18,
      label: "Pluto",
      landmark: "Gettysburg College Observatory",
    },
  },
};

export function isBodySlug(name: string): name is BodySlug {
  return (BODY_SLUGS as readonly string[]).includes(name);
}

export function getBodyContent(name: string): BodyContent | null {
  if (!isBodySlug(name)) return null;
  return BODY_CONTENT[name];
}
