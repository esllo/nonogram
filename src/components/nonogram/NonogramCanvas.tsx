import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNonogram } from '@/modules/nonogram';
import useNonogram from './NonogramCanvas.hook';
import Nonogram from '@/lib/Nonogram';

interface Props {
  drawMode: boolean;
}

const NonogramCanvas = ({ drawMode }: Props) => {
  const { canvasRef, handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp } =
    useNonogram(drawMode);
  const dispatch = useDispatch();

  useEffect(() => {
    const nonogram = new Nonogram(10, 10);
    if (!drawMode) {
      nonogram.generate();
    }
    dispatch(setNonogram(nonogram));
  }, []);

  return (
    <div>
      <canvas
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        ref={canvasRef}
      ></canvas>
    </div>
  );
};

export default NonogramCanvas;
