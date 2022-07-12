import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import { getTreeLayout, TreeNode } from '../helpers/getTreeLayout';
import { getVisibleCanvasBounds } from '../helpers/getVisibleBounds';
import { renderGrid } from '../render/renderGrid';
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
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context2D, setContext2D] = useState<CanvasRenderingContext2D>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const mouseLastSeen = useRef<MouseCoords>();
  const controlPressed = useRef<boolean>();

  const [coords, dispatchPan] = useReducer(coordsReducer, { x: 0, y: 0 });
  const [zoom, dispatchZoom] = useReducer(zoomReducer, { val: 1 });

  /**
   * Hook that is responsible for binding to the canvas element, setting initial size, and persisting to state
   */
  const canvasRef = useCallback(
    (_canvas: HTMLCanvasElement) => {
      if (_canvas !== null) {
        // Set the height of the canvas
        _canvas.width = window.innerWidth * 2;
        _canvas.height = window.innerHeight * 2;

        // Set to state
        setCanvas(_canvas);
      }
    },
    [setCanvas],
  );

  /**
   * Hook that is responsible for getting and configuring the 2d drawing instance
   */
  useEffect(() => {
    // Get the context
    const _context2D = canvas?.getContext('2d');

    if (!_context2D) {
      return;
    }

    // Configure the context
    _context2D.font = '32px Roboto, sans-serif';
    _context2D.textBaseline = 'top';
    _context2D.fillStyle = '#e2e2e2';

    // Set to state
    setContext2D(_context2D);
  }, [canvas, setContext2D]);

  /**
   * Re-evaluate the tree layout whenever the tree or 2d canvas changes
   */
  const treeLayout = useMemo(() => {
    if (!context2D) {
      return;
    }

    return getTreeLayout(context2D, json, 800, 32);
  }, [json, context2D]);

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

  // Hook to setup some event listeners when the page loads
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

    window.addEventListener('wheel', wheelHandler);
  }, []);

  /**
   * Hook to run each time the zoom or pan changes and re-render the tree
   */
  useEffect(() => {
    if (!canvas || !context2D || !treeLayout) {
      return;
    }

    // Set transforms
    context2D.setTransform(1, 0, 0, 1, 0, 0);
    context2D.scale(zoom.val, zoom.val);
    context2D.translate(coords.x * 2, coords.y * 2);

    // Get the visible area and clear
    const visibleBounds = getVisibleCanvasBounds(canvas, context2D, coords.x * 2, coords.y * 2, zoom.val);
    context2D.clearRect(visibleBounds.x, visibleBounds.y, visibleBounds.width, visibleBounds.height);

    // Draw a grid for the visible area
    renderGrid(context2D, visibleBounds.x, visibleBounds.y, visibleBounds.width, visibleBounds.height);

    // Draw the tree
    context2D.fillStyle = '#e2e2e2';
    renderTree(context2D, treeLayout, 32);
  }, [context2D, coords, zoom, treeLayout]);

  return (
    <FilledDiv>
      <FillCanvas ref={canvasRef} />
    </FilledDiv>
  );
};

export default Mindmap;
