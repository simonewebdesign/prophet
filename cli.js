#!/usr/bin/env node

const client = require('taapi').client(process.env.PROPHET_TAAPI_API_KEY)

client.setTelegramCredentials(
  process.env.PROPHET_TELEGRAM_BOT_KEY,
  process.env.PROPHET_TELEGRAM_CHAT_ID
)

const [rsiLowerBound, rsiUpperBound] = process.argv.slice(2)

if (!rsiLowerBound || !rsiUpperBound) {
  console.error('Please specify a lower and upper bound.')
  process.exit(1)
}

const INTERVAL_MS = 60000
const indicator = 'rsi'
const source = 'binance'
const symbol = 'VET/USDT'
const interval = '2h'
// const preamble = value => `Hi Sir. The ${indicator.toUpperCase()} for ${symbol} is ${value.toFixed(1)}, which appears to be `
// const privatePreamble = value => `Hi Sir. The ${indicator.toUpperCase()} for ${symbol} is ${value.toFixed(1)}, which appears to be `
const buildMessage = value => `${indicator.toUpperCase()} ${value.toFixed(1)}. ${getSignalType(value)} signal.`

setInterval(() => {
  client
    .getIndicator(indicator, source, symbol, interval)
    .then(handleResponse)
    .catch(err => {
      console.error('[prophet]', err)
    })
}, INTERVAL_MS)

const { exec } = require('child_process')

const command = value =>
  `osascript -e 'display notification "${buildMessage(value)}" with title "Prophet" sound name "Purr"'`

function handleResponse ({ value }) {
  // console.log(new Date(), `${indicator.toUpperCase()} is ${parseInt(value, 10)}`)
  // console.log(new Date())

  if (value < parseInt(rsiLowerBound, 10)) { // underbought
    sendMacOSNotification(value)
    client.postTelegramMessage(buildMessage(value))
  }

  if (value > parseInt(rsiUpperBound, 10)) { // overbought
    sendMacOSNotification(value)
    client.postTelegramMessage(buildMessage(value))
  }
}

function sendMacOSNotification (value) {
  exec(command(value), (error, stdout, stderr) => {
    if (error) {
      console.log(`command error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`command stderr: ${stderr}`)
    }
  })
}

function getSignalType (value) {
  if (value < parseInt(rsiLowerBound, 10)) { // underbought
    return 'Buy'
  }

  if (value > parseInt(rsiUpperBound, 10)) { // overbought
    return 'Sell'
  }
}

console.log(new Date(), 'Prophet started.')
