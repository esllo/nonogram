export default class Nonogram {
  cells: Uint8Array;
  rowSize: number;
  columnSize: number;
  rowGuides: number[][];
  columnGuides: number[][];

  constructor(rowSize: number, columnSize: number) {
    this.rowSize = rowSize || 0;
    this.columnSize = columnSize || 0;
    this.rowGuides = [];
    this.columnGuides = [];
    this.cells = new Uint8Array(new Array(this.cellLength).fill(0));
  }

  updateGuide(cells: Uint8Array | number[] = this.cells) {
    const rowGuides: number[][] = new Array(this.rowSize).fill(0).map(() => []);
    const columnGuides: number[][] = new Array(this.rowSize).fill(0).map(() => []);
    const rowGuideJitter: boolean[] = new Array(this.rowSize).fill(false);
    const columnGuideJitter: boolean[] = new Array(this.columnSize).fill(false);
    for (let row = 0; row < this.rowSize; row++) {
      for (let column = 0; column < this.columnSize; column++) {
        const cellIndex = row * this.rowSize + column;
        const rowGuide = rowGuides[row];
        const columnGuide = columnGuides[column];
        const fill = cells[cellIndex];
        if (fill) {
          if (rowGuideJitter[row]) {
            rowGuide[rowGuide.length - 1] += 1;
          } else {
            rowGuide.push(1);
          }
          rowGuideJitter[row] = true;

          if (columnGuideJitter[column]) {
            columnGuide[columnGuide.length - 1] += 1;
          } else {
            columnGuide.push(1);
          }
          columnGuideJitter[column] = true;
        } else {
          if (rowGuideJitter[row]) {
            rowGuideJitter[row] = false;
          }
          if (columnGuideJitter[column]) {
            columnGuideJitter[column] = false;
          }
        }
      }
    }
    this.rowGuides = rowGuides;
    this.columnGuides = columnGuides;
  }

  generate(fillRate: number = 0.5) {
    const cells: number[] = [];
    for (let row = 0; row < this.rowSize; row++) {
      for (let column = 0; column < this.columnSize; column++) {
        const cellIndex = row * this.rowSize + column;
        const fill = Math.random() < fillRate ? 1 : 0;
        cells[cellIndex] = fill;
      }
    }
    this.cells = new Uint8Array(cells);
    this.updateGuide();
  }

  get cellLength() {
    return this.rowSize * this.columnSize;
  }

  get rowGuideSize() {
    return this.getMaxGuideSize(this.rowGuides);
  }

  get fullRowSize() {
    return this.rowSize + this.columnGuideSize;
  }

  get columnGuideSize() {
    return this.getMaxGuideSize(this.columnGuides);
  }

  get fullColumnSize() {
    return this.columnSize + this.rowGuideSize;
  }

  getMaxGuideSize(guides: number[][]) {
    const guideSizes = guides.map((guide) => guide.length);
    const maxGuideSize = Math.max(...guideSizes, 0);
    return maxGuideSize;
  }

  getCell(column: number, row: number) {
    const cellIndex = row * this.rowSize + column;
    return this.cells[cellIndex] || 0;
  }
}
