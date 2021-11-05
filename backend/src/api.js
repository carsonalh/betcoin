const app = require("express").Router();
const ethers = require("ethers");
const createHttpError = require("http-errors");

const Schema = require("./schema");
const { Controller } = require("./controller");

const { HttpError } = createHttpError;

const catchHttpError = (req, res, next) => (err) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

app.post("/users", (req, res, next) => {
  Controller.postUser(req.body)
    .then((user) => {
      const response = Schema.UserResponse.cast({ user });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

app.post("/users/:userId/friends", (req, res, next) => {
  Controller.postFriend(req.params.userId, req.body)
    .then((friend) => {
      const response = Schema.FriendResponse.cast({ friend });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

app.get("/users/:userId/friends", (req, res, next) => {
  Controller.getFriends(req.params.userId)
    .then((friends) => {
      const response = Schema.FriendsResponse.cast({ friends });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

module.exports = app;
