const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')
const { promisify } = require('util')
const { exec } = require('child_process')
const list = promisify(fs.readdir)
const chmod = promisify(fs.chmod)

process.env.PATH += ':/tmp/texlive/2018/bin/x86_64-linux/'
process.env.HOME = '/tmp'
process.env.PERL5LIB = '/tmp/texlive/2018/tlpkg/TeXLive/'

function isInstalled () {
  return new Promise((resolve, reject) => {
    exec('pdflatex --version', (error, stdout, stderr) => {
      if (error) resolve(false)
      else resolve(true)
    })
  })
}

const SIZE = 169353706

const format = (progress) => parseInt((progress / SIZE) * 100)

module.exports = async (callback) => {
  const installed = await isInstalled()
  if (!installed) {
    const zip = unzipper.Extract({ path: '/tmp' })
    const stream = got.stream('https://s3.amazonaws.com/aws-lambda-binaries/texlive.zip')
    
    let progress = 0
    if (callback) {
      stream.on('data', (buffer) => {
        let tmp = Number(progress)
        progress += buffer.length
        let formattedProgress = format(progress)
        if (format(tmp) !== formattedProgress) {
          callback(formattedProgress)
        }
      })
    }
  
    stream.pipe(zip)

    await new Promise((resolve, reject) => {
      zip.on('close', resolve)
    })
    let files = await list('/tmp/texlive/2018/bin/x86_64-linux/')
    await Promise.all(
      files.map(file =>
        chmod(path.join('/tmp/texlive/2018/bin/x86_64-linux/', file), '0700')
      )
    )
  }
  return { installed }
}
