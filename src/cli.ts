import { parseModule } from 'esprima';
import { Statement } from 'estree';
import fs from 'fs';
import glob from 'glob';
import ts from 'typescript';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Run against a cypress test directory to generate a mindmap of that directory')
  .options({
    spec: {
      alias: 's',
      description: 'subset of tests that are elegible for running',
      requiresArg: false,
      required: true,
      type: 'string',
    },
    out: {
      alias: 'o',
      description: 'output file to save json structure into',
      requiresArg: true,
      required: true,
      type: 'string',
    },
  })
  .default('spec', '**/*.cy.ts').argv;

interface TestStructure {
  describe: string;
  nested: TestStructure[];
  tests: string[];
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
    describe: getFirstArgumentValue(node),
    nested: getExpressionBodyNodes(node).filter(isDescribeNode).map(unwindDescribeBlock),
    tests: getExpressionBodyNodes(node).filter(isItNode).map(getFirstArgumentValue),
  };
};

const extractStructureFromProgram = (nodes: Statement[]): TestStructure[] => {
  const structure = nodes.filter(isDescribeNode).map(unwindDescribeBlock);
  return structure;
};

const parseFileToStructure = (filePath: string): TestStructure[] => {
  const fileContents = fs.readFileSync(filePath).toLocaleString();
  const transpiledContents = ts.transpile(fileContents);
  const program = parseModule(transpiledContents);

  const structure = extractStructureFromProgram(program.body as Statement[]);
  return structure;
};

const combineTestStructures = (structures: TestStructure[]): TestStructure[] => {
  const combined: TestStructure[] = [];

  structures.forEach((structure) => {
    const matching = combined.find((c) => c.describe === structure.describe);

    if (matching) {
      matching.nested = [...matching.nested, ...combineTestStructures(structure.nested)];
      matching.tests = [...matching.tests, ...structure.tests];
    } else {
      combined.push({
        describe: structure.describe,
        nested: structure.nested,
        tests: structure.tests,
      });
    }
  });

  return combined;
};

const countTestCases = (structure: TestStructure[]): number => {
  return structure
    .map((structure) => structure.tests.length + countTestCases(structure.nested))
    .reduce((prev, curr) => prev + curr, 0);
};

const findMatchingFiles = (pattern: string): string[] => {
  const files = glob.sync(pattern);
  return files;
};

const parseMatchingFiles = (pattern: string): TestStructure[] => {
  const files = findMatchingFiles(pattern);

  if (!files.length) {
    throw new Error(`No files were found matching pattern '${pattern}'`);
  }

  console.log(`${files.length} files found`);
  files.forEach((file) => console.log(file));
  console.log('\r\n');

  const individualTestStructures = files.map(parseFileToStructure);
  const flattened = individualTestStructures.reduce((prev, curr) => [...prev, ...curr], []);
  const combined = combineTestStructures(flattened);

  console.log(`${countTestCases(combined)} tests found`);

  return combined;
};

const run = async () => {
  const spec = (await argv).spec;
  const out = (await argv).out;

  if (!spec) {
    throw new Error('spec must be provided');
  }

  if (!out) {
    throw new Error('out must be provided');
  }

  const structure = parseMatchingFiles(spec);
  fs.writeFileSync(out, JSON.stringify(structure));
};

export default run;
