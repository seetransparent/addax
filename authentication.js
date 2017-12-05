const fs = require('fs');

function readAuthFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('./auth.json', (err, file) => {
      if (err) return reject(err);
      resolve(JSON.parse(file));
    });
  });
}

function writeAuthFile(jsonData) {
  return new Promise((resolve, reject) => {
    fs.writeFile('./auth.json', JSON.stringnify(jsonData, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { readAuthFile, writeAuthFile };
