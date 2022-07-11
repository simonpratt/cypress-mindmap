import { HORIZONTAL_SPACE_BETWEEN_BLOCKS, VERTICAL_SPACE_BETWEEN_BLOCKS } from '../constants/render.constants';
import { getTextBlock } from './getTextBlock';
import { measureTextBlock } from './measureTextBlock';

export interface TreeNodeLayout {
  lines: string[];
  nodes: TreeNodeLayout[];
  x: number;
  y: number;
  width: number;
  height: number;
  treeHeight: number;
  treeWidth: number;
}

export interface TreeNodeHeight {
  lines: string[];
  nodes: TreeNodeHeight[];
  width: number;
  height: number;
  treeHeight: number;
  treeWidth: number;
}

export interface TreeNode {
  text: string;
  nodes?: TreeNode[];
}

interface TreeNodeExtended {
  lines: string[];
  nodes: TreeNodeExtended[];
  width: number;
  height: number;
}

const sum = (numbers: number[]): number => {
  return numbers.reduce((sum, curr) => sum + curr, 0);
};

const expandTreeToTextBlocks = (
  canvas2D: CanvasRenderingContext2D,
  node: TreeNode,
  maxWidth: number,
  fontSize: number,
): TreeNodeExtended => {
  const textBlock = getTextBlock(canvas2D, node.text, maxWidth);
  return {
    lines: textBlock,
    ...measureTextBlock(canvas2D, textBlock, fontSize),
    nodes: node.nodes ? node.nodes.map((node) => expandTreeToTextBlocks(canvas2D, node, maxWidth, fontSize)) : [],
  };
};

const getNodeSizes = (canvas2D: CanvasRenderingContext2D, node: TreeNodeExtended): TreeNodeHeight => {
  // If there are no children, then the tree height is the same as our own height
  if (!node.nodes.length) {
    return {
      ...node,
      nodes: [],
      treeHeight: node.height,
      treeWidth: node.width,
    };
  }

  // Process child nodes first so that we know what the current nodes height will be
  const nodesWithHeight = node.nodes.map((_node) => getNodeSizes(canvas2D, _node));

  // Use the height of the child nodes to calculate what the current node height will be
  const treeHeight =
    sum(nodesWithHeight.map((_node) => _node.treeHeight)) +
    (nodesWithHeight.length - 1) * VERTICAL_SPACE_BETWEEN_BLOCKS;

  // Grap the width of the child nodes, this node, and the gap between
  const treeWidth =
    Math.max(...nodesWithHeight.map((_node) => _node.treeWidth)) + node.width + HORIZONTAL_SPACE_BETWEEN_BLOCKS;

  // Return the updated node with heights
  return {
    ...node,
    nodes: nodesWithHeight,
    treeHeight,
    treeWidth,
  };
};

const setNodePosition = (
  canvas2D: CanvasRenderingContext2D,
  node: TreeNodeHeight,
  x: number,
  y: number,
): TreeNodeLayout => {
  // Start the child y above the current y to spread nodes out evenly
  // Add half our hight back on to return to the midpoint
  let nextNodeY = y - node.treeHeight / 2 + node.height / 2;

  // Loop through each child node and set their position
  return {
    ...node,
    nodes: node.nodes.map((_node) => {
      // Child should be centered within the height that it's tree occupies
      const childTopY = nextNodeY;
      const childBottomY = nextNodeY + _node.treeHeight;
      const childY = (childTopY + childBottomY) / 2 - _node.height / 2;

      const childX = x + node.width + HORIZONTAL_SPACE_BETWEEN_BLOCKS;

      nextNodeY = nextNodeY + _node.treeHeight + VERTICAL_SPACE_BETWEEN_BLOCKS;
      return setNodePosition(canvas2D, _node, childX, childY);
    }),
    x,
    y,
  };
};

const getNodeLayout = (canvas2D: CanvasRenderingContext2D, node: TreeNodeHeight): TreeNodeLayout => {
  // Calculate position of the root node
  const y = node.treeHeight / 2 - node.height / 2;
  const x = 0;

  // Set the Root node position and then the rest are set recursively
  return setNodePosition(canvas2D, node, x, y);
};

/**
  @description
  Take a basic text/node tree, perform word wrapping
  Calculate the layout of the tree with the x/y of each child node being relative to it's parents node x/y
**/
export const getTreeLayout = (
  canvas2D: CanvasRenderingContext2D,
  node: TreeNode,
  maxWidth: number,
  fontSize: number,
): TreeNodeLayout => {
  // Iterate over all nodes in the tree, split into lines, and calculate the width + height of each text block
  const expanded = expandTreeToTextBlocks(canvas2D, node, maxWidth, fontSize);

  // First calculate all the tree heights of nodes
  const withHeight = getNodeSizes(canvas2D, expanded);

  // Recursively calculate the x/y position of each node
  const withLayout = getNodeLayout(canvas2D, withHeight);

  return withLayout;
};
