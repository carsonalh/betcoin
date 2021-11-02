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
  Controller.postUser(req.body.user)
    .then((user) => {
      const response = Schema.UserResponse.cast({ user });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

app.post("/users/:userId/friends", (req, res, next) => {
  // TODO: Abstract this validation/casting
  const email = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );

  const body = Schema.FriendRequest.cast(req.body);

  Controller.postFriend(email, body.friend.email)
    .then((friend) => {
      const response = Schema.FriendResponse.cast({ friend });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

app.get("/users/:userId/friends", (req, res, next) => {
  // TODO: Find a way to verify this

  const userEmail = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );

  Controller.getFriends(userEmail)
    .then((friends) => {
      const response = Schema.FriendsResponse.cast({ friends });
      res.status(200).json(response);
    })
    .catch(catchHttpError(req, res, next));
});

module.exports = app;
