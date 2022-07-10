import path from 'path';

const __dirname = path.resolve();

export const getPackageDirectory = () => {
  console.log('package dir', __dirname);
  return __dirname;
};
