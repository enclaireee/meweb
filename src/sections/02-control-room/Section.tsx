import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Plate } from "@/ui/Plate/Plate";

const project = projects["ot-lab"];

export default function Section() {
  return (
    <StationShell index={2} labelledBy={`${project.slug}-title`}>
      <Plate index={2} project={project} />
    </StationShell>
  );
}
