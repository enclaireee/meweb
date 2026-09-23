import { ScrapButton } from "@/ui/ScrapButton/ScrapButton";

export const metadata = { title: "Not found" };

/** portfolio_concept.md §8: "This sheet was never cut." */
export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center p-8">
      <div className="cast" style={{ width: "min(440px, 100%)" }}>
        <div className="paper grain p-8" style={{ clipPath: "var(--clip-plate)" }}>
          <p className="text-kicker uppercase text-ink-soft">Plate 404</p>
          <h1 className="text-plate-title mt-2">This sheet was never cut.</h1>
          <p className="text-caption italic mt-3">Whatever was meant to be here is still a blank piece of card.</p>
          <div className="mt-6">
            <ScrapButton href="/">Back to the workshop</ScrapButton>
          </div>
        </div>
      </div>
    </main>
  );
}
