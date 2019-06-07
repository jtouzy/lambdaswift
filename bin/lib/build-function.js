const fs = require('fs-extra')
const path = require('path')
const { clearOrCreatePath, runCommand } = require('./utils')

module.exports = {
  command: 'build-function',
  describe: 'Build a lambda function for swift runtime',
  builder: {
    path: {
      alias: 'p',
      default: process.cwd()
    },
    image: {
      alias: 'i',
      default: 'swift:5.0'
    }
  },
  handler: (argv) => {
    const { path: functionPath, image: dockerImage } = argv
    const basePath = process.cwd()
    const buildPath = path.resolve(basePath, '.build')
    const functionName = path.basename(functionPath)
    const functionBuildPath = path.join(buildPath, functionName)
    const generationFolderName = 'generated'
    const generationPath = path.join(basePath, generationFolderName)
    const generatedFileName = `${functionName}.zip`
    clearOrCreatePath(buildPath)
    runCommand([
      'docker run',
      '--rm',
      `--volume "${functionPath}:/src"`,
      '--workdir "/src"',
      dockerImage,
      'swift build'
    ])
    .then(() => {
      const swiftFunctionBuildPath = path.join(functionPath, '.build', 'x86_64-unknown-linux', 'debug')
      fs.copySync(swiftFunctionBuildPath, functionBuildPath)
      fs.mkdirpSync(generationPath)
      const zipFilePath = path.join(generationPath, generatedFileName)
      fs.removeSync(zipFilePath)
      return runCommand([
        `cd ${functionBuildPath}`, 
        '&&', 
        `zip -r ${zipFilePath} *`
      ])
    })
    .then(() => {
      console.log(`
  ✅️ Swift function bundle generated in folder: ${generationPath}
  Use aws command to create or update the lambda function in AWS:

  ==> aws lambda create-function --function-name ${functionName} --runtime provided --role <your-iam-role> --handler ${functionName} --zip-file fileb://${generationFolderName}/${generatedFileName} --layers <the-swift-runtime-layer-version-arn>

  You can now execute your swift function in AWS.
      `)
    })
  }
}
