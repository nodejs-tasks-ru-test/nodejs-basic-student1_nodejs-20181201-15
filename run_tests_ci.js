const request = require('request-promise').defaults({
  simple: false,
  resolveWithFullResponse: true,
  json: true
});
const run_tests = require('./run_tests');

const GITHUB_BASE = 'https://api.github.com';
const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'learn.javascript.ru taskbook app'
};

if (process.env.TRAVIS_EVENT_TYPE !== 'pull_request') return;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retrievePRInfo() {
  const repo_slug = process.env.TRAVIS_REPO_SLUG;
  const number = process.env.TRAVIS_PULL_REQUEST;
  
  const response = await request({
    uri: `${GITHUB_BASE}/repos/${repo_slug}/pulls/${number}`,
    headers: GITHUB_HEADERS,
    method: 'GET'
  });
  
  if (response.statusCode === 403) {
    await sleep(300);
    return retrievePRInfo();
  }
  
  const moduleName = response.body.title.match(/\d+-module/i) || [];
  const taskName = response.body.title.match(/\d+-task/i) || [];

  return [moduleName[0], taskName[0]];
}

retrievePRInfo()
  .then(([moduleName, taskName]) => {
    run_tests(moduleName, taskName, { reporter: 'json', useColors: false, });
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });