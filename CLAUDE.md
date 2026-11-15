@AGENTS.md

## Claude Code specifics
- Main session = Opus (lead). Subagent mapping: `scout`/`triage`/`Explore` = Haiku; `implementer`/`test-writer`/`reviewer`/`researcher`/`ui-*`/`visual-verifier` = Sonnet; `deep-implementer`/`security-reviewer` = Opus.
- If launched as a subagent with a brief: ignore the lane/approval rules above, do only the brief, return the summary.
- State the lane and a one-line reason before starting work.
- Check `git diff` after any delegation before reporting done.
