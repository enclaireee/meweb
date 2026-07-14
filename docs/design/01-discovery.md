# Phase 1 — Discovery

Source: CV.md (July 2026 version, provided by Fatih; not committed — contains
personal phone number and the repo is public).

## 1. Positioning statement

**A control-systems engineer who closes feedback loops at every scale — EEG
headsets, solar rigs, industrial SCADA networks, and the web apps that sit on
top of them.**

Within 5 seconds the reader should believe: *this person is not "a student who
made a React portfolio" — they move between hardware and software because the
underlying discipline (sense → decide → respond) is the same.* The
cross-domain range IS the product; no single project sells it, the spread does.

## 2. Audience map (ranked)

1. **Internship/early-career recruiters & hiring engineers** — 30-second scan.
   Need: name, school, the one-line positioning, 3–4 project titles with
   stacks, current role (PGNCOM SCADA intern), contact. Everything scannable
   from `/` alone.
2. **Engineers evaluating depth** — will open exactly one case study and judge
   the whole person on it. Need: problem → constraints → decisions → outcome,
   real technical vocabulary (DWT feature extraction, GMM ensemble, Zabbix API
   provisioning), honest tradeoffs.
3. **Collaborators & competition judges** — judging taste and execution.
   Served by the craft of the site itself, not by dedicated content.

Ranking rationale: a 4th-semester student's #1 conversion event is an
internship/job conversation, not a peer following.

## 3. Content inventory

| Section | Narrative job | CV substance | Verdict |
|---|---|---|---|
| Hero | Land the positioning in one line | Profile summary | Keep |
| Selected work | Proof. The core of the site | 4 real projects, each with genuine depth | Keep — now **4** case studies (v1 had 3; the OT Observability Lab joins as the strongest professional one) |
| Experience | Trajectory + credibility (intern → TA → R&D head → jamboree leader) | 6 roles with real outcomes | Keep, compressed — top 4 roles detailed, rest one-liners |
| About | The person; why the range is deliberate | Summary + leadership thread | Keep, short |
| Skills/toolkit | Recruiter scan fodder | Languages, frameworks, engineering | Keep, compact list — never a grid of logos or "90% proficiency" bars |
| Awards | Third-party validation | ProtoTech 2nd place (IEEE ITB), Best BPH | Keep as a two-line footnote inside About/Experience, not a section |
| Contact | Conversion | Email, LinkedIn, GitHub, location, availability | Keep |
| Blog/notes, testimonials, /uses | — | CV cannot fill them | **Killed** |

### The four case studies

1. **Neuro-adaptive ADHD game** — the wow: closed-loop BCI, EEG → DWT → GMM → Godot difficulty.
2. **OT Observability Lab** (+ PGNCOM internship context) — the professional one: catalog-driven Zabbix provisioning, telemetry simulation, failure-chain detection.
3. **KOMAT UNPAR** — the shipped-to-production one: real users nationwide, payments, admin dashboard.
4. **Solar monitor** — the hardware one: PV + INA219 + Arduino + OLED, small but tactile.

Each proves a different claim; together they prove the positioning.

## 4. Site map & information hierarchy

```
/               hero → selected work (4) → experience → about-in-brief → contact close
/work           index of case studies (4 entries — earns its route as the "engineer's entry point")
/work/[slug]    case study template (problem → constraints → built → decisions/tradeoffs → outcome → stack)
/about          full narrative + experience detail + awards footnote
404             personality slot
```

- **Contact is a section + footer, not a route.** One email and three social
  links don't earn a page; v1's `/contact` form was simulated anyway (never
  wired to a backend). Killing the form removes a fake affordance — a
  `mailto` + copy-email interaction is honest and lighter.
- Modal/drawer tier: none required by content. (A command palette, if Phase 6
  picks one, is chrome — not IA.)

## 5. Adjectives

**Should feel:** engineered · alive · deliberate
(engineered — built, not decorated; alive — things respond, befitting a
control-systems thesis; deliberate — every element defensible in an interview.)

**Must never feel:** template-y · decorative · corporate
(and per the v2 mandate: must not read as a variant of v1's warm-paper
editorial-annotation look.)

## Open questions for Fatih

1. OK to fold the PGNCOM internship narrative into the OT Lab case study
   (single strongest story) rather than duplicating it in two places?
2. Contact form is killed in favor of mailto/copy-email — confirm.
3. "Open to internships, freelance builds, and odd hardware problems" — still
   the availability line you want?
