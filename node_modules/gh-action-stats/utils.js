/**
 * returns the following information about the current action
 * creator: github user who created the action
 * name: name of the github action
 * version: version of the actions used (can be a branch, a tag or even a commit number)
 * Note this would only work with macOS and Linux, i cant make sure that it works for windows just yet.
 */
function getActionMetadataFromDirname(dirname) {
  const metadata = dirname.replace('/home/runner/work/_actions/', '') // remove os path
    .replace('/node_modules/gh-action-stats', '') // remove node_modules and 
    .split('/')
  return {
    creator: metadata[0],
    name: metadata[1],
    version: metadata.slice(2).join('/')
  }
}

function getRunMetadata() {
  const envVars = [
    'GITHUB_RUN_ID',
    'GITHUB_ACTION',
    'GITHUB_ACTOR',
    'GITHUB_REPOSITORY',
    'GITHUB_REF',
    'GITHUB_HEAD_REF',
    'GITHUB_BASE_REF',
    'RUNNER_OS'
  ];
  return envVars.map(v => ({ [v.toLowerCase()]: process.env[v] || null }))
    .reduce((acc, cur) => ({ ...acc, ...cur }))
}

module.exports = {
  getActionMetadataFromDirname,
  getRunMetadata
};

