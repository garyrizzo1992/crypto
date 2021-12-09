const request = require('request');
const cheerio = require('cheerio');

const getGreed = () => {
    return new Promise((resolve, reject) => {
        request('https://alternative.me/crypto/fear-and-greed-index/', (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html)
                const greed = $('#main > section > div > div.columns > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(2) > div')
                resolve(greed.text())
            }
        })
    })
}

exports.getGreed = getGreed