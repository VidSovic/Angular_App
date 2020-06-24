const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Comment = require('../models/comment')


router.post("/:id",checkAuth, (req,res,next) =>{
  const comment = new Comment({
    context: req.body.context,
    date: req.body.date,
    postId: req.params.id
  });
  comment.save().then(comment => {
    res.status(201).json({
      message: 'Comment added sucesfully',
      comment: comment
    });
  }).catch(error =>{
    res.status(500).json({
      message: 'Creating a post failed!'
    });
  });
})

router.get("/:id", checkAuth, (req,res,next)=>{
  const commentQuery = Comment.find({postId: req.params.id}).sort({date:-1});
  commentQuery.then(documents =>{
    res.status(200).json({
      message:"Comments fetched successfully",
      comments: documents
    });
  }).catch(error =>{
    res.status(500).json({
      message: "Fetching comments failed!"
    });
  });
});

module.exports = router;
