import { Mindmap } from '../external/Mindmap';
import { CypressTreeNode } from '../types/Tree.types';

export interface CypressMindmapProps {
  tree: CypressTreeNode;
}

const CypressMindmap = ({ tree }: CypressMindmapProps) => {
  const handleNodeClick = (node: CypressTreeNode, modifiers: { metaKey: boolean }) => {
    if (!modifiers.metaKey) {
      return 'collapse' as any;
    }

    if (node.meta?.fileUrl) {
      console.log('going to', node.meta.fileUrl);
      window.location.href = node.meta?.fileUrl;
    }
  };

  return <Mindmap json={tree} onNodeClick={handleNodeClick} />;
};

export default CypressMindmap;
