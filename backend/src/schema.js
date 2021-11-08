const yup = require("yup");

const Schema = {};

/**
 * A "friend" entity
 */
Schema.Friend = yup.object().shape({
  email: yup.string().required(),
  name: yup.string().required(),
  pending: yup.boolean().required(),
  publicKey: yup.string().required(),
});

/**
 * A "user" entity
 */
Schema.User = yup.object().shape({
  id: yup.string().required(),
  email: yup.string().required(),
  name: yup.string().required(),
  publicKey: yup.string().required(),
  privateKey: yup.string().length(64).required(),
});

/**
 * A "user" entity as it is stored in the database. This is the version of the
 * user with the least amount of duplicate data.
 */
Schema.StoredUser = yup.object().shape({
  email: yup.string().required(),
  name: yup.string().required(),
  passwordSha256: yup.string().length(64).required(),
  privateKey: yup.string().length(64).required(),
});

/**
 * Schema for the request to the `POST /users` route.
 */
Schema.UserRequest = yup.object().shape({
  user: yup.object().shape({
    email: yup.string().max(320).required(),
    password: yup.string().required(),
    name: yup.string(),
  }),
});

/**
 * Schema for the response to the `POST /users` route.
 */
Schema.UserResponse = yup.object().shape({
  user: Schema.User,
  token: yup.string().required(),
});

/**
 * Schema for the request to the `POST /users/:id/friends`.
 */
Schema.FriendRequest = yup.object().shape({
  friend: yup.object().shape({
    email: yup.string().required(),
  }),
});

/**
 * Schema for the response to the `POST /users/:id/friends`.
 */
Schema.FriendResponse = yup.object().shape({
  friend: Schema.Friend,
});

/**
 * Schema for the response to the `GET /users/:id/friends`.
 */
Schema.FriendsResponse = yup.object().shape({
  friends: yup.array().of(Schema.Friend),
});

module.exports = Schema;
