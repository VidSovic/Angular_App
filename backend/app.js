const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const commentRoutes = require('./routes/comments');
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/images", express.static(path.join("backend/images")));

const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://vid:Lodd_123@cluster0-zpx4z.mongodb.net/vaja4?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology:true }).then(() =>{
  console.log('Connected to the database!');
}).catch(()=>{
  console.log('Connection failed!');
});


app.use((req,res,next) =>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, PUT ,DELETE, OPTIONS");
  next();
});


app.use("/api/posts",postRoutes);
app.use("/api/user",userRoutes);
app.use("/api/comment", commentRoutes);
module.exports = app;
