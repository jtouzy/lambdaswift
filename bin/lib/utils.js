const isNull = (element) => {
  return typeof element === 'undefined' || element === null
} 

const handleError = (message) => {
  console.error(message)
  process.exit(1)
}

module.exports = {
  isNull,
  handleError
}
