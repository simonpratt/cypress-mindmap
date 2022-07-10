import express from 'express';

export const start = () => {
  const app = express();

  app.use('/json', express.static('TEMP_MINDMAP'));
  app.use('/', express.static('dist/ui'));

  app.listen(5112);
};
