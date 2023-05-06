#!/usr/bin/env node

const { exec } = require('child_process')
const platform = require('os').platform()
const client = require('taapi').client(process.env.PROPHET_TAAPI_API_KEY)

client.setTelegramCredentials(
  process.env.PROPHET_TELEGRAM_BOT_KEY,
  process.env.PROPHET_TELEGRAM_CHAT_ID
)

const intervalMs = process.env.PROPHET_INTERVAL_MS || 300000 // 5 mins
const indicator = process.env.PROPHET_INDICATOR || 'rsi'
const source = process.env.PROPHET_SOURCE || 'binance'
const symbol = process.env.PROPHET_SYMBOL || 'ETH/USDT'
const interval = process.env.PROPHET_INTERVAL || '4h'

const rsiLowerBound = process.env.PROPHET_RSI_LOWER_BOUND || 30
const rsiUpperBound = process.env.PROPHET_RSI_UPPER_BOUND || 70

setInterval(() => {
  client
    .getIndicator(indicator, source, symbol, interval)
    .then(handleResponse)
    .catch(console.error)
}, intervalMs)

function handleResponse ({ value }) {
  console.log(buildMessage(value))
  if (value < parseInt(rsiLowerBound, 10)) { // underbought
    if (platform === 'darwin') sendMacOSNotification(value)
    client.postTelegramMessage(buildMessage(value))
  }

  if (value > parseInt(rsiUpperBound, 10)) { // overbought
    if (platform === 'darwin') sendMacOSNotification(value)
    client.postTelegramMessage(buildMessage(value))
  }
}

function sendMacOSNotification (value) {
  exec(macOSCommand(value), (error, stdout, stderr) => {
    if (error) {
      console.error(`command error: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`command stderr: ${stderr}`)
    }
  })
}

function getSignalType (value) {
  return value > parseInt(rsiUpperBound, 10) ? 'Sell' : 'Buy'
}

function buildMessage (value) {
  return `${indicator.toUpperCase()} ${value.toFixed(1)}. ${getSignalType(value)} signal.`
}

function macOSCommand (value) {
  return `osascript -e 'display notification "${buildMessage(value)}" with title "Prophet" sound name "Purr"'`
}
