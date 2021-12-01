const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const upload = multer();
const app = express();

var User = require('./service/userService');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res, next) {
    res.render('index');
});

app.post('/register_key', upload.none(), function(req, res, next){User.createUser(req.body.first,req.body.last,req.body.affiliation,req.body.email).then(
    function (response) {
        // TBD: send success email to response.email
        res.render('reg-success')
    },
    function (response) {
        if(response.code == 11000){
            // TBD: resend response.token to response.email
            res.render('reg-dupe')
            return
        }
    })
    .catch(function (response) {
        res.send('catchbucket');
    });
});

app.post('/recover_key', upload.none(), function(req, res, next){User.findUser(req.body['recover-email']).then(
    function (response) {
        // TBD: send response.key to response.email
        res.render('recover-success')
    },
    function (response) {
        if(response.code == 404){
            res.render('recover-fail')
        }
    })
    .catch(function (response) {
        res.send('catchbucket');
    });
});

app.post('/rotate_key', upload.none(), function(req, res, next){User.rotateKey(req.body['rotate-email'], req.body['rotate-key']).then(
    function (response) {
        // TBD: send response.key to response.email
        res.render('rotate-success')
    },
    function (response) {
        if(response.code == 404){
            res.render('rotate-fail')
        }
    })
    .catch(function (response) {
        res.send('catchbucket');
    });
});

app.post('/delete_key', upload.none(), function(req, res, next){User.deleteKey(req.body['delete-email'], req.body['delete-key']).then(
    function (response) {
        res.render('delete-success')
    },
    function (response) {
        if(response.code == 404){
            res.render('delete-fail')
        }
    })
    .catch(function (response) {
        res.send('catchbucket');
    });
});

module.exports = app;
