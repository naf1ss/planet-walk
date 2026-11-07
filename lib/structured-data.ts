import { CONTACT_LINKS, isExternalContact } from "@/lib/contact";
import { SITE } from "@/lib/constants";
import { WALK_STOPS, WALK_TOTAL_FT } from "@/lib/planetData";

/** schema.org JSON-LD so search engines connect the site, the walk and the artist. */

const PERSON_ID = `${SITE.url}/about#artist`;
const WEBSITE_ID = `${SITE.url}/#website`;
const WALK_ID = `${SITE.url}/#planet-walk`;

const GETTYSBURG_COLLEGE = {
  "@type": "CollegeOrUniversity",
  name: "Gettysburg College",
  url: "https://www.gettysburg.edu",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gettysburg",
    addressRegion: "PA",
    addressCountry: "US",
  },
};

function artist() {
  const portfolio = CONTACT_LINKS.find((l) => l.id === "portfolio");
  const email = CONTACT_LINKS.find((l) => l.id === "email");
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.author,
    alternateName: ["Nafis", "Nafisul Hasan Sami"],
    jobTitle: "Multidisciplinary artist",
    description:
      "Multidisciplinary artist and Gettysburg College student working across studio art, mathematics, and data science; creator of the Gettysburg Planet Walk.",
    url: portfolio?.href,
    email: email?.href,
    image: `${SITE.url}/og-image.jpg`,
    affiliation: GETTYSBURG_COLLEGE,
    knowsAbout: ["Studio art", "Mathematics", "Data science", "Ceramics", "Mural painting"],
    sameAs: CONTACT_LINKS.filter(isExternalContact).map((l) => l.href),
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    alternateName: ["Gettysburg Planet Walk", "Gettysburg College Planet Walk"],
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-US",
    creator: { "@id": PERSON_ID },
    about: { "@id": WALK_ID },
  };
}

function planetWalk() {
  return {
    "@type": "CreativeWork",
    "@id": WALK_ID,
    name: "Gettysburg Planet Walk",
    alternateName: "Planet Walk",
    description: `A walkable scale model of the solar system across ${Math.round(WALK_TOTAL_FT).toLocaleString("en-US")} feet of the Gettysburg College campus, with ${WALK_STOPS.length} stops from the Sun at Masters Hall's Hatter Planetarium to Pluto at the College Observatory.`,
    url: SITE.url,
    image: `${SITE.url}/og-image.jpg`,
    creator: { "@id": PERSON_ID },
    contributor: {
      "@type": "Person",
      name: "Ryan Johnson",
      jobTitle: "Professor of Physics & Astronomy",
      affiliation: GETTYSBURG_COLLEGE,
    },
    locationCreated: {
      "@type": "Place",
      name: "Gettysburg College",
      address: GETTYSBURG_COLLEGE.address,
    },
    keywords:
      "planet walk, solar system scale model, Gettysburg College, astronomy, public art, ceramic tiles, mural",
  };
}

/** Home: site + installation + artist graph. */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [website(), planetWalk(), artist()],
  };
}

/** About: profile page for the artist. */
export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE.url}/about`,
        url: `${SITE.url}/about`,
        name: `About ${SITE.author} · ${SITE.name}`,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      artist(),
      planetWalk(),
    ],
  };
}
