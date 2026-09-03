/**
 * Editorial site config: what the nav says, what the footer holds, what the
 * search engines get. (The canonical URL is infrastructure, not editorial —
 * it stays in src/lib/site.ts.)
 *
 * Adding a nav item or a footer column is one object here. No component knows
 * any of these strings.
 */
export const site = {
  /** Wordmark in the nav and the footer. */
  wordmark: "Fatih Zamzami",

  /** The page is one document. These are section anchors, not routes —
   *  they work from a case-study page too, because they are rooted at "/".
   *  This one list drives the nav, the scroll-spy and the footer nav. */
  sections: [
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
  ],

  /** IANA zone. The footer prints the offset from this, so it never goes
   *  stale the way a hardcoded "GMT+7" would. */
  timezone: "Asia/Jakarta",
  timezoneLabel: "Jakarta",

  /** null until the file exists — a footer link to a 404 is worse than no
   *  link. Drop the PDF at public/cv.pdf, then set this to
   *  `{ href: "/cv.pdf", label: "Curriculum vitae (PDF)" }` and it appears. */
  cv: null as { href: string; label: string } | null,

  /** Section copy and meta descriptions. Components own layout, not words. */
  pages: {
    home: {
      description:
        "Electrical engineering undergraduate at Universitas Indonesia: brain–computer interfaces, OT monitoring, embedded hardware, and the web.",
    },
    work: {
      title: "Work",
      lead: "Everything I have built and written up, roughly in the order I care about them. Each one covers what it does and where it went wrong.",
    },
    notFound: {
      title: "404",
      lead: "Nothing lives at this address. It may have been renamed, or it may never have existed and you found a typo of mine.",
      action: "Back to the work",
    },
  },

  footer: {
    heading: "Say hello.",
    lead: "The fastest way to reach me is email. WhatsApp and LINE both work too.",
    backToTop: "Back to top",
  },

  /** Baked at build time — this is genuinely when the site last changed. */
  lastUpdated: new Date().toISOString(),
} as const;
