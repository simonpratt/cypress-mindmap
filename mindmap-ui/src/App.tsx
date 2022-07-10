import styled, { createGlobalStyle } from 'styled-components';
import MindmapLoader from './components/MindmapLoader';

const CanvasContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const GlobalStyles = createGlobalStyle`
html {
  // Disable gesture navigation
  overscroll-behavior-x: none;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #424448;
  color: #e2e2e2;
  overflow: hidden;

  // Disable gesture navigation
  overscroll-behavior-x: none;

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
        <MindmapLoader />
      </CanvasContainer>
    </>
  );
}

export default App;
