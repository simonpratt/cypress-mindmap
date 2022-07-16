import { DEFAULT_FONT, LINE_SPACING_FACTOR } from '../constants/render.constants';

export const renderTextBlock = (
  canvas2D: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  fontSize: number,
) => {
  canvas2D.fillStyle = '#e2e2e2';
  canvas2D.font = DEFAULT_FONT;

  lines.forEach((line, index) => {
    const yTotal = y + index * (fontSize + fontSize * LINE_SPACING_FACTOR);
    canvas2D.fillText(line, x, yTotal);
  });
};
