import express from 'express';
import path from 'path';

const __fake = path.resolve();

export const start = () => {
  const app = express();

  console.log('real dir name', __dirname);
  console.log('fake dir name', __fake);

  app.use('/json', express.static('TEMP_MINDMAP'));
  app.use('/', express.static(`${__dirname}/dist/ui`));

  app.listen(5112);
};
