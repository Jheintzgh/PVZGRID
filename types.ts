
export interface GridCell {
  id: string;
  value: string;
  color: string;
  intensity: number; // 0 to 100
}

export type GridData = GridCell[][];

export interface AISuggestion {
  rows: string[][];
  colors: string[][];
}
