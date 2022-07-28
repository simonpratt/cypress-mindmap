import { useAsync } from 'react-async-hook';
import axios from 'axios';
import { v4 } from 'uuid';
import { CypressTreeNode, TestStructure, TreeNodePartial } from '../types/Tree.types';
import CypressMindmap from './CypressMindmap';

const sample_nodes: TreeNodePartial = {
  text: 'Mindmap',
  blockNode: true,
  nodes: [
    {
      text: 'Canvas',
      nodes: [
        {
          text: 'Lots of node trees. There really are lots of trees that need lots and lots of maths. More than you would expect. It even needs to wrap lots and lots of lines of text without looking funny',
          nodes: [],
          meta: {
            fileUrl: 'vscode://file/users/simon/dev/repo/cypress-mindmap/mindmap-ui/src/components/MindmapLoader.tsx',
          },
        },
        {
          text: 'How to zoom in and out?',
          nodes: [],
          meta: {
            fileUrl: 'vscode://file/users/simon/dev/repo/cypress-mindmap/mindmap-ui/src/components/MindmapLoader.tsx',
          },
        },
      ],
    },
    {
      text: 'Examples',
      nodes: [
        {
          text: 'A simple example to start with...',
          nodes: [],
          meta: {
            fileUrl: 'vscode://file/users/simon/dev/repo/cypress-mindmap/mindmap-ui/src/components/MindmapLoader.tsx',
          },
        },
        {
          text: 'A simple example to start with...',
          nodes: [],
          meta: {
            fileUrl: 'vscode://file/users/simon/dev/repo/cypress-mindmap/mindmap-ui/src/components/MindmapLoader.tsx',
          },
        },
      ],
    },
  ],
};

// const sample_nodes: TreeNodePartial = {
//   text: 'Mindmap',
//   nodes: [
//     {
//       text: 'Canvas',
//       nodes: [
//         {
//           text: 'Lots of node trees. There really are lots of trees that need lots and lots of maths. More than you would expect. It even needs to wrap lots and lots of lines of text without looking funny',
//           nodes: [],
//         },
//       ],
//     },
//   ],
// };

const parseTestStructureToNodeTree = (tree: TestStructure): TreeNodePartial => {
  const testNodes = tree.tests.map((test) => ({
    text: test,
    nodes: [],
  }));
  const nestedNodes = tree.nested.map((nested) => parseTestStructureToNodeTree(nested));

  return {
    text: tree.describe,
    nodes: [...testNodes, ...nestedNodes],
  };
};

const getTreeWithIds = (node: TreeNodePartial): CypressTreeNode => {
  return {
    id: v4(),
    ...node,
    nodes: node.nodes?.map(getTreeWithIds),
  };
};

const MindmapLoader = () => {
  const { result, loading, error } = useAsync(() => axios.get('http://localhost:5112/json/cypress_mindmap.json'), []);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    // Use some sample data for now
    return <CypressMindmap tree={getTreeWithIds(sample_nodes)} />;
  }

  const nodes = {
    text: 'root',
    blockNode: true,
    nodes: result?.data.map((_data: TestStructure) => parseTestStructureToNodeTree(_data)),
  };

  return <CypressMindmap tree={getTreeWithIds(nodes)} />;
};

export default MindmapLoader;
