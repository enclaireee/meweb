import { River } from "@/components/river/River";
import { StackedView } from "@/components/stack/StackedView";

// Server-rendered stacked document (no-JS, crawlers, screen readers) plus the river as the JS enhancement.
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#river">
        Skip to the current stop
      </a>
      <main id="main">
        <StackedView />
      </main>
      <River />
    </>
  );
}
