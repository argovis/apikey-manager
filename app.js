const express = require('express');
const path = require('path');
const multer = require('multer');
const crypto = require("crypto")
const upload = multer();
const app = express();

const user = require('./models/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', function(req, res, next) {
    res.render('index');
});

app.post('/register_key', upload.none(), function(req, res, next){

    let k = crypto.randomBytes(20).toString('hex');
    user.create({
        first: req.body.first, 
        last: req.body.last, 
        affiliation: req.body.affiliation, 
        key: k, 
        tokenValid: 1})
    .then(()=>res.render('reg-success', { key: k }))
    .catch(function(response){
            res.render('fail')
    })
});

module.exports = app;
