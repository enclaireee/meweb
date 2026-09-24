import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ProjectCards } from "@/ui/ProjectCards/ProjectCards";

const project = projects["komat"];

export default function Section() {
  return (
    <StationShell index={4} labelledBy={`${project.slug}-title`}>
      <ProjectCards index={4} project={project} />
    </StationShell>
  );
}
