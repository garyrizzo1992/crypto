const threeCommasAPI = require('3commas-api-node');
require('dotenv').config();

//3commas setup + get accountsid
const api = new threeCommasAPI({
    apiKey: process.env.api,
    apiSecret: process.env.secret,

    // url: 'https://api.3commas.io' // this is optional in case of defining other endpoint
    // forcedMode: 'paper' // this is optional in case of defining account mode, 'real' or 'paper'
})

// Get 3commas account id
accounts = () => {
    return api.accounts()
}
const GetBalances = async () => {
    var balances = []
    try {
        await accounts().then(async (res) => {
            for (acc in res) {
                // console.log(res[acc].id)
                await api.accountLoadBalances(res[acc].id).then((bal) => {
                    // console.log(bal.usd_amount)
                    if (bal.usd_amount > 0.0) {
                        balances.push({
                            name: bal.name,
                            balance: bal.usd_amount
                        })
                    }
                })
            }
        })
        return balances
    } catch (error) {
        console.log(error)
    }
}

GetBalance = () => GetBalances().then((data) => { 
    var total_balance = 0
    for (var k in data)
    {
        total_balance += parseInt(data[k].balance,10)
    }
    return total_balance
})

module.exports = {
    GetBalance
}
