const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Vote = require('../models/vote');
const multer = require("multer");
const checkAuth = require('../middleware/check-auth');
const User = require('../models/user');

const MIME_TYPE_MAP = {
'image/png': 'png',
'image/jpeg': 'jpg',
'image/jpg': 'jpg'
};
const storage = multer.diskStorage({
  destination: (req, file,cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if(isValid){
      error = null;
    }
    cb(error,"backend/images");
  },
  filename: (req,file,cb) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' +ext);
  }
});

router.post("",checkAuth,multer({storage: storage}).single("image") ,(req,res,next)=>{
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    date: Date.now(),
    creator: req.userData.userId,
    numVotes: 0,
    voted: false
  });
  post.save().then(createdPost => {

    User.findOne({_id: req.body.userId}, function(err, user){
      if(user){
        user.numPosts = user.numPosts + 1;
        user.save();
      }
    })

    res.status(201).json({
      message: 'Post added sucesfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  }).catch(error =>{
    res.status(500).json({
      message: 'Creating a post failed!'
    });
  });
});

router.get("/vote/:id", checkAuth, (req,res,next)=>{
    Vote.findOne({postId:req.params.id}).then(vote =>{
      if(vote){
          res.status(200).json({
              message: 'Getting number of votes successfuly!',
              numVotes: vote.numVotes
          });
      }
    })
})

router.get("/vote/:idPost/:idUser",checkAuth, (req,res,next) =>{
  Vote.findOne({postId: req.params.idPost, userId: req.params.idUser}).then(vote =>{
    if(vote){
      res.status(200).json({
        message: "User allready voted",
        check: true
      })
    }else{
      res.status(200).json({
        message: "User didn't voted",
        check: false
      })
    }
  })
})

router.post("/vote",checkAuth,(req,res,next)=>{
  Vote.findOne({postId: req.body.postId}).then(vote=>{
      if(!vote){
        Post.findOne({_id:req.body.postId}).then(post=>{
          post.numVotes = post.numVotes + 1;
          post.save();
        })
          var newVote = new Vote({
              numVotes:1,
              userId: req.body.userId,
              postId: req.body.postId
          });
          newVote.save().then(vote =>{

            User.findOne({_id: req.body.userId}, function(err, user){
              if(user){
                user.numVotes = user.numVotes + 1;
                user.save();
              }
            })
              res.status(201).json({
                message:'Vote added successfuly!',
                vote: vote
              });
          }).catch(error =>{
            res.json(500).json({
              message: 'Creating vote failed!'
            })
          });
      }else{

        Post.findOne({_id:req.body.postId}).then(post=>{
          post.numVotes = post.numVotes + 1;
          post.save();
        })
        vote.numVotes = vote.numVotes +1;
        vote.save().then(vote =>{
          res.status(201).json({
            message:'Vote added successfuly!',
            vote: vote
          });
      }).catch(error =>{
        res.json(500).json({
          message: 'Creating vote failed!'
        })
      });
      }
  })
});

router.put("/:id",checkAuth,multer({storage: storage}).single("image"), (req,res,next) =>{
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    date: Date.now(),
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId},post).then(result =>{
    if(result.nModified > 0){
      res.status(200).json({message: "Update successful!"});
    }else{
      res.status(401).json({message: "Not authorized!"});
    }
  }).catch(error =>{
    res.status(500).json({
      message: "Couldn't update post"
    });
  });
});

router.get("/:id", (req,res,next) =>{
  Post.findById(req.params.id).then(post =>{
    if(post){
      res.status(200).json(post);
    }else{
      res.status(404).json({message: 'Post not found!'});
    }
  }).catch(error =>{
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  });
});

router.get('',(req,res,next)=>{
  const pageSize= +req.query.pagesize;
  const curentPage = +req.query.page;
  const userId = req.query.userId;

  //console.log(userId);
  const postQuery = Post.find({}).sort({date:-1});
  let fetchedPosts;
  if(pageSize && curentPage)
  {
    postQuery
    .skip(pageSize * (curentPage - 1))
    .limit(pageSize);
  }
  postQuery.then(documents =>{
    fetchedPosts = documents;
    //console.log(fetchedPosts[0].voted);
    return Post.countDocuments();
  }).then(count =>{
    res.status(200).json({
      message:"Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  }).catch(error =>{
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  });
});

router.delete("/:id",checkAuth,(req,res,next)=>{
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result =>{
    if(result.n> 0){

      User.findOne({_id: req.userData.userId}, function(err, user){
        if(user){
          user.numPosts = user.numPosts - 1;
          user.save();
        }
      })
      res.status(200).json({message: "Deletion successful!"});
    }else{
      res.status(401).json({message: "Not authorized!"});
    }
  }).catch(error =>{
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  });
});


router.get("/user/:id",checkAuth, (req,res,next)=>{
  User.findById(req.params.id).then(user =>{
    if(user){
      res.status(200).json({
        email: user.email,
        numVotes: user.numVotes,
        numPosts: user.numPosts
      });
    }else
    {
      res.status(404).json({message:'User not found'});
    }
  })
})

module.exports = router;
