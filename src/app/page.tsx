import Desk from "@/sections/00-desk/Section";
import Storeroom from "@/sections/01-storeroom/Section";
import ControlRoom from "@/sections/02-control-room/Section";
import Arcade from "@/sections/03-arcade/Section";
import Drafting from "@/sections/04-drafting/Section";
import Sill from "@/sections/05-sill/Section";
import Wall from "@/sections/06-wall/Section";
import Window from "@/sections/07-window/Section";
import { SceneMount } from "@/scene/SceneMount";
import { SiteNav } from "@/ui/SiteNav/SiteNav";
import { RelightDial } from "@/ui/RelightDial/RelightDial";
import { HintStrip } from "@/ui/HintStrip/HintStrip";
import { Loader } from "@/ui/Loader/Loader";
import { preload } from "react-dom";
import { Deck } from "@/ui/Deck/Deck";
import { Storyteller } from "@/ui/Deck/Storyteller";
import { PHONE } from "@/ui/Deck/phone";

export default function Home() {
  // phones: the desk card's backdrop band is the first paint (mobile_concept.md §6); desktop never asks
  preload("/rooms/about-night-b0.avif", { as: "image", fetchPriority: "high", media: PHONE });
  return (
    <>
      {/* the still of the desk: LCP, and the whole backdrop when there's no WebGL */}
      <div className="poster" aria-hidden />
      <SceneMount />
      <SiteNav />
      <RelightDial />
      <HintStrip />
      <Deck puppet={<Storyteller />} />
      <Loader />
      <main id="main">
        <Desk />
        <Storeroom />
        <ControlRoom />
        <Arcade />
        <Drafting />
        <Sill />
        <Wall />
        <Window />
      </main>
    </>
  );
}
