const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  context: {type: String, required: true},
  date: {type: Date, required: true},
  postId: {type: mongoose.Schema.Types.ObjectId,ref: "Post" ,required: true}
});

module.exports = mongoose.model('Comment', commentSchema);
