const https = require('https');

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

function collectStats() {

  const data = JSON.stringify(getRunMetadata());

  const options = {
    hostname: 'us-central1-gh-action-stats.cloudfunctions.net',
    port: 443,
    path: '/newActionRun',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const req = https.request(options, _ => {
    console.debug(`Collected action statistics`);
  })

  req.on('error', error => {
    console.error('Error collecting action stats.\n', error)
  })

  req.write(data)
  req.end()

}

module.exports = collectStats;

