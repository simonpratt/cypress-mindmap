import { useAsync } from 'react-async-hook';
import axios from 'axios';
import { TreeNode } from '../helpers/getTreeLayout';
import Mindmap from './Mindmap';

interface TestStructure {
  describe: string;
  nested: TestStructure[];
  tests: string[];
}

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
    return <div>{JSON.stringify(error)}</div>;
  }

  const nodes = {
    text: 'root',
    nodes: result?.data.map((_data: TestStructure) => parseTestStructureToNodeTree(_data)),
  };

  return <Mindmap json={nodes} />;
};

export default MindmapLoader;
