const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    first: {type: String, required: true},
    last: {type: String, required: true},
    affiliation: {type: String, required: false},
    key: {type: String, required: true},
    tokenValid: {type: Number, required: true}
  },
  {
      versionKey: false
  }
);

module.exports = mongoose.model('user', UserSchema, 'user');