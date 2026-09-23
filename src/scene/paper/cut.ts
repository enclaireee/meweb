/** The contract between scripts/cut (writer) and the scene (reader). Coordinates are world units, y up. */
export type CutPiece = { outer: number[]; holes: number[][] };

export type CutSheet = {
  id: string;
  stock: string;
  /** local depth (station module), already stacked */
  z: number;
  cast: boolean;
  hinge?: string;
  pivot?: [number, number];
  hang?: [number, number];
  parent?: string;
  bbox: [number, number, number, number];
  pieces: CutPiece[];
  /** the ink mount behind a part (worker), already offset; filled, no holes */
  backing?: CutPiece[];
};

export type CutFile = { name: string; sheets: CutSheet[] };
