const mongoose = require('mongoose');
const uniqueValidator =require("mongoose-unique-validator");
//npm install --save mongoose-unique-validator

const userSchema = mongoose.Schema({
  email:{type: String, required:true, unique: true},
  password: {type:String, required:true},
  numVotes: {type: Number},
  numPosts: {type: Number}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
