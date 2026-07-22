/** Site navigation — extend labels/hrefs here; wire destinations later as needed. */
export type NavItem = {
  id: string;
  label: string;
  href: string;
  /** If true, smooth-scroll on the home page instead of a full navigation */
  scrollTarget?: "hero" | "explore";
};

export const NAV_ITEMS: NavItem[] = [
  {
    id: "planet-walk",
    label: "Planet Walk",
    href: "/#hero",
    scrollTarget: "hero",
  },
  {
    id: "explore",
    label: "Explore",
    href: "/#explore",
    scrollTarget: "explore",
  },
  {
    id: "map",
    label: "Map",
    href: "/map",
  },
  {
    id: "tracker",
    label: "Tracker",
    href: "/tracker",
  },
  {
    id: "about",
    label: "About",
    href: "/about",
  },
];
