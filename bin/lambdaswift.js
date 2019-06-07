#!/usr/bin/node

require('yargs')
  .command(require('./lib/create-runtime'))
  .command(require('./lib/build-function'))
  .help()
  .argv
