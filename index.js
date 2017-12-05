#!/usr/bin/env node

/*
 * Springbok: Utility to serve private S3 files through an HTTP server with token authentication.
 *
 * Commands:
 * - springbok adduser <user-directory>
 * - springbok rmuser <user-directory>
 * - springbok sign <user-directory> <path-relative-to-user-directory>
 * - springbok start 8080
 *
 */

const _ = require('lodash');
const program = require('commander');
const { randomBytes } = require('crypto');
const config = require('./config.json');
const startServer = require('./server.js');
const { readAuthFile, writeAuthFile } = require('./authentication.js');

// -------------------------

async function findTokenByDirectory(directory) {
  const authData = await readAuthFile();
  return _.findKey(authData, v => v === directory);
}

async function addTokenToAuthFile(directory, token) {
  const authData = await readAuthFile();
  return writeAuthFile(_.set(authData, token, directory));
}

async function removeTokenFromAuthFile(token) {
  const authData = await readAuthFile();
  return writeAuthFile(_.omit(authData, [token]));
}

function generateToken() {
  return new Promise((resolve, reject) => {
    randomBytes(16, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer.toString('hex'));
    });
  });
}

// -------------------------
// operations

async function addUser(directory) {
  let token = await findTokenByDirectory(directory);
  if (!token) {
    token = await generateToken();
    await addTokenToAuthFile(directory, token);
  }
  return { directory, token };
}

async function removeUser(directory) {
  const token = await findTokenByDirectory(directory);
  if (token) await removeTokenFromAuthFile(token);
}

async function signPath(directory, path) {
  const token = await findTokenByDirectory(directory);
  if (token) {
    return `https://${config.host}/${directory}/${path}?token=${token}`;
  }
  throw new Error(`ERROR: no token found for ${directory}`);
}

// -------------------------
// CLI interface

program
  .command('adduser <directory>')
  .action(async (directory) => {
    const result = await addUser(directory);
    console.log('-> added directory:', result);
  });

program
  .command('rmuser <directory>')
  .action(async (directory) => {
    await removeUser(directory);
    console.log('-> removed directory:', directory);
  });

program
  .command('sign <directory> <filepath>')
  .action(async (directory, path) => {
    const url = await signPath(directory, path);
    console.log('-> signed url:', url);
  });

program
  .command('start [port]')
  .action((port = 3000) => {
    console.log(` -> starting server on port ${port}`);
    startServer({ port });
  });

program.parse(process.argv);