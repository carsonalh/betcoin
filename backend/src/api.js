const app = require("express").Router();
const ethers = require("ethers");
const createHttpError = require("http-errors");
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

/*
    Used to create a new user and get user data. If the user already exists,
    then this route should just get that data and return what is necessary back
    to the frontend.

    POST /users

    // Request
    {
        user: {
            email: string,
            // If the user doesn't exist, this is required
            name?: string,
            password: string
        }
    }

    // Response
    {
        user: {
            id: string, // This will be base64 of the email
            email: string,
            name: string,
            publicKey: string, // Hex digest
            privateKey: string, // Hex digest
        }
    }
*/

app.post("/users", (req, res, next) => {
  Controller.postUser(req.body.user)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch(catchHttpError(req, res, next));
});

/*
    Used to create and accept friend request. Cannot be denied (only pending).

    POST /users/:userId/friends

    // Request
    {
        friend: {
            email: string
        }
    }

    // Response
    {
        friend: {
            email: string,
            name: string,
            pending: boolean,
	    publicKey: string
        }
    }
*/

app.post("/users/:userId/friends", (req, res, next) => {
  // TODO: Abstract this validation/casting
  const email = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );

  // TODO: Validate the body; for now an exception right here is the best move
  Controller.postFriend(email, req.body.friend.email)
    .then((friend) => {
      res.status(200).json({ friend });
    })
    .catch(catchHttpError(req, res, next));
});

/*
    No query data is required here, as :userId is all that is needed to get
    their list of friends.

    GET /users/:userId/friends

    // Request
    {
    }

    // Response
    {
        friends: [{
            email: string,
            name: string,
            pending: boolean,
	    publicKey: string
        }]
    }
 */
app.get("/users/:userId/friends", (req, res, next) => {
  const userEmail = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );

  Controller.getFriends(userEmail)
    .then((friends) => {
      res.status(200).json({ friends });
    })
    .catch(catchHttpError(req, res, next));
});

module.exports = app;
