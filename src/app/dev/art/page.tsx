import { devOnly } from "../devOnly";
import { ArtBoard } from "./ArtBoard";

export const metadata = { title: "Art board", robots: { index: false } };

export default function Page() {
  devOnly();
  return <ArtBoard />;
}
