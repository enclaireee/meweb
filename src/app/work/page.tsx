import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { projects } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { Footer } from "@/components/ui/Footer";
import { projectPlaceholder } from "@/lib/project-media";

export const metadata: Metadata = {
  title: "Work — Muhammad Fatih Zamzami",
  description: "Selected projects across embedded systems, BCI, and full-stack web.",
};

export default function WorkIndex() {
  return (
    <>
      <main className="px-gutter pt-section">
        <p className="annot text-muted">selected work</p>
        <SplitLines as="h1" immediate className="font-display text-hero mt-6">
          Work.
        </SplitLines>

        <Stagger className="mt-20">
          {projects.map((p, i) => (
            <StaggerItem key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                data-cursor="open"
                className="group grid grid-cols-12 items-center gap-x-4 gap-y-6 border-t border-border py-10 transition-colors duration-300 hover:bg-surface/60"
              >
                <p className="annot col-span-12 text-muted sm:col-span-2">
                  {String(i + 1).padStart(2, "0")} / {p.year}
                </p>
                <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                  <ImageReveal from="left" className="aspect-[4/3]">
                    <Placeholder id={projectPlaceholder[p.slug]} />
                  </ImageReveal>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-7">
                  <h2 className="font-display text-heading transition-colors duration-300 group-hover:text-accent">
                    {p.title}
                  </h2>
                  <p className="mt-2 font-display text-lead italic text-muted">{p.tagline}</p>
                  <p className="annot mt-4 text-muted">
                    {p.domain}
                    {p.status === "in-progress" && (
                      <span className="ml-2 text-accent">● in progress</span>
                    )}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </main>
      <div className="mt-24" />
      <Footer />
    </>
  );
}
