/**
 * Last public push from GitHub, revalidated hourly (ISR — stays static-friendly,
 * respects the unauthenticated rate limit). Renders nothing on any failure.
 */
export async function LastCommit() {
  try {
    const res = await fetch(
      "https://api.github.com/users/enclaireee/repos?sort=pushed&per_page=1",
      { next: { revalidate: 3600 }, headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return null;
    const [repo] = (await res.json()) as { name: string; pushed_at: string }[];
    if (!repo) return null;
    const days = Math.max(0, Math.floor((Date.now() - +new Date(repo.pushed_at)) / 86400000));
    return (
      <span className="label text-fg-muted">
        VCS/LAST-PUSH — {repo.name.toUpperCase()} ·{" "}
        <span className="text-ok">{days === 0 ? "TODAY" : `${days}D AGO`}</span>
      </span>
    );
  } catch {
    return null;
  }
}
