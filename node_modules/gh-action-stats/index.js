const https = require('https');
const { getActionMetadataFromDirname, getRunMetadata } = require('./utils.js');

/**
 * Collect the stats for the run
 */
function collectStats(func) {
  getRunMetrics(func).then(res => {
    sendStats(res);
    if (res.error !== undefined) {
      throw res.Error;
    }
  })
}

/**
 * Run the function to get the associated run metrics
 * returs the execution time for the function and any associated errors
 */
async function getRunMetrics(func) {
  let executionTime, error;
  if (func !== undefined) {
    const start = process.hrtime();
    try {
      let res = func();
      if (res.then !== undefined) {
        res = await res;
      }
    } catch (e) {
      error = e;
    }
    executionTime = process.hrtime(start);
  }
  return { executionTime, error }
}

/**
 * Send the stats to the server
 */
function sendStats({ executionTime, error }) {
  const data = JSON.stringify({
    ...getRunMetadata(),
    ...getActionMetadataFromDirname(__dirname),
    execution_time: executionTime || null,
    error: error ? {
      name: error.name,
      message: error.message
    } : null
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

