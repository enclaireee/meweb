import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Plate } from "@/ui/Plate/Plate";

const project = projects["komat"];

export default function Section() {
  return (
    <StationShell index={4} labelledBy={`${project.slug}-title`}>
      <Plate index={4} project={project} />
    </StationShell>
  );
}
