import { Intro } from "@/components/sections/Intro";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { NavRail } from "@/components/ui/NavRail";

export default function Home() {
  return (
    <>
      <Intro />
      <NavRail />
      <main>
        <Hero />
        <About />
        <Work />
        <Capabilities />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
