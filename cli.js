// Require taapi (using the NPM client: npm i taapi --save)
const taapi = require("taapi");

// Setup client with authentication
const client = taapi.client("MY_SECRET");

// Get the BTC/USDT RSI value on the 1 minute time frame from binance
client.getIndicator("rsi", "binance", "BTC/USDT", "1m").then(function(result) {
    console.log("Result: ", result);
});

// --- Or ---

// Require axios: npm i axios
var axios = require('axios');

axios.get('https://api.taapi.io/rsi', {
  params: {
    secret: "MY_SECRET",
    exchange: "binance",
    symbol: "BTC/USDT",
    interval: "1h",
  }
})
.then(function (response) {
  console.log(response.data);
})
.catch(function (error) {
  console.log(error.response.data);
});