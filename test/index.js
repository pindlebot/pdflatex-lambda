const pdflatex = require('../')
const dir = require('path').join(__dirname, 'tmp')

pdflatex(dir).then(console.log.bind(console))