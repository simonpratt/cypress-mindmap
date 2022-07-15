import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import { CANVAS_SCALE_FACTOR, MOUSE_MOVE_CLICK_THRESHOLD } from '../constants/render.constants';
import { getTreeLayout, TreeNode } from '../helpers/getTreeLayout';
import { getVisibleCanvasBounds } from '../helpers/getVisibleBounds';
import { getWindowPointOnCanvas } from '../helpers/getWindowPointOnCanvas';
import { renderGrid } from '../render/renderGrid';
import { renderTree } from '../render/renderTree';
import Input from './Input';

const FilledDiv = styled.div`
  height: 100vh;
  width: 100vw;
`;

const FillCanvas = styled.canvas`
  height: 100vh;
  width: 100vw;

  /* cursor: grab; */
`;

const InputContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
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
  const mouseFirstSeen = useRef<MouseCoords>();
  const controlPressed = useRef<boolean>();
  const mouseDown = useRef<boolean>();

  const [coords, dispatchPan] = useReducer(coordsReducer, { x: 0, y: 0 });
  const [zoom, dispatchZoom] = useReducer(zoomReducer, { val: 1 });

  /**
   * Hook that is responsible for binding to the canvas element, setting initial size, and persisting to state
   */
  const canvasRef = useCallback(
    (_canvas: HTMLCanvasElement) => {
      if (_canvas !== null) {
        // Set the height of the canvas
        _canvas.width = window.innerWidth * CANVAS_SCALE_FACTOR;
        _canvas.height = window.innerHeight * CANVAS_SCALE_FACTOR;

        // Set to state
        setCanvas(_canvas);
      }
    },
    [setCanvas],
  );

  const mouseUpHandler = useCallback(
    (e: MouseEvent) => {
      if (!mouseFirstSeen.current || !context2D) {
        return;
      }

      // Check the delta in coors between the down and up to see if we've moved or should handle it as a click
      const deltaX = Math.abs(e.x - mouseFirstSeen.current.x);
      const deltaY = Math.abs(e.y - mouseFirstSeen.current.y);
      if (deltaX > MOUSE_MOVE_CLICK_THRESHOLD || deltaY > MOUSE_MOVE_CLICK_THRESHOLD) {
        return;
      }

      const point = getWindowPointOnCanvas(context2D, e.x, e.y);
      context2D.fillRect(point.x, point.y, 10, 10);
    },
    [context2D],
  );

  useEffect(() => {
    window.addEventListener('mouseup', mouseUpHandler);

    return () => {
      window.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [mouseUpHandler]);

  const mouseMoveHandler = useCallback(
    (e: MouseEvent) => {
      if (!mouseDown.current) {
        return;
      }

      const lastSeen = mouseLastSeen.current || { x: 0, y: 0 };

      const xDiff = ((e.x - lastSeen.x) * CANVAS_SCALE_FACTOR) / zoom.val;
      const yDiff = ((e.y - lastSeen.y) * CANVAS_SCALE_FACTOR) / zoom.val;

      mouseLastSeen.current = {
        x: e.x,
        y: e.y,
      };

      dispatchPan({ x: xDiff, y: yDiff });
    },
    [dispatchPan, zoom],
  );

  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [mouseMoveHandler]);

  useEffect(() => {
    window.addEventListener('mousedown', (e: MouseEvent) => {
      mouseFirstSeen.current = {
        x: e.x,
        y: e.y,
      };

      mouseLastSeen.current = {
        x: e.x,
        y: e.y,
      };

      mouseDown.current = true;
    });

    window.addEventListener('mouseout', () => {
      mouseDown.current = false;
    });

    window.addEventListener('mouseup', () => {
      mouseDown.current = false;
    });
  }, []);

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

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (controlPressed.current) {
        dispatchZoom({ val: e.deltaY });
        return;
      }

      const diffX = (e.deltaX * -1.5) / zoom.val;
      const diffY = (e.deltaY * -1.5) / zoom.val;

      dispatchPan({ x: diffX, y: diffY });
    },
    [zoom, dispatchPan, dispatchZoom],
  );

  useEffect(() => {
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

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
    context2D.translate(coords.x, coords.y);

    // Get the visible area and clear
    const visibleBounds = getVisibleCanvasBounds(context2D);
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
      {/* <InputContainer>
        <Input value='test' onChange={() => {}} />
      </InputContainer> */}
    </FilledDiv>
  );
};

export default Mindmap;
