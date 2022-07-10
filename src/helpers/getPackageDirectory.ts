import { dirname } from 'path';
import { fileURLToPath } from 'url';

// const __dirname = path.resolve();
const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPackageDirectory = () => {
  console.log('package dir', __dirname);
  return __dirname;
};
