const app = require("express").Router();
const connection = require("./database");
const ethers = require("ethers");
const { Store } = require("./store");
const { Controller } = require("./controller");

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

app.post("/users", (req, res) => {
  Controller.postUser(req.body.user)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => {
      if (typeof err.statusCode === "number") {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    });
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

app.post("/users/:userId/friends", (req, res) => {
  const email = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );
  const { friend: requestedFriend } = req.body;

  if (email === requestedFriend.email) {
    res.status(300).json({
      message: "Cannot be friends with oneself",
    });
  }

  console.log("FRIEND REQUEST", email, requestedFriend.email);
  let friend;
  Store.getUserByEmail(requestedFriend.email)
    .then(
      (returnedFriend) => {
        friend = returnedFriend;
        if (!friend) {
          res
            .status(400)
            .json({ message: "User with that email could not be found" });
          return;
        } else {
          // Add the friendship if it does not exist
          return Store.addFriend(email, friend.email);
        }
      },
      () => res.status(500).json({ message: "FAILED" })
    )
    .then(
      (friendship) => {
        const wallet = new ethers.Wallet("0x" + friend.privateKey);
        const publicKey = wallet.publicKey.slice(2);

        res.status(200).json({
          friend: {
            email: friend.email,
            name: friend.name,
            pending: friendship.pending,
            publicKey,
          },
        });
      },
      (err) => {
        console.error(err);
        res.status(500).json({ message: "FAILED MAKING THE FRIENDSHIP" });
      }
    );
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
app.get("/users/:userId/friends", (req, res) => {
  const email = ethers.utils.toUtf8String(
    ethers.utils.base64.decode(req.params.userId)
  );

  Store.getFriendsOfUser(email)
    .then((friends) => {
      res.status(200).json({ friends });
    })
    .catch((err) => res.status(500).json({ message: "FAILED" }));
});

module.exports = app;
