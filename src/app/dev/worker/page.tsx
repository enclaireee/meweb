import { devOnly } from "../devOnly";
import { WorkerPreview } from "./WorkerPreview";

export const metadata = { title: "Worker", robots: { index: false } };

export default function Page() {
  devOnly();
  return <WorkerPreview />;
}
