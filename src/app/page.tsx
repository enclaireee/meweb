import { Intro } from "@/components/sections/Intro";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { ContactClose } from "@/components/sections/ContactClose";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Intro />
      <main>
        <Hero />
        <About />
        <Work />
        <ContactClose />
      </main>
      <Footer />
    </>
  );
}
