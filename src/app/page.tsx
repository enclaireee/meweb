import Desk from "@/sections/00-desk/Section";
import Storeroom from "@/sections/01-storeroom/Section";
import ControlRoom from "@/sections/02-control-room/Section";
import Arcade from "@/sections/03-arcade/Section";
import Drafting from "@/sections/04-drafting/Section";
import Sill from "@/sections/05-sill/Section";
import Wall from "@/sections/06-wall/Section";
import Window from "@/sections/07-window/Section";
import { SceneMount } from "@/scene/SceneMount";
import { DepthTag } from "@/ui/DepthTag/DepthTag";
import { RelightDial } from "@/ui/RelightDial/RelightDial";
import { HintStrip } from "@/ui/HintStrip/HintStrip";

export default function Home() {
  return (
    <>
      {/* the still of the desk: LCP, and the whole backdrop when there's no WebGL */}
      <div className="poster" aria-hidden />
      <SceneMount />
      <DepthTag />
      <RelightDial />
      <HintStrip />
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
