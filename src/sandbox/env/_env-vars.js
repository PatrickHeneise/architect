let parse = require('@architect/parser')
let read = require('fs').readFileSync
let exists = require('path-exists').sync
let join = require('path').join
let chalk = require('chalk')

module.exports = function _setupEnv(inventory, callback) {

  let name = inventory.app

  // populate ARC_APP_NAME (used by @architect/functions event.publish)
  process.env.ARC_APP_NAME = name

  // set up command flags
  //let env
  let port
  let command = process.argv.slice(2).map(c => {
    if (c.slice().includes('=')) {
      return c.split('=')
    } else {
      return c
    }
  })
  command.map(c => {
    /*
    if (c === 'testing' ||
        c === '--testing' ||
        c === '-t') {
      env = 'testing'
    }
    if (c === 'staging' ||
        c === '--staging' ||
        c === '-s') {
      env = 'staging'
    }
    if (c === 'production' ||
        c === '--production' ||
        c === '-p') {
      env = 'production'
    }*/
    if (Array.isArray(c)) {
      if (c[0] === '--port' && Number(c[1]) >= 2 && Number(c[1]) <= 65535) {
        port = Number(c[1])
      }
    }
    else {
      return c
    }
  })

  // populate SESSION_TABLE_NAME (used by @architect/functions http functions)
  // override w .arc-env
  //FIXME tmp patch for process.env.SESSION_TABLE_NAME = 'jwe'
  process.env.SESSION_TABLE_NAME = 'arc-sessions'

  // populate PORT (used by http server)
  if (!process.env.PORT) {
    process.env.PORT = `3333`
  }
  if (typeof port === 'number') {
    process.env.PORT = port
  }

  // interpolate arc-env
  let envPath = join(process.cwd(), '.arc-env')
  if (exists(envPath)) {
    populateEnv(envPath)
    let local = 'init process.env from .arc-env @testing (ARC_LOCAL override)'
    let not = 'init process.env from .arc-env @' + process.env.NODE_ENV
    let msg = process.env.hasOwnProperty('ARC_LOCAL')? local : not
    console.log(chalk.grey(chalk.green.dim('✓'), msg))
  }
  callback()
}

/**
 * populate process.env with .arc-env
 * if NODE_ENV=staging the process.env is populated by @staging (etc)
 * if ARC_LOCAL is present process.env is populated by @testing (so you can access remote dynamo locally)
 */
function populateEnv(path) {
  let raw = read(path).toString()
  let env = parse(raw)
  let actual = process.env.hasOwnProperty('ARC_LOCAL')? 'testing' : process.env.NODE_ENV
  env[actual].forEach(tuple=> {
    process.env[tuple[0]] = tuple[1]
  })
}

