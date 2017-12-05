const fs = require('fs');
const path = require('path');

function readAuthFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'auth.json'), (err, file) => {
      if (err) return reject(err);
      resolve(JSON.parse(file));
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
