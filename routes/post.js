const post = require("../models/Post");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { findOneAndDelete } = require("../models/Post");
const ObjectId = mongoose.Types.ObjectId;
const comment = require("../models/Comment");

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newpost = new post({
      postedBy: req.user.id,
      userType: req.user.type,
      content: req.body.content,
    });
    newpost
      .save()
      .then((entry) => {
        if (entry) res.json(entry).status(200);
        res.json({ error: "post was not created" }).status(401);
      })
      .catch((error) => {
        res.json(error).status(451);
      });
    //res.json({ msg: "add post works", user: req.user });
  }
);

//view all post
router.get(
  "/myposts",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user);
    post
      .find({ postedBy: ObjectId(req.user.id) })
      .then((mypost) => {
        res.json({ mypost });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// Add comment
router.put(
  "/comment",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newComment = new comment({
      body: req.body.content,
      postedBy: req.user.id,
      userType: req.user.type,
    });
    newComment
      .save()
      .then((result) => {
        console.log(result);
        post
          .findByIdAndUpdate(
            req.body.postId,
            {
              $push: { comments: newComment },
            },
            {
              new: true,
            }
          )
          .exec((err, result) => {
            if (err) {
              console.log(err);
              return res.status(422).json({ error: err });
            } else {
              res.json(result);
            }
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(422).json({ error: err });
      });
  }
);

router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    post.find();
  }
);

module.exports = router;