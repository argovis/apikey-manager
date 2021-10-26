const express = require('express');
const path = require('path');
const multer = require('multer');
const upload = multer();
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res, next) {
    res.render('index');
});

app.post('/register_key', upload.none(), function(req, res, next){
   console.log(req.body);
   res.send("recieved your request!");
});

module.exports = app;
