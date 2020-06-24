const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
  numVotes: {type: Number, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId,ref: "User", required: true},
  postId: {type: mongoose.Schema.Types.ObjectId,ref: "Post",required: true}
});

module.exports = mongoose.model('Vote', voteSchema);
