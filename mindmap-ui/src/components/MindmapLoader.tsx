import { useAsync } from 'react-async-hook';
import axios from 'axios';
import { TreeNode } from '../helpers/getTreeLayout';
import Mindmap from './Mindmap';

interface TestStructure {
  describe: string;
  nested: TestStructure[];
  tests: string[];
}

const sample_nodes = {
  text: 'Mindmap',
  nodes: [
    {
      text: 'Canvas',
      nodes: [
        {
          text: 'Lots of node trees. There really are lots of trees that need lots and lots of maths. More than you would expect. It even needs to wrap lots and lots of lines of text without looking funny',
        },
        {
          text: 'How to zoom in and out?',
        },
      ],
    },
    {
      text: 'Examples',
      nodes: [
        {
          text: 'A simple example to start with...',
        },
        {
          text: 'A simple example to start with...',
        },
      ],
    },
  ],
};

const parseTestStructureToNodeTree = (tree: TestStructure): TreeNode => {
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

const MindmapLoader = () => {
  const { result, loading, error } = useAsync(() => axios.get('http://localhost:5112/json/cypress_mindmap.json'), []);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    // Use some sample data for now
    return <Mindmap json={sample_nodes} />;
  }

  const nodes = {
    text: 'root',
    nodes: result?.data.map((_data: TestStructure) => parseTestStructureToNodeTree(_data)),
  };

  return <Mindmap json={nodes} />;
};

export default MindmapLoader;
