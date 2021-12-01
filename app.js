const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require("crypto")
const upload = multer();
const app = express();

const user = require('./models/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res, next) {
    res.render('index');
});

app.post('/register_key', upload.none(), function(req, res, next){

    let k = crypto.randomBytes(20).toString('hex')
    user.create({
        first: req.body.first, 
        last: req.body.last, 
        email: req.body.email, 
        affiliation: req.body.affiliation, 
        key: k, 
        tokenValid: 1}).then(function(response){
            // TBD: send success email to response.email
            res.render('reg-success')
            return          
        }).catch(function(response){
            if(response.code == 11000){
                // TBD: resend response.token to response.email
                res.render('reg-dupe')
                return
            }
        })
});

app.post('/recover_key', upload.none(), function(req, res, next){

    user.findOne({"email": req.body['recover-email']}).exec().then(function(response){
        // TBD: send response.key to response.email
        console.log(response)
        res.render('recover-success')        
    }).catch(function(response){
        return null       
    });
});

app.post('/rotate_key', upload.none(), function(req, res, next){

    let k = crypto.randomBytes(20).toString('hex')
    user.findOneAndUpdate({"email": req.body['rotate-email'], "key": req.body['rotate-key']}, {"key": k},{"new": true}).then(function(response){
        // TBD: send response.key to response.email if an update was made
        res.render('rotate-success')
    }).catch(function(response){
        return null
    })
});

app.post('/delete_key', upload.none(), function(req, res, next){

    user.deleteOne({"email": req.body['delete-email'], "key": req.body['delete-key']}).then(function(response){
        // TBD: email confirming deletion
        console.log(response)
        res.render('delete-success')
    }).catch(function(response){
        return null
    })
});

module.exports = app;
