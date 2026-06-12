import type { Metadata } from "next";
import { projects } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { WorkBrowser } from "@/components/work/WorkBrowser";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Work — Muhammad Fatih Zamzami",
  description: "Selected projects across embedded systems, BCI, and full-stack web.",
};

/**
 * The browser — an index, not a gallery. Oversized title rows; hover floats
 * a live preview alongside the cursor (see WorkBrowser).
 */
export default function WorkIndex() {
  return (
    <>
      <main className="px-gutter pb-28 pt-section lg:pb-section">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SplitLines as="h1" immediate className="font-display text-hero">
            Work.
          </SplitLines>
          <p className="annot pb-3 text-muted">
            {String(projects.length).padStart(2, "0")} projects — hover to preview
          </p>
        </div>

        <div className="mt-16">
          <WorkBrowser />
        </div>
      </main>
      <Footer />
    </>
  );
}
