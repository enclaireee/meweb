export type Lang = 'en' | 'id';
export type L = Record<Lang, string>;
export type BeatSlug =
  | 'b0-outside'
  | 'b1-approach'
  | 'b2-first-fold'
  | 'b3-scale-flip'
  | 'b4-inner-sun'
  | 'b5-understory'
  | 'b6-lantern-vault'
  | 'b7-second-fold'
  | 'b8-seam'
  | 'b9-window';
export type Project = {
  id: string;
  title: L;
  period: L;
  role: L;
  summary: L;
  facts: L[];
  tags: string[];
  group: 'web' | 'data' | 'hardware';
  links: { label: L; href: string }[];
  media: { src: string; alt: L }[];
};
export type Beat = { line: L; label: L; facts?: L[] };
