/** Artist contact + portfolio links — shown on About and in the footer. */
export type ContactLinkId =
  | "portfolio"
  | "instagram"
  | "linkedin"
  | "github"
  | "email";

export type ContactLink = {
  id: ContactLinkId;
  label: string;
  /** Short human-readable form of the destination */
  display: string;
  href: string;
};

export const CONTACT_LINKS: ContactLink[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    display: "nuancesbynafis.com",
    href: "https://nuancesbynafis.com",
  },
  {
    id: "instagram",
    label: "Instagram",
    display: "@nuancesbynafis",
    href: "https://www.instagram.com/nuancesbynafis/",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    display: "nafisulhasansami",
    href: "https://www.linkedin.com/in/nafisulhasansami/",
  },
  {
    id: "github",
    label: "GitHub",
    display: "naf1ss",
    href: "https://github.com/naf1ss",
  },
  {
    id: "email",
    label: "Email",
    display: "nafisulhasansamimd@gmail.com",
    href: "mailto:nafisulhasansamimd@gmail.com",
  },
];

export function isExternalContact(link: ContactLink) {
  return !link.href.startsWith("mailto:");
}
