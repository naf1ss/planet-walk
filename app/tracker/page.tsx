import type { Metadata } from "next";
import { WalkTracker } from "@/components/tracker/WalkTracker";

export const metadata: Metadata = {
  title: "Tracker",
  description:
    "Digital passport for the Gettysburg Planet Walk — checklist, timer, and miles walked.",
};

export default function TrackerPage() {
  return <WalkTracker />;
}
