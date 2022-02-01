var mongoose = require('mongoose');
var debug = require('debug')('app');
const app = require('./app');
const port = 3030;

// mongodb config and connection //////////////////
mongoose.Promise = global.Promise;
const mongoDB = "mongodb://database/argo" // EV this later
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: 1,
  connectTimeoutMS: 30000,
  maxPoolSize: 2
};

mongoose.connect(mongoDB, mongooseOptions)
.catch(error => { console.log('mongoose connect error: ', error.message); process.exit(1)});

let db = mongoose.connection;
db.on('error', debug.bind(console, 'MongoDB connection error:'));
//////////////// end mongo config //////////////////

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
