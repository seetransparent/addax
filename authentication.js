const fs = require('fs');
const path = require('path');

function readAuthFile() {
  const authFile = path.join(__dirname, 'auth.json');
  return new Promise((resolve, reject) => {
    fs.access(authFile, fs.constants.R_OK, (err) => {
      // if the file does not exist, read it as an empty object
      if (err) return resolve({});
      fs.readFile(authFile, (err, file) => {
        if (err) return reject(err);
        resolve(JSON.parse(file));
      });
    });
  });
}

function writeAuthFile(jsonData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, 'auth.json'), JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { readAuthFile, writeAuthFile };
