const threeCommasAPI = require('3commas-api-node')
const querystring = require('querystring');
const http = require('https');
require('dotenv').config();



//3commas setup + get accountsid
const api = new threeCommasAPI({
  apiKey: process.env.api,
  apiSecret: process.env.secret,

  // url: 'https://api.3commas.io' // this is optional in case of defining other endpoint
  forcedMode: 'paper' // this is optional in case of defining account mode, 'real' or 'paper'
})

// Get 3commas account id
const accounts = async (callback) => {
  let data = await api.accounts({})
  callback(data[0].id)
}

function httprequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.lunarcrush.com',
      port: 443,
      path: url,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode));
      }
      var body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });
    req.on('error', (e) => {
      reject(e.message);
    });
    // send the request
    req.end();
  })
}

const FilterBinance = (coinarray, callback) => {
    coins = []
    httprequest('/v2?data=market-pairs&key=' + process.env.lunar + '&symbol='+ encodeURIComponent(coins.join())+'&limit=10').then((data) => {
      const response = {
        statusCode: 200,
        body: data,
      }
      // get symbol
      // loop through data[].marketPairs[].exchange
      // if binance found, keep
      for (var s in response.body.data) {
        symb = s.symbol
        console.log(s)
        for (var f in s.marketPairs) {
        if (f.exchange.toLowerCase() === 'binance') {
  
          coins.push('BTC_' + symb.toUpperCase())
        }
          
        }
      }}).catch((error) => {
        console.log('Error!', error)
      })
    callback(coins)
  }
  



  const create = (async () => {
    console.log("entered create()")
    //get 3commas accountID
    // await accounts().then((result) => {
    //   accountid = result
    // }).catch((error) => {
    //   console.log('Error!', error)
    // })
  
    // lunar crush & filter on binance

    var dirtyarr = []
    await httprequest('/v2?data=market&key=' + process.env.lunar + '&limit=20&sort=gs&desc=true&type=fast').then((data) => {
      const response = {
        statusCode: 200,
        body: data,
      }
      for (var s in response.body.data) {
        dirtyarr.push(response.body.data[s].s)
      }
  
    }).catch((error) => {
      console.log('Error!', error)
    })
  
    await FilterBinance(dirtyarr, (coins) => {
      arr = coins
    })
    
    botparams = {
      name: 'nodejs_bot',
      account_id: accountid,
      pairs: arr,
      max_active_deals: arr.length,
      base_order_volume: 0.00035,
      base_order_volume_type: 'quote_currency',
      take_profit: 1,
      safety_order_volume: 0.00035,
      safety_order_volume_type: 'quote_currency',
      martingale_volume_coefficient: 2,
      martingale_step_coefficient: 1.4,
      max_safety_orders: 6,
      active_safety_orders_count: 1,
      cooldown: 0,
      trailing_enabled: false,
      strategy: 'long',
      safety_order_step_percentage: 2,
      take_profit_type: 'base',
      strategy_list: '[{"options": {"time": "5m", "type": "buy_or_strong_buy"}, "strategy": "trading_view"}]',
      leverage_type: 'not_specified',
      stop_loss_timeout_enabled: false,
      stop_loss_timeout_in_seconds: 0,
      min_volume_btc_24h: 100,
      tsl_enabled: false,
      deal_start_delay_seconds: 0,
      profit_currency: 'quote_currency',
      start_order_type: 'limit',
      stop_loss_type: 'stop_loss',
      allowed_deals_on_same_pair: 1,
    }
  
    let encoded_params = querystring.stringify(botparams);
    console.log(encoded_params)
  
    let data = api.botCreate(botparams)
  
    data.then((result) => {
      console.log(result)
    }).catch((error) => {
      console.log(error)
    })
  
  })
   

module.exports = {
    httprequest,
    accounts,
    function3
 }

