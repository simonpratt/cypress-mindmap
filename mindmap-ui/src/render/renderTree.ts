import { ANCHOR_X_OFFSET, HORIZONTAL_SPACE_BETWEEN_BLOCKS } from '../constants/render.constants';
import { TreeNodeLayout } from '../helpers/getTreeLayout';
import { renderNodeCounter } from './renderNodeCounter';
import { renderTextBlock } from './renderTextBlock';

export const renderTree = (canvas2D: CanvasRenderingContext2D, node: TreeNodeLayout, fontSize: number) => {
  // Render the main node
  renderTextBlock(canvas2D, node.lines, node.x, node.y, fontSize);

  // If this node is collapsed, we want to render a counter and no children
  if (node.collapsed) {
    renderNodeCounter(canvas2D, node);
    return;
  }

  // Render child nodes
  node.nodes.map((_node) => renderTree(canvas2D, _node, fontSize));

  // Define the anchor point for lines
  const currentAnchor = {
    x: node.x + node.width + ANCHOR_X_OFFSET,
    y: node.y + node.height / 2 + 4,
  };

  // Define the line style
  canvas2D.lineWidth = 4;
  canvas2D.strokeStyle = '#e2e2e2';
  canvas2D.setLineDash([]);

  // Render the line between current node and all child nodes
  node.nodes.forEach((_node) => {
    const nodeAnchor = {
      x: _node.x - ANCHOR_X_OFFSET,
      y: _node.y + _node.height / 2 + 4,
    };

    canvas2D.beginPath();
    canvas2D.moveTo(currentAnchor.x, currentAnchor.y);
    canvas2D.bezierCurveTo(
      currentAnchor.x + HORIZONTAL_SPACE_BETWEEN_BLOCKS / 2,
      currentAnchor.y,
      nodeAnchor.x - HORIZONTAL_SPACE_BETWEEN_BLOCKS / 2,
      nodeAnchor.y,
      nodeAnchor.x,
      nodeAnchor.y,
    );
    canvas2D.stroke();
  });
};
