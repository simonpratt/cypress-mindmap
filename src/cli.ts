import { parseModule } from "esprima";
import { Directive, Expression, ExpressionStatement, ModuleDeclaration, Program, Statement } from "estree";
import fs from "fs";

interface TestStructure {
  key: string;
  nestedDescribes: TestStructure[];
  testCases: string[];
}

const isDescribeNode = (node: Statement): boolean => {
  return node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.type === 'Identifier' && node.expression.callee.name === 'describe';
}

const isItNode = (node: Statement): boolean => {
  return node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.type === 'Identifier' && node.expression.callee.name === 'it';
}

const getFirstArgumentValue = (node: any): string => {
  if (node.expression?.arguments[0]?.type !== 'Literal') {
    throw new Error ('Expected a literal')
  }

  return node.expression.arguments[0].value;
}

const getExpressionBodyNodes = (node: Statement): Statement[] => {
  if (node.type !== 'ExpressionStatement' || node.expression.type !== 'CallExpression') {
    throw new Error('Expected call expression');
  }

  const arguemnts = node.expression.arguments;
  const functionExpression = arguemnts.find(arg => arg.type === 'ArrowFunctionExpression');

  if (!functionExpression) {
    throw new Error('FunctionExpression not found');
  }

  return (functionExpression as any).body.body;
}

const unwindDescribeBlock = (node: Statement): TestStructure => {
  return {
    key: getFirstArgumentValue(node),
    nestedDescribes: getExpressionBodyNodes(node).filter(isDescribeNode).map(unwindDescribeBlock),
    testCases: getExpressionBodyNodes(node).filter(isItNode).map(getFirstArgumentValue),
  }
}

// const extractTestCases = (nodes: Statement[]): string[] => {
//   const testCases = nodes.filter(isItNode);
//   return testCases.map(getFirstArgumentValue);
// }

const extractStructureFromProgram = (nodes: Statement[]): TestStructure[] => {
  const structure = nodes.filter(isDescribeNode).map(unwindDescribeBlock)
  return structure;
}

const parseTestIntoJson = (filePath: string) => {
  const fileContents = fs
    .readFileSync(
      "/Users/simon/dev/repo/easy-choice/easy-choice-cypress/cypress/e2e/meals/add.cy.ts"
    )
    .toLocaleString();

  console.log("Contents", fileContents);

  function isDescribe(node: any) {
    return (node.type === 'CallExpression') && node.callee.type === 'Identifier' && node.callee.name === 'describe';
}

  const program = parseModule(fileContents);
  const structure = extractStructureFromProgram(program.body as Statement[]);

  console.log("PARSED");
  console.log(structure)

  // console.log(JSON.stringify(testFile));
};

parseTestIntoJson("xxx");


// expression":{
//   "type":"CallExpression"