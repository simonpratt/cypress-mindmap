import { useAsync } from 'react-async-hook';
import axios from 'axios';
import { v4 } from 'uuid';
import { TreeNode } from '../helpers/getTreeLayout';
import Mindmap from './Mindmap';

interface TestStructure {
  describe: string;
  nested: TestStructure[];
  tests: string[];
}

interface TreeNodePartial {
  text: string;
  nodes: TreeNodePartial[];
}

const sample_nodes: TreeNodePartial = {
  text: 'Mindmap',
  nodes: [
    {
      text: 'Canvas',
      nodes: [
        {
          text: 'Lots of node trees. There really are lots of trees that need lots and lots of maths. More than you would expect. It even needs to wrap lots and lots of lines of text without looking funny',
          nodes: [],
        },
        {
          text: 'How to zoom in and out?',
          nodes: [],
        },
      ],
    },
    {
      text: 'Examples',
      nodes: [
        {
          text: 'A simple example to start with...',
          nodes: [],
        },
        {
          text: 'A simple example to start with...',
          nodes: [],
        },
      ],
    },
  ],
};

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

const getTreeWithIds = (node: TreeNodePartial): TreeNode => {
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
    return <Mindmap json={getTreeWithIds(sample_nodes)} />;
  }

  const nodes = {
    text: 'root',
    nodes: result?.data.map((_data: TestStructure) => parseTestStructureToNodeTree(_data)),
  };

  return <Mindmap json={getTreeWithIds(nodes)} />;
};

export default MindmapLoader;
