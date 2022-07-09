import styled, { createGlobalStyle } from 'styled-components';
import Mindmap from './components/Mindmap';

const CanvasContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const GlobalStyles = createGlobalStyle`
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #424448;
  color: #e2e2e2;

  * {
    box-sizing: border-box;
  }
}
`;

function App() {
  return (
    <>
      <GlobalStyles />
      <CanvasContainer>
        <Mindmap />
      </CanvasContainer>
    </>
  );
}

export default App;
