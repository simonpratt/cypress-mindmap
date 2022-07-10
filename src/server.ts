import express from 'express';
import path from 'path';

const __dirname = path.resolve();

export const start = () => {
  const app = express();

  app.use('/json', express.static('TEMP_MINDMAP'));
  app.use('/', express.static(`${__dirname}/dist/ui`));

  app.listen(5112);
};
