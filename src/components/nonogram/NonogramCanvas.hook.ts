import Nonogram from '@/lib/Nonogram';
import { RootState } from '@/modules';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { NonogramHistory, Nullable } from '@/types';
import { useDispatch } from 'react-redux';
import { setNonogramCellChange, setNonogramCellRangeChange } from '@/modules/nonogram';
import throttle from '@/lib/throttle';

interface CellPoint {
  cellX: number;
  cellY: number;
  type: number;
}

let canvas: Nullable<HTMLCanvasElement> = null;
let context: Nullable<CanvasRenderingContext2D> = null;
let mouseDown: boolean = false;
let startPoint: CellPoint = { cellX: -1, cellY: -1, type: 0 };
let endPoint: CellPoint = { cellX: -1, cellY: -1, type: 0 };

const useNonogram = (drawMode: boolean) => {
  const nonogram: Nullable<Nonogram> = useSelector((state: RootState) => state.nonogram.nonogram);
  const history: NonogramHistory = useSelector((state: RootState) => state.nonogram.history);
  const cells: number[] = useSelector((state: RootState) => state.nonogram.cells);

  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const [bound, setBound] = useState({ left: 0, top: 0 });
  const [cellSize, setCellSize] = useState(16);

  useEffect(() => {
    if (canvasRef.current) {
      canvas = canvasRef.current as HTMLCanvasElement;
      context = canvas.getContext('2d');
      canvas.width = 500;
      canvas.height = 500;
      canvas.style.width = '500px';
      canvas.style.height = '500px';

      setBound(canvas.getBoundingClientRect());

      render();
    }
  }, []);

  useEffect(() => {
    if (drawMode) {
      nonogram?.updateGuide(cells);
    }
    render();
  }, [nonogram, history]);

  const render = () => {
    if (canvas && context) {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.strokeRect(0, 0, width, height);
      context.translate(0.5, 0.5);
      renderLines(context);
      context.translate(-0.5, -0.5);
    }
  };

  const renderLines = (context: CanvasRenderingContext2D) => {
    if (nonogram) {
      const {
        rowGuideSize,
        columnGuideSize,
        fullRowSize,
        fullColumnSize,
        rowSize,
        columnSize,
        rowGuides,
        columnGuides,
      } = nonogram;
      const rowLineLength = fullRowSize * cellSize;
      const columnLineLength = fullColumnSize * cellSize;
      context.textAlign = 'center';
      context.lineWidth = 1;
      context.textBaseline = 'middle';
      for (let row = columnGuideSize; row < fullRowSize + 1; row++) {
        if ((row - columnGuideSize) % 5 === 0) {
          context.strokeStyle = '#000000';
        } else {
          context.strokeStyle = '#cccccc';
        }
        const y = row * cellSize + cellSize / 2;
        context.beginPath();
        context.moveTo(cellSize / 2, y);
        context.lineTo(cellSize / 2 + columnLineLength, y);
        context.stroke();

        for (let column = rowGuideSize; column < fullColumnSize + 1; column++) {
          if ((column - rowGuideSize) % 5 === 0) {
            context.strokeStyle = '#000000';
          } else {
            context.strokeStyle = '#cccccc';
          }
          const x = column * cellSize + cellSize / 2;
          context.beginPath();
          context.moveTo(x, cellSize / 2);
          context.lineTo(x, cellSize / 2 + rowLineLength);
          context.stroke();

          context.strokeStyle = '#000';
          if (row < fullRowSize && column < fullColumnSize) {
            const cellX = column - rowGuideSize;
            const cellY = row - columnGuideSize;
            if (isDrawingCell(cellX, cellY)) {
              context.fillStyle = '#000';
              context.strokeStyle = '#000';
              const fillSize = cellSize - 4;
              context.fillRect(x + 2, y + 2, fillSize, fillSize);
              context.strokeRect(x + 2, y + 2, fillSize, fillSize);
            }
          }
        }
      }

      context.strokeStyle = '#000';
      for (let column = 0; column < columnSize; column++) {
        const guide = columnGuides[column];
        if (guide) {
          const x = (rowGuideSize + column + 1) * cellSize;
          const offset = columnGuideSize - guide.length + 1;
          guide.forEach((count, row) => {
            const y = (row + offset) * cellSize;
            context.strokeText(count.toString(), x, y);
          });
        }
      }
      for (let row = 0; row < rowSize; row++) {
        const guide = rowGuides[row];
        if (guide) {
          const y = (columnGuideSize + row + 1) * cellSize;
          const offset = rowGuideSize - guide.length + 1;
          guide.forEach((count, column) => {
            const x = (column + offset) * cellSize;
            context.strokeText(count.toString(), x, y);
          });
        }
      }
    }
  };

  function getMinMax(x: number, y: number): [number, number] {
    if (x < y) {
      return [x, y];
    }
    return [y, x];
  }

  function isValidCellX(cellX: number): boolean {
    if (nonogram) {
      const { rowSize } = nonogram;

      if (0 <= cellX && cellX < rowSize) {
        return true;
      }
    }
    return false;
  }

  function isValidCellY(cellY: number): boolean {
    if (nonogram) {
      const { columnSize } = nonogram;

      if (0 <= cellY && cellY < columnSize) {
        return true;
      }
    }
    return false;
  }

  function isValidPoint(cellX: number, cellY: number): boolean {
    return isValidCellX(cellX) && isValidCellY(cellY);
  }

  function isSinglePoint(): boolean {
    return startPoint.cellX === endPoint.cellX && startPoint.cellY === endPoint.cellY;
  }

  function isDrawingCell(cellX: number, cellY: number) {
    if (nonogram) {
      const cell = cells[cellX + cellY * nonogram.rowSize];
      if (mouseDown) {
        const fill = startPoint.type === 1;
        const [minX, maxX] = getMinMax(startPoint.cellX, endPoint.cellX);
        const [minY, maxY] = getMinMax(startPoint.cellY, endPoint.cellY);
        if (minX <= cellX && cellX <= maxX) {
          if (minY <= cellY && cellY <= maxY) {
            return fill ? true : false;
          }
        }
      }
      return cell > 0;
    }
    return false;
  }

  function handleCanvasMouseDown(event: React.MouseEvent) {
    mouseDown = true;
    if (nonogram) {
      const { rowGuideSize, columnGuideSize, rowSize, cellLength } = nonogram;
      const { clientX, clientY } = event;
      const { left, top } = bound;
      const x = clientX - left - cellSize / 2;
      const y = clientY - top - cellSize / 2;
      const cellX = Math.floor(x / cellSize) - rowGuideSize;
      const cellY = Math.floor(y / cellSize) - columnGuideSize;
      const index = cellX + cellY * rowSize;
      const type = cells[index] === 0 ? 1 : 0;
      if (isValidPoint(cellX, cellY)) {
        startPoint = endPoint = {
          cellX,
          cellY,
          type,
        };
      }
      render();
    }
  }

  const handleCanvasMouseMove = throttle(function (event: React.MouseEvent) {
    if (nonogram && mouseDown) {
      const { rowGuideSize, columnGuideSize, rowSize, cellLength } = nonogram;
      const { clientX, clientY } = event;
      const { left, top } = bound;
      const x = clientX - left - cellSize / 2;
      const y = clientY - top - cellSize / 2;
      const cellX = Math.floor(x / cellSize) - rowGuideSize;
      const cellY = Math.floor(y / cellSize) - columnGuideSize;
      const index = cellX + cellY * rowSize;
      const type = cells[index] === 0 ? 1 : 0;
      if (isValidCellX(cellX)) {
        endPoint = {
          ...endPoint,
          cellX,
        };
      }
      if (isValidCellY(cellY)) {
        endPoint = {
          ...endPoint,
          cellY,
        };
      }
      render();
    }
  }, 20);

  function handleCanvasMouseUp(event: React.MouseEvent) {
    if (nonogram) {
      const { rowGuideSize, columnGuideSize, rowSize, columnSize, cellLength } = nonogram;
      const { clientX, clientY } = event;
      const { left, top } = bound;
      const x = clientX - left - cellSize / 2;
      const y = clientY - top - cellSize / 2;
      const cellX = Math.floor(x / cellSize) - rowGuideSize;
      const cellY = Math.floor(y / cellSize) - columnGuideSize;
      const index = cellX + cellY * rowSize;
      if (index < cellLength && isSinglePoint()) {
        if (isValidPoint(cellX, cellY)) {
          dispatch(setNonogramCellChange(index, cells[index] === 0 ? 1 : 0));
        }
      } else {
        const [cellMinX, cellMaxX] = getMinMax(startPoint.cellX, endPoint.cellX);
        const [cellMinY, cellMaxY] = getMinMax(startPoint.cellY, endPoint.cellY);

        const startX = Math.max(cellMinX, 0);
        const endX = Math.min(cellMaxX, rowSize);
        const startY = Math.max(cellMinY, 0);
        const endY = Math.min(cellMaxY, columnSize);
        dispatch(setNonogramCellRangeChange(startX, startY, endX, endY, startPoint.type));
      }
    }
    startPoint = { cellX: -1, cellY: -1, type: 0 };
    endPoint = { cellX: -1, cellY: -1, type: 0 };
    mouseDown = false;
  }

  return {
    canvasRef,
    render,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  };
};

export default useNonogram;
