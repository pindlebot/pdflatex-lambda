const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')
const { promisify } = require('util')
const { exec } = require('child_process')
const list = promisify(fs.readdir)
const chmod = promisify(fs.chmod)
const AWS = require('aws-sdk')

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

module.exports = async (update) => {
  const installed = await isInstalled()
  if (!installed) {
    const s3 = new AWS.S3({ region: 'us-east-1' })
    const params = {
      Bucket: 'aws-lambda-binaries',
      Key: 'texlive.zip'
    }
    const zip = s3.getObject(params)
      .createReadStream()
      .on('error', console.log.bind(console))

    zip.pipe(unzipper.Extract({ path: '/tmp' }))
    let progress = 0
    if (update) {
      zip.on('data', (buffer) => {
        let tmp = Number(progress)
        progress += buffer.length
        let formattedProgress = format(progress)
        if (format(tmp) !== formattedProgress) {
          update(formattedProgress)
        }
      })
    }

    await new Promise((resolve, reject) => {
      zip.on('end', resolve)
    })
    let files = await list('/tmp/texlive/2018/bin/x86_64-linux/')
    await Promise.all(
      files.map(file =>
        chmod(path.join('/tmp/texlive/2018/bin/x86_64-linux/', file), '0700')
      )
    )
  }
}
