import Nonogram from '@/lib/Nonogram';
import { symlink } from 'fs';
import {
  NonogramCellChange,
  NonogramCellRange,
  NonogramChangeHistory,
  NonogramHistory,
  Nullable,
} from '../types';

const NONOGRAM_SET = 'nonogram/SET' as const;
const NONOGRAM_CELL_CHANGE = 'nonogram/CELL_CHANGE' as const;
const NONOGRAM_CELL_RANGE_CHANGE = 'nonogram/CELL_RANGE_CHANGE' as const;

export const setNonogram = (nonogram: Nonogram) => ({
  type: NONOGRAM_SET,
  payload: nonogram,
});

export const setNonogramCellChange = (index: number, value: number) => {
  const payload: NonogramCellChange = {
    index,
    value,
  };
  return {
    type: NONOGRAM_CELL_CHANGE,
    payload,
  };
};

export const setNonogramCellRangeChange = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  value: number,
) => {
  const payload: NonogramCellRange = {
    startX,
    startY,
    endX,
    endY,
    value,
  };
  return {
    type: NONOGRAM_CELL_RANGE_CHANGE,
    payload,
  };
};

type NonogramAction =
  | ReturnType<typeof setNonogram>
  | ReturnType<typeof setNonogramCellChange>
  | ReturnType<typeof setNonogramCellRangeChange>;

interface NonogramState {
  nonogram: Nullable<Nonogram>;
  cells: number[];
  history: NonogramHistory;
}

const initialState: NonogramState = {
  nonogram: null,
  cells: [],
  history: [],
};

const nonogram = (state: NonogramState = initialState, action: NonogramAction): NonogramState => {
  switch (action.type) {
    case NONOGRAM_SET:
      const cells = new Array(action.payload.cellLength).fill(0);
      return {
        ...state,
        cells,
        nonogram: action.payload,
      };
    case NONOGRAM_CELL_CHANGE:
      const { index, value: newValue } = action.payload;
      const oldValue = state.cells[index];
      const historyItem: NonogramChangeHistory = {
        index,
        oldValue,
        newValue,
      };
      const history = [...state.history, historyItem];
      state.cells[index] = newValue;
      return {
        ...state,
        cells: state.cells,
        history,
      };
    case NONOGRAM_CELL_RANGE_CHANGE:
      if (state.nonogram) {
        const { rowSize } = state.nonogram;
        const { startX, startY, endX, endY, value } = action.payload;
        const historyGroup = [];
        for (let x = startX; x <= endX; x++) {
          for (let y = startY; y <= endY; y++) {
            const index = x + y * rowSize;
            const oldValue = state.cells[index];
            const historyItem: NonogramChangeHistory = {
              index,
              oldValue,
              newValue: value,
            };
            historyGroup.push(historyItem);
            state.cells[index] = value;
          }
        }
        const history = [...state.history, historyGroup];

        return {
          ...state,
          cells: state.cells,
          history,
        };
      }
    default:
      return state;
  }
};

export default nonogram;
