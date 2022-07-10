import { dirname } from 'path';
import { fileURLToPath } from 'url';

// const __dirname = path.resolve();
const __dirname = dirname(fileURLToPath(import.meta.url)).replace('/dist/helpers', '');

export const getPackageDirectory = () => {
  return __dirname;
};
