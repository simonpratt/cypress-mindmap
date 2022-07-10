import express from 'express';
import { getPackageDirectory } from './helpers/getPackageDirectory.js';

export const start = () => {
  const app = express();

  app.use('/json', express.static(`${getPackageDirectory()}/json`));
  app.use('/', express.static(`${getPackageDirectory()}/dist/ui`));

  app.listen(5112);
};
