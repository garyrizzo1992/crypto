const greed = require('./greed')
const threecommas = require('./3commas')
const hbs = require('hbs')
const express = require('express')
var path = require('path')
var fs = require('fs');


var _greed
var _bal
var app = express()

hbs.registerPartial('partial', fs.readFileSync(path.join(__dirname, 'views', 'partial.hbs'), 'utf8'))
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

updateData = () => {
    greed.getGreed().then((result) => {
        _greed = result
    })

    threecommas.GetBalance().then((result) => {
        _bal = '$' + result
    })
}
setInterval(updateData, 60 * 1000)

app.get('/greed', function (req, res) {
    updateData()
    res.send(_greed)
});

app.get('/bal', function (req, res) {
    updateData()
    res.send(_bal)
});

app.get('/', function (req, res) {
    // res.render(_greed)
    // res.render(_bal)
    updateData()
    res.locals = {
        greed: _greed,
        bal: _bal
    }
    res.render('index')
});

app.listen(3001);