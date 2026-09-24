import { projects } from "@/content/projects";
import { StationShell } from "@/ui/StationShell/StationShell";
import { ProjectCards } from "@/ui/ProjectCards/ProjectCards";

const project = projects["demandx"];

export default function Section() {
  return (
    <StationShell index={1} labelledBy={`${project.slug}-title`}>
      <ProjectCards index={1} project={project} />
    </StationShell>
  );
}
