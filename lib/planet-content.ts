import { PLANET_SLUGS } from "@/lib/constants";

/** Route bodies: Sun (Planetarium) + 8 planets + Pluto (Observatory) */
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
  /** Vinyl / ceramic tile art */
  tileImage: string;
  tileCaption: string;
  /** Globe texture for fly-through */
  texture: string;
  color: string;
  size: number;
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
    tileImage: "/tiles/sun.jpg",
    tileCaption: "7×5″ vinyl tile · Solar disc",
    texture: "/textures/sun.jpg",
    color: "#ffcc66",
    size: 1.6,
    role: "planetarium",
    facts: [
      "Contains about 99.86% of all mass in the solar system.",
      "On the campus walk, the Sun marks the Planetarium — your journey starts here.",
      "At true walk scale the Sun would be microscopic; the tile stands in so you can see the star.",
      "Light leaving the Sun takes about 8 minutes to reach Earth — and 5.5 hours to reach Pluto.",
    ],
    campus: {
      x: 18,
      y: 62,
      label: "Sun",
      landmark: "Planetarium / Science Center",
    },
  },
  mercury: {
    slug: "mercury",
    name: "Mercury",
    subtitle: "Innermost world · Caloris Basin",
    tileImage: "/tiles/mercury.jpg",
    tileCaption: "7×5″ vinyl tile · Caloris Basin",
    texture: "/textures/mercury.jpg",
    color: "#a8a29e",
    size: 0.55,
    facts: [
      "A year on Mercury is only 88 Earth days.",
      "It races around the Sun at roughly 107,000 mph.",
      "Dayside temperatures can exceed 800°F; nights plunge below −280°F.",
      "The Caloris Basin is one of the largest impact scars in the solar system.",
    ],
    campus: {
      x: 26,
      y: 58,
      label: "Mercury",
      landmark: "Path east of Science Center",
    },
  },
  venus: {
    slug: "venus",
    name: "Venus",
    subtitle: "Earth’s twin · cloud world",
    tileImage: "/tiles/venus.jpg",
    tileCaption: "7×5″ vinyl tile · Cloud swirls",
    texture: "/textures/venus.jpg",
    color: "#e8c07a",
    size: 0.7,
    facts: [
      "Venus spins backward — the Sun rises in the west.",
      "A Venusian day (243 Earth days) is longer than its year (225 Earth days).",
      "Surface pressure is about 90× Earth’s — like being nearly a mile underwater.",
      "Its thick CO₂ atmosphere creates a runaway greenhouse effect.",
    ],
    campus: {
      x: 34,
      y: 54,
      label: "Venus",
      landmark: "Quad walkway",
    },
  },
  earth: {
    slug: "earth",
    name: "Earth",
    subtitle: "Home · 1 AU",
    tileImage: "/tiles/earth.jpg",
    tileCaption: "7×5″ vinyl tile · Americas / Atlantic",
    texture: "/textures/earth.jpg",
    color: "#3b82c4",
    size: 0.75,
    facts: [
      "Earth sits about 1 AU from the Sun — the measuring stick for the whole walk.",
      "At this scale, the Moon would sit only ~1.3 inches from a pea-sized Earth.",
      "Every human who ever lived lived on this speck.",
      "Liquid water and a protective magnetic field make Earth uniquely habitable (so far).",
    ],
    campus: {
      x: 42,
      y: 50,
      label: "Earth",
      landmark: "Central campus path",
    },
  },
  mars: {
    slug: "mars",
    name: "Mars",
    subtitle: "The red frontier",
    tileImage: "/tiles/mars.jpg",
    tileCaption: "7×5″ vinyl tile · Valles Marineris",
    texture: "/textures/mars.jpg",
    color: "#c45c3a",
    size: 0.6,
    facts: [
      "All four rocky planets fit in roughly the first 4% of the campus walk.",
      "Valles Marineris dwarfs Earth’s Grand Canyon — thousands of miles long.",
      "Mars has the tallest volcano we know: Olympus Mons.",
      "A day on Mars is ~24 hours 40 minutes — almost Earthlike.",
    ],
    campus: {
      x: 50,
      y: 46,
      label: "Mars",
      landmark: "Near Musselman Library approach",
    },
  },
  jupiter: {
    slug: "jupiter",
    name: "Jupiter",
    subtitle: "King of planets",
    tileImage: "/tiles/jupiter.jpg",
    tileCaption: "7×5″ vinyl tile · Great Red Spot",
    texture: "/textures/jupiter.jpg",
    color: "#d4a574",
    size: 1.35,
    facts: [
      "About 1,300 Earths could fit inside Jupiter.",
      "The Great Red Spot is a storm larger than Earth, centuries old.",
      "Its gravity shepherds asteroids and deflects many comets.",
      "On the walk, Jupiter sits after a long stretch of empty “asteroid belt” space.",
    ],
    campus: {
      x: 62,
      y: 40,
      label: "Jupiter",
      landmark: "North campus corridor",
    },
  },
  saturn: {
    slug: "saturn",
    name: "Saturn",
    subtitle: "Ringed giant",
    tileImage: "/tiles/saturn.jpg",
    tileCaption: "7×5″ vinyl tile · Cloud bands",
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
      landmark: "West walk toward Observatory",
    },
  },
  uranus: {
    slug: "uranus",
    name: "Uranus",
    subtitle: "Ice giant · tipped world",
    tileImage: "/tiles/uranus.jpg",
    tileCaption: "7×5″ vinyl tile · Atmosphere",
    texture: "/textures/uranus.jpg",
    color: "#7ec8c8",
    size: 0.85,
    facts: [
      "Uranus rotates on its side — likely from an ancient collision.",
      "At 19 AU, sunlight is about 1/361 as bright as on Earth.",
      "It was the first planet discovered with a telescope (1781).",
      "Methane in its atmosphere gives the cyan-blue color.",
    ],
    campus: {
      x: 80,
      y: 30,
      label: "Uranus",
      landmark: "Observatory approach",
    },
  },
  neptune: {
    slug: "neptune",
    name: "Neptune",
    subtitle: "Windiest world",
    tileImage: "/tiles/neptune.jpg",
    tileCaption: "7×5″ vinyl tile · Dark Spot region",
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
      landmark: "Final approach path",
    },
  },
  pluto: {
    slug: "pluto",
    name: "Pluto",
    subtitle: "Observatory finale · Tombaugh Regio",
    tileImage: "/tiles/pluto.jpg",
    tileCaption: "7×5″ vinyl tile · Heart glacier",
    texture: "/textures/pluto.jpg",
    color: "#c4b5a0",
    size: 0.5,
    role: "observatory",
    facts: [
      "The campus walk ends at the Observatory — Pluto’s physical station.",
      "New Horizons revealed a heart-shaped nitrogen glacier (Sputnik Planitia).",
      "You walk ~0.36 miles to stand in for ~3.67 billion real miles.",
      "Light still needs ~5.5 hours to cross the real Sun–Pluto gap.",
    ],
    campus: {
      x: 92,
      y: 18,
      label: "Pluto",
      landmark: "Observatory · journey’s end",
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
