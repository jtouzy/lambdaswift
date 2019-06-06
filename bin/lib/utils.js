const childProcess = require('child_process')

const isNull = (element) => {
  return typeof element === 'undefined' || element === null
} 

const handleError = (message) => {
  console.error(message)
  process.exit(1)
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
  handleError,
  isNull,
  runCommand
}
