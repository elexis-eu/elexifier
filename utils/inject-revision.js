require('colors');
const { promisify } = require('util');
const fs = require('fs');
const exec = require('child_process').exec;

const writeFileAsync = promisify(fs.writeFile);
const configFilePath = './src/environments/environment.staging.ts';
const encodingOptions = {
  encoding: 'utf8'
};

const getShortCommitHash = async () => {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --short HEAD', (error, stdout, stderr) => {
      if (error !== null) {
        console.log('git error: ', error, stderr);
        reject(error);
      }
      return resolve(stdout.toString().trim());
    });
  });
};

async function injectRevision() {
  let revision = process.env.REVISION;
  if (!revision) {
    console.log(`InjectRevision::Error::REVISION not set`.red.bold);
    console.log(`InjectRevision::Trying git command`.yellow.bold);
    revision = await getShortCommitHash();
  }

  const envFileContent = fs.readFileSync(configFilePath, encodingOptions);
  const newContent = envFileContent.replace(/%REVISION%/g, revision);

  return writeFileAsync(configFilePath, newContent, encodingOptions);
}

function onError(err) {
  console.log(`InjectRevision::Error::${err}`.red.bold);
}

injectRevision().catch(onError);
