const childProcess = require('child_process')
const fs = require('fs-extra')

const clearOrCreatePath = (path) => {
  if (fs.existsSync(path)) {
    fs.removeSync(path)
  }
  fs.mkdirpSync(path)
}

const handleError = (message) => {
  console.error(message)
  process.exit(1)
}

const isNull = (element) => {
  return typeof element === 'undefined' || element === null
}

const runCommand = (commandParts) => {
  return new Promise((resolve, reject) => {
    const command = commandParts.join(' ')
    childProcess.exec(command, (error) => {
      if (error) {
        handleError(error.message)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  clearOrCreatePath,
  handleError,
  isNull,
  runCommand
}
