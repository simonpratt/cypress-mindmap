import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getTextBlock } from '../helpers/getTextBlock';
import { getTreeLayout } from '../helpers/getTreeLayout';
import { renderTextBlock } from '../render/renderTextBlock';
import { renderTree } from '../render/renderTree';

interface Structure {
  describe: string;
  nested: Structure[];
  tests: string[];
}

// const structure: Structure = [
//   {
//     describe: 'auth',
//     nested: [
//       {
//         describe: 'login',
//         nested: [],
//         tests: [
//           'must be able to login using the correct username and password',
//           'must not be able to login with an incorrect password',
//         ],
//       },
//       { describe: 'cli', nested: [], tests: ['must be able to login via the cli'] },
//       {
//         describe: 'register',
//         nested: [],
//         tests: [
//           'must be able to register using a valid email and password',
//           'must not be able to register with an invalid email',
//         ],
//       },
//     ],
//     tests: [],
//   },
//   { describe: 'users', nested: [], tests: ['must be able to view the user details'] },
// ];

const nodes = {
  text: 'Mindmap',
  nodes: [
    {
      text: 'Canvas',
      nodes: [
        {
          text: 'Lots of node trees. There really are lots of trees that need lots and lots of maths',
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

const FilledDiv = styled.div`
  height: 100vh;
  width: 100vw;
`;

const FillCanvas = styled.canvas`
  height: 100vh;
  width: 100vw;
`;

const Mindmap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    // Resize
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    // Get context
    const context = canvas.getContext('2d')!;

    // Set font
    context.font = '32px Roboto, sans-serif';
    context.textBaseline = 'top';
    context.fillStyle = '#e2e2e2';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;

    // const textLines = getTextBlock(
    //   context,
    //   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    //   800,
    // );

    // renderTextBlock(context, textLines, 40, 40, 32);
    const treeLayout = getTreeLayout(context, nodes, 800, 32);
    renderTree(context, treeLayout, 32);
    console.log(treeLayout);
  }, []);

  return (
    <FilledDiv>
      <FillCanvas ref={canvasRef} />
    </FilledDiv>
  );
};

export default Mindmap;
