const path = require('path');

const appDirectory = path.resolve(__dirname, '..');
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  appIndex: resolveApp('javascript/packs/application.js'),
  appBuild: resolveApp('public/packs'),
  servedPath: '/packs/',
};
