'use strict';
const user = require('../models/user');
const crypto = require("crypto")

exports.createUser = function(first,last,affiliation,email) {
  return new Promise(function(resolve, reject) {
    let k = crypto.randomBytes(20).toString('hex')
    user.create(
        {first: first, last: last, email: email, affiliation: affiliation, key: k, tokenValid: 1},
        function (err, res) {
            if (err){
                reject({"code": err.code, "message": "Server error", "email": email, "key": k});
                return;
            } else {
                resolve({email: email, key: k})
            }
        }
    )
  })
}

exports.findUser = function(email) {
  return new Promise(function(resolve, reject) {

    const query = user.findOne({"email": email});

    query.exec(function (err, u) {
        if (err){
            console.log(err)
            reject({"message": "Server error"});
            return;
        }
        if (u == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(u);
    })
  });
}

exports.rotateKey = function(email, key) {
  return new Promise(function(resolve, reject) {

    const query = user.findOne({"email": email, "key": key});

    query.exec(function (err, u) {
        if (err){
            reject({"message": "Server error"});
            return;
        }
        if (u == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        
        let k = crypto.randomBytes(20).toString('hex')
        user.findOneAndUpdate(
            {"email": email}, 
            {"key": k},
            {"new": true},
            (err, doc) => resolve([err,doc])
        )
    })
  });
}

exports.deleteKey = function(email, key) {
  return new Promise(function(resolve, reject) {

    const query = user.findOne({"email": email, "key": key});

    query.exec(function (err, u) {
        if (err){
            reject({"message": "Server error"});
            return;
        }
        if (u == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        
        user.deleteOne({"email": email, "key": key}, {}).then(function(res){resolve(res)}, function(err){reject(err)})
    })
  });
}