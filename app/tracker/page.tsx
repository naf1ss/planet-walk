import type { Metadata } from "next";
import { WalkTracker } from "@/components/tracker/WalkTracker";
import { pageSeo } from "@/lib/seo";

const TRACKER_DESCRIPTION =
  "Digital passport for the Gettysburg Planet Walk — check off all 11 solar system stops across Gettysburg College, time your walk, and share your finish card.";

export const metadata: Metadata = {
  title: "Walk Tracker",
  description: TRACKER_DESCRIPTION,
  ...pageSeo({
    path: "/tracker",
    title: "Walk Tracker · Gettysburg Planet Walk",
    description: TRACKER_DESCRIPTION,
  }),
};

export default function TrackerPage() {
  return <WalkTracker />;
}
