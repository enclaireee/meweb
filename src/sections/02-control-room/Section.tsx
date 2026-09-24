import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ProjectCards } from "@/ui/ProjectCards/ProjectCards";

const project = projects["ot-lab"];

export default function Section() {
  return (
    <StationShell index={2} labelledBy={`${project.slug}-title`}>
      <ProjectCards index={2} project={project} />
    </StationShell>
  );
}
