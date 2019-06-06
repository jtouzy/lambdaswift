const childProcess = require('child_process')
const { handleError } = require('./utils')

module.exports = {
  command: 'create-runtime',
  describe: 'Create the swift runtime layer on AWS',
  builder: {
    layerName: {
      alias: 'l',
      default: 'swift-runtime-function'
    },
    image: {
      alias: 'i',
      default: 'swift:5.0'
    }
  },
  handler: (argv) => {
    const layerName = argv.layerName
    const dockerImage = argv.image
    const build = 'swift build'
    const command = `docker run --rm --volume "$(pwd)/:/src" --workdir "/src" ${dockerImage} ${build}`
    childProcess.exec(command, (error) => {
      if (error) {
        handleError(error.message)
      }
    })
  }
}
