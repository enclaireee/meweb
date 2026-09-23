import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Plate } from "@/ui/Plate/Plate";

const project = projects["refocus"];

export default function Section() {
  return (
    <StationShell index={3} labelledBy={`${project.slug}-title`}>
      <Plate index={3} project={project} />
    </StationShell>
  );
}
