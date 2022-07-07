import { parseModule } from 'esprima';
import { Statement } from 'estree';
import ts from 'typescript';
import fs from 'fs';
import glob from 'glob';

interface TestStructure {
  key: string;
  nestedDescribes: TestStructure[];
  testCases: string[];
}

const isDescribeNode = (node: Statement): boolean => {
  return (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.callee.type === 'Identifier' &&
    node.expression.callee.name === 'describe'
  );
};

const isItNode = (node: Statement): boolean => {
  return (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.callee.type === 'Identifier' &&
    node.expression.callee.name === 'it'
  );
};

const getFirstArgumentValue = (node: any): string => {
  if (node.expression?.arguments[0]?.type !== 'Literal') {
    throw new Error('Expected a literal');
  }

  return node.expression.arguments[0].value;
};

const getExpressionBodyNodes = (node: Statement): Statement[] => {
  if (node.type !== 'ExpressionStatement' || node.expression.type !== 'CallExpression') {
    throw new Error('Expected call expression');
  }

  const arguemnts = node.expression.arguments;
  const functionExpression = arguemnts.find(
    (arg) => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression',
  );

  if (!functionExpression) {
    throw new Error('FunctionExpression not found');
  }

  return (functionExpression as any).body.body;
};

const unwindDescribeBlock = (node: Statement): TestStructure => {
  return {
    key: getFirstArgumentValue(node),
    nestedDescribes: getExpressionBodyNodes(node).filter(isDescribeNode).map(unwindDescribeBlock),
    testCases: getExpressionBodyNodes(node).filter(isItNode).map(getFirstArgumentValue),
  };
};

// const extractTestCases = (nodes: Statement[]): string[] => {
//   const testCases = nodes.filter(isItNode);
//   return testCases.map(getFirstArgumentValue);
// }

const extractStructureFromProgram = (nodes: Statement[]): TestStructure[] => {
  const structure = nodes.filter(isDescribeNode).map(unwindDescribeBlock);
  return structure;
};

const parseFileToStructure = (filePath: string): TestStructure[] => {
  console.log('parsing', filePath);
  const fileContents = fs.readFileSync(filePath).toLocaleString();
  const transpiledContents = ts.transpile(fileContents);
  const program = parseModule(transpiledContents);
  // const fileContents = fs.readFileSync(filePath, 'utf8');

  // console.log('Contents', fileContents);

  // function isDescribe(node: any) {
  //   return node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'describe';
  // }

  // const node = ts.createSourceFile(
  //   'x.ts',   // fileName
  //   fileContents,
  //   ts.ScriptTarget.Latest // langugeVersion
  // );
  const structure = extractStructureFromProgram(program.body as Statement[]);
  return structure;

  // return [];

  // console.log('PARSED');
  // console.log(structure);

  // console.log(JSON.stringify(testFile));
};

const combineTestStructures = (structures: TestStructure[]): TestStructure[] => {
  const combined: TestStructure[] = [];

  structures.forEach((structure) => {
    const matching = combined.find((c) => c.key === structure.key);

    if (matching) {
      matching.nestedDescribes = [...matching.nestedDescribes, ...combineTestStructures(structure.nestedDescribes)];
      matching.testCases = [...matching.testCases, ...structure.testCases];
    } else {
      combined.push({
        key: structure.key,
        nestedDescribes: structure.nestedDescribes,
        testCases: structure.testCases,
      });
    }
  });

  return combined;
};

const findMatchingFiles = (pattern: string): string[] => {
  const files = glob.sync(pattern);
  return files;
};

const parseMatchingFiles = (pattern: string) => {
  const files = findMatchingFiles(pattern);
  const individualTestStructures = files.map(parseFileToStructure);
  const flattened = individualTestStructures.reduce((prev, curr) => [...prev, ...curr], []);
  const combined = combineTestStructures(flattened);

  console.log(JSON.stringify(combined));

  // const combinedtestStructure = console.log(individualTestStructures);
};

parseMatchingFiles('./mock/**/*.test.ts');
// parseMatchingFiles('/Users/simon/dev/repo/easy-choice/easy-choice-cypress/cypress/e2e/**/*.cy.ts');

// expression":{
//   "type":"CallExpression"
