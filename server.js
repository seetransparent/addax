const _ = require('lodash');
const express = require('express');
const { exec } = require('child_process');
const { readAuthFile } = require('./authentication.js');

// -------------------------
// helpers

function sanitizePath(path) {
  if (!path) return path;
  const illegalRe = /[\?<>\\:\*\|":;& ]/g;
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  return path
    .replace(illegalRe, '')
    .replace(controlRe, '');
}

// -------------------------
// authentication

async function authenticateUser(token, rootDirectory) {
  const auth = await readAuthFile();
  return _.get(auth, token, null) === rootDirectory;
}

// -------------------------
// s3 presigning

function presignPath(config, userDir, path) {
  const s3path = `s3://${config.rootPath}/${userDir}/${path}`;
  const endpoint = config.endpoint ? `--endpoint-url ${config.endpoint}` : '';
  const s3command = `aws ${endpoint} s3 presign --expires-in 604800 ${s3path}`;
  return new Promise((resolve, reject) => {
    exec(s3command, (err, stdout, stderr) => {
      if (err) reject(err);
      else if (stderr !== '') reject(new Error(stderr));
      else resolve(stdout.slice(0, -1));
    });
  });
}

// -------------------------
// webapp

module.exports = (config, options = {}) => {
  const app = express();

  app.get('/:root/*', async (req, res) => {
    const { root, 0: path } = req.params;
    const { token } = req.query;
    if (root && path && token && await authenticateUser(token, root)) {
      try {
        console.log(`[${new Date()}][access]`, root, path);
        res.redirect(await presignPath(config, root, sanitizePath(path)));
      } catch (err) {
        console.error(`[${new Date()}][ERROR]`, err);
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(404);
    }
  });

  app.get('*', (req, res) => {
    res.sendStatus(404);
  });

  app.listen(options);
};
