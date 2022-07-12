const getWindowCoordsOnCanvas = (canvas2D: CanvasRenderingContext2D, x: number, y: number) => {
  const transformationMatrix = canvas2D.getTransform();

  // Point on the screen -> where it is now on the canvas -> subtract back to find original point
  const topLeft = new window.DOMPoint(x, y);
  const canvasPoint = topLeft.matrixTransform(transformationMatrix);
  console.log('in window coords', x, y, canvasPoint);
  return {
    x: x - (canvasPoint.x - x),
    y: y - (canvasPoint.y - y),
  };
};

export const getVisibleCanvasBounds = (
  canvas: HTMLCanvasElement,
  canvas2D: CanvasRenderingContext2D,
  translateX: number,
  translateY: number,
  scale: number,
) => {
  // const topLeft = getWindowCoordsOnCanvas(canvas2D, 0, 0);
  // // const topRight = getWindowCoordsOnCanvas(canvas2D, window.innerWidth, 0);
  // // const bottomLeft = getWindowCoordsOnCanvas(canvas2D, 0, window.innerHeight);
  // const bottomRight = getWindowCoordsOnCanvas(canvas2D, canvas.width, canvas.height);

  // console.log('top left', topLeft);
  // console.log('bottom right', bottomRight);

  // console.log(canvas.width, translateX, (canvas.width - translateX) / scale);
  // console.log(0 - translateX, (0 - translateX) / scale);

  const bounds = {
    x1: 0 - translateX,
    y1: 0 - translateY,
    x2: canvas.width / scale - translateX,
    y2: canvas.height / scale - translateY,
  };

  return {
    x: bounds.x1,
    y: bounds.y1,
    width: bounds.x2 - bounds.x1,
    height: bounds.y2 - bounds.y1,
  };

  // return {
  //   x1: topLeft.x,
  //   y1: topLeft.y,
  //   x2: bottomRight.x,
  //   y2: bottomRight.y,
  // };
  // console.log(canvasPoint);
};
