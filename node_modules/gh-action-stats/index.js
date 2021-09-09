const https = require('https');
const { getActionMetadataFromDirname, getRunMetadata } = require('./utils.js');

function collectStats() {

  const data = JSON.stringify({
    ...getRunMetadata(),
    ...getActionMetadataFromDirname(__dirname)
  });

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

