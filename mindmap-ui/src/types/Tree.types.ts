export interface CypressTestMeta {
  fileUrl: string;
}

export interface TestStructure {
  describe: string;
  nested: TestStructure[];
  tests: string[];
  meta?: CypressTestMeta;
}

export interface TreeNodePartial {
  text: string;
  nodes: TreeNodePartial[];
  meta?: CypressTestMeta;
  blockNode?: boolean;
}

export interface CypressTreeNode {
  id: string;
  text: string;
  nodes: CypressTreeNode[];
  meta?: CypressTestMeta;
  blockNode?: boolean;
}
