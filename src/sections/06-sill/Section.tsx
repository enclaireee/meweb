import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ProjectCards } from "@/ui/ProjectCards/ProjectCards";

const project = projects["solar"];

export default function Section() {
  return (
    <StationShell index={6} labelledBy={`${project.slug}-title`}>
      <ProjectCards index={6} project={project} />
    </StationShell>
  );
}
