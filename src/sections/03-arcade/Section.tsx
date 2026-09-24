import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ProjectCards } from "@/ui/ProjectCards/ProjectCards";

const project = projects["refocus"];

export default function Section() {
  return (
    <StationShell index={3} labelledBy={`${project.slug}-title`}>
      <ProjectCards index={3} project={project} />
    </StationShell>
  );
}
