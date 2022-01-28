const express = require('express');
const path = require('path');
const multer = require('multer');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const crypto = require("crypto")
const upload = multer();
const app = express();

const user = require('./models/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'))

const sendit = function(msg, logmsg){
    return sgMail.send(msg).then(() => {console.log(Date.now() + ': ' + logmsg )})
}

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
        tokenValid: 1})
    .then(function(response){
            var msg = {
              to: req.body.email,
              from: 'argovis@colorado.edu',
              subject: 'Your Argovis API Key',
              html: "<p>Welcome to Argovis! Your API key is: " + k + `
To use this, add it to the header of requests to the Argovis API under the "x-argokey" header. For example, try this at the bash shell:</p>

<pre>curl -H "x-argokey: &lt;your API token&gt;" "http://argovis-api-atoc-argovis-dev.apps.containers02.colorado.edu/profiles?ids=7900500_120"</pre>
              
<p><b>Note that requests are rate limited.</b> These limits will be adjusted based on load, but you can in general expect to be able to make metadata-only requests faster than full profile or grid requests. If your requests fail with HTTP code 403, especially if you are making many requests in a loop, consider putting a short delay between them.</p>

<p>Full API docs can be found at <a href='http://argovis-api-atoc-argovis-dev.apps.containers02.colorado.edu/docs'>http://argovis-api-atoc-argovis-dev.apps.containers02.colorado.edu/docs</a>; don't hesitate to reach out to the team at argovis@colorado.edu if you run into trouble or have bug reports or feature requests.</p>`
            }
            sendit(msg, 'Welcome email sent to ' + msg.to)
            .then(()=>res.render('reg-success'))
            .catch((error) => {console.error(error)})       
        })
    .catch(function(response){
            if(response.code == 11000){
                // dupe registration; assume the user forgot and resend them their existing key
                query = user.find({email: req.body.email})
                query.exec(function(err, u){
                    if(err){
                        console.log('Error looking up user' + req.body.email + ' after dupe registration:')
                        console.log(err)
                        return
                    }
                    var msg = {
                      to: req.body.email,
                      from: 'argovis@colorado.edu',
                      subject: 'Your Argovis API Key - Resend',
                      html: "<p>Someone just tried to register an Argovis API key for this email address. Your current API key is: " + u[0].key + `</p>
                      <p>You may rotate this key at Link_TBD.</p>`
                    }
                    sendit(msg, 'Registration dupe email sent to ' + msg.to)
                    .then(()=>res.render('reg-dupe'))
                    .catch((error) => {console.error(error)})
                })
            } else{
                console.log('Excpetion when registering user ' + req.body.email + ":")
                console.log(response)
                res.render('fail')
            }
        })
});

app.post('/recover_key', upload.none(), function(req, res, next){

    user.findOne({"email": req.body['recover-email']}).exec().then(function(response){
        if(response){
            var msg = {
              to: req.body['recover-email'],
              from: 'argovis@colorado.edu',
              subject: 'Forgotten Argovis API Key',
              html: "<p>Did you forget your Argovis API key? Your current API key is: " + response.key + `</p>
              <p>You may rotate this key at Link_TBD.</p>`
            }
            sendit(msg, 'Forgotten key email sent to ' + msg.to)
            .catch((error) => {console.error(error)})
        }else{
            console.log(Date.now() + ': ' + ' failed key recovery for email ' + req.body['recover-email'])
        }
        res.render('recover-success')        
    }).catch(function(response){
        console.log('Excpetion when recovering forgotten key for user ' + req.body['recover-email'] + ":")
        console.log(response)
        res.render('fail')      
    });
});

app.post('/rotate_key', upload.none(), function(req, res, next){

    let k = crypto.randomBytes(20).toString('hex')
    user.findOneAndUpdate({"email": req.body['rotate-email'], "key": req.body['rotate-key']}, {"key": k},{"new": true}).then(function(response){
        if(response){
            var msg = {
              to: req.body['rotate-email'],
              from: 'argovis@colorado.edu',
              subject: 'Rotated Argovis API Key',
              html: "<p>Your Argovis API key has been rotated. Your current API key is: " + response.key + `</p>
              <p>You may rotate this key again any time at Link_TBD.</p>`
            }
            sendit(msg, 'Rotated key email sent to ' + msg.to)
            .catch((error) => {console.error(error)})
        }else{
            console.log(Date.now() + ': ' + ' failed key rotate for email ' + req.body['rotate-email'] + ' and key ' + req.body['rotate-key'] )
        }
        res.render('rotate-success')        
    }).catch(function(response){
        console.log('Excpetion when rotating key for user ' + req.body['rotate-email'] + ":")
        console.log(response)
        res.render('fail')      
    });
});

app.post('/delete_key', upload.none(), function(req, res, next){

    user.deleteOne({"email": req.body['delete-email'], "key": req.body['delete-key']}).then(function(response){
        if(response){
            var msg = {
              to: req.body['delete-email'],
              from: 'argovis@colorado.edu',
              subject: 'Deleted Argovis API Key',
              html: "<p>Your Argovis API key has been deleted. We're sad to see you go! Please send any feedback to argovis@colorado.edu on how we could make this service more useful for you, and we hope to see you again in future."
            }
            sendit(msg, 'Deleted key email sent to ' + msg.to)
            .catch((error) => {console.error(error)})
        }else{
            console.log(Date.now() + ': ' + ' failed key deletion for email ' + req.body['delete-email'] + ' and key ' + req.body['delete-key'] )
        }
        res.render('delete-success')        
    }).catch(function(response){
        console.log('Excpetion when deleting key for user ' + req.body['delete-email'] + ":")
        console.log(response)
        res.render('fail')      
    });
});

module.exports = app;
