import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Plate } from "@/ui/Plate/Plate";

const project = projects["solar"];

export default function Section() {
  return (
    <StationShell index={5} labelledBy={`${project.slug}-title`}>
      <Plate index={5} project={project} />
    </StationShell>
  );
}
