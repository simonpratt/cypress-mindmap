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

// const getNodeWithAbsoultePosition = (
//   canvas2D: CanvasRenderingContext2D,
//   node: TreeNodeExtended,
//   x: number,
//   y: number,
// ): TreeNodeLayout => {};

const mutateNodeWithYOffset = (node: TreeNodeLayout, yOffset: number): void => {
  // Mutate child nodes
  node.nodes.forEach((_node) => mutateNodeWithYOffset(_node, yOffset));

  // Mutate this node
  node.y += yOffset;
};

const mutateNodeWithXOffset = (node: TreeNodeLayout, xOffset: number): void => {
  // Mutate child nodes
  node.nodes.forEach((_node) => mutateNodeWithXOffset(_node, xOffset));

  // Mutate this node
  node.x += xOffset;
};

const getNodeLayout = (canvas2D: CanvasRenderingContext2D, node: TreeNodeExtended): TreeNodeLayout => {
  // If there are no children, we're a leaf node
  // Just go 0,0, and persist our width/height
  if (!node.nodes.length) {
    return {
      ...node,
      nodes: [],
      x: 0,
      y: 0,
      treeHeight: node.height,
    };
  }

  // Process the child nodes first so that we start at the leaves and work backwards
  const nodesWithLayout = node.nodes.map((_node) => getNodeLayout(canvas2D, _node));

  // Height of all child nodes is now set
  // We should be able to layout child nodes
  // This will override what leaves have defined as their own coordinates
  const totalHeight =
    sum(nodesWithLayout.map((_node) => _node.treeHeight)) +
    (nodesWithLayout.length - 1) * VERTICAL_SPACE_BETWEEN_BLOCKS;

  // Loop over all nodes and set y coordinate
  // This is a mutation and shifts the entire portion of the tree
  let yCurr = 0 - totalHeight / 2;
  nodesWithLayout.forEach((_node) => {
    const offset = yCurr - _node.y + _node.treeHeight / 2;
    mutateNodeWithYOffset(_node, offset);
    yCurr = yCurr + _node.treeHeight + VERTICAL_SPACE_BETWEEN_BLOCKS;
  });

  // Loop over all nodes and set the x coordinate
  // This is a mutation and shifts the entire portion of the tree
  nodesWithLayout.forEach((_node) => {
    mutateNodeWithXOffset(_node, node.width + HORIZONTAL_SPACE_BETWEEN_BLOCKS);
  });

  // Calculate full width and height for current node
  // const width = node.width + HORIZONTAL_SPACE_BETWEEN_BLOCKS + Math.max(...nodesWithLayout.map((_node) => _node.width));
  // const height = Math.max(node.height, totalHeight);
  // console.log('calcuating y', node.lines[0], totalHeight, node.height, totalHeight / 2 - node.height / 2);

  // Redefine the current node
  const updatedNode = {
    lines: node.lines,
    nodes: nodesWithLayout,
    width: node.width,
    height: node.height,
    x: 0,
    y: 0,
    treeHeight: Math.max(node.height, totalHeight),
  };

  // Re-walk the node tree and calculate all of the absolute positions
  // return getNodeWithAbsoultePosition(canvas2D, updatedNode, 0, 0);
  return updatedNode;
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

  // Start from the leaves of the tree and layout each node relative to its parent
  const withLayout = getNodeLayout(canvas2D, expanded);

  // TEMP OFFSET
  mutateNodeWithYOffset(withLayout, 200);

  return withLayout;
};
