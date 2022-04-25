export type Nullable<T> = T | null;

export interface NonogramCellChange {
  index: number;
  value: number;
}

export interface NonogramCellRange {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  value: number;
}

export interface NonogramChangeHistory {
  index: number;
  oldValue: number;
  newValue: number;
}

export type NonogramHistory = (NonogramChangeHistory | NonogramChangeHistory[])[];
