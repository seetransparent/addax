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
const fs = require('fs');
const program = require('commander');
const { randomBytes } = require('crypto');
const startServer = require('./server.js');
const { readAuthFile, writeAuthFile } = require('./authentication.js');

let config;

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
    startServer(config, { port });
  });

// -------------------------
// entry point

const configFile = './config.json';

// first make sure that the config file exists in the curren dir
fs.access(configFile, fs.constants.R_OK, (err) => {
  if (err) return console.error('ERROR: config.json file not found in the current directory.');
  // read the config file
  fs.readFile(configFile, (err, file) => {
    if (err) return console.log('[reading config.json] ERROR:', err);
    try {
      // parse the JSON file
      config = JSON.parse(String(file));
      // execute the cli command
      program.parse(process.argv);
    } catch (err) {
      console.log('[parsing config.json] ERROR:', err);
    }
  });
});
