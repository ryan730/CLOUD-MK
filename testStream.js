const fs = require('fs')
const zlib = require('zlib')

const src = fs.createReadStream('./test.js')
const writeDesc = fs.createWriteStream('./test.gz')
const writeDesc1 = fs.createWriteStream('./test1.js')
src.pipe(zlib.createGzip()).pipe(writeDesc)



