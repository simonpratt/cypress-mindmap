import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import { getTreeLayout, TreeNode } from '../helpers/getTreeLayout';
import { renderTree } from '../render/renderTree';

const FilledDiv = styled.div`
  height: 100vh;
  width: 100vw;
`;

const FillCanvas = styled.canvas`
  height: 100vh;
  width: 100vw;

  cursor: grab;
`;

interface MindmapProps {
  json: TreeNode;
}

interface MouseCoords {
  x: number;
  y: number;
}

interface ZoomLevel {
  val: number;
}

const coordsReducer = (state: MouseCoords, action: MouseCoords) => {
  return {
    x: state.x + action.x,
    y: state.y + action.y,
  };
};

const zoomReducer = (state: ZoomLevel, action: ZoomLevel) => {
  return {
    val: Math.max(0.1, state.val + action.val * 0.001),
  };
};

const Mindmap = ({ json }: MindmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseLastSeen = useRef<MouseCoords>();
  const controlPressed = useRef<boolean>();

  const [coords, dispatchPan] = useReducer(coordsReducer, { x: 0, y: 0 });
  const [zoom, dispatchZoom] = useReducer(zoomReducer, { val: 1 });

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    const lastSeen = mouseLastSeen.current || { x: 0, y: 0 };

    const xDiff = e.x - lastSeen.x;
    const yDiff = e.y - lastSeen.y;

    mouseLastSeen.current = {
      x: e.x,
      y: e.y,
    };

    dispatchPan({ x: xDiff, y: yDiff });
  }, []);

  const wheelHandler = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (controlPressed.current) {
      dispatchZoom({ val: e.deltaY });
      return;
    }

    dispatchPan({ x: e.deltaX * -0.7, y: e.deltaY * -0.7 });
  }, []);

  // Setup mouse event listeners
  useEffect(() => {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        controlPressed.current = true;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        controlPressed.current = false;
      }
    });

    window.addEventListener('mousedown', (e: MouseEvent) => {
      mouseLastSeen.current = {
        x: e.x,
        y: e.y,
      };

      window.addEventListener('mousemove', mouseMoveHandler);
    });

    window.addEventListener('mouseout', () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
    });

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
    });

    // window.addEventListener('touchstart', (e) => {
    //   e.preventDefault();
    // });

    window.addEventListener('wheel', wheelHandler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    // Resize
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    // Get context
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // Set font
    context.font = '32px Roboto, sans-serif';
    context.textBaseline = 'top';
    context.fillStyle = '#e2e2e2';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const treeLayout = getTreeLayout(context, json, 800, 32);

    context.clearRect(0, 0, treeLayout.treeWidth + 10, treeLayout.treeHeight + 10);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(zoom.val, zoom.val);
    context.translate(coords.x * 2, coords.y * 2);

    renderTree(context, treeLayout, 32);
  }, [coords, zoom]);

  return (
    <FilledDiv>
      <FillCanvas ref={canvasRef} />
    </FilledDiv>
  );
};

export default Mindmap;
