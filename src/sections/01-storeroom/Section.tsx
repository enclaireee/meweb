import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Plate } from "@/ui/Plate/Plate";

const project = projects["demandx"];

export default function Section() {
  return (
    <StationShell index={1} labelledBy={`${project.slug}-title`}>
      <Plate index={1} project={project} />
    </StationShell>
  );
}
