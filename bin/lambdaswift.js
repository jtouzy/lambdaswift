#!/usr/bin/node

require('yargs')
  .command(require('./lib/create-runtime'))
  .help()
  .argv
