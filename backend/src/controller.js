const ethers = require("ethers");
const { NotFound, InternalServerError, BadRequest } = require("http-errors");
const createHttpError = require("http-errors");
const Schema = require("./schema");
const { Store } = require("./store");
const { UnprocessableEntity, Unauthorized } = createHttpError;

class Controller {
  static _isValidBase64(base64String) {
    const reEncoded = ethers.utils.base64.encode(
      ethers.utils.base64.decode(base64String)
    );

    return reEncoded === base64String;
  }

  static async postUser(request) {
    try {
      request = await Schema.UserRequest.validate(request);
    } catch (e) {
      throw new UnprocessableEntity("Invalid request format");
    }

    const { user } = request;

    const existingUser = await Store.getUserByEmail(user.email);

    let privateKey;

    if (!existingUser) {
      if (!user.name) {
        throw new UnprocessableEntity("New accounts must give a 'name' field");
      }

      const passwordSha256 = ethers.utils
        .sha256(ethers.utils.toUtf8Bytes(user.password))
        .slice(2);

      privateKey = new ethers.Wallet.createRandom().privateKey.slice(2);

      await Store.createUser({
        email: user.email,
        passwordSha256: passwordSha256,
        name: user.name,
        privateKey: privateKey,
      });
    } else {
      const givenHash = ethers.utils
        .sha256(ethers.utils.toUtf8Bytes(user.password))
        .slice(2);
      const storedHash = existingUser.passwordSha256;

      if (givenHash !== storedHash) {
        throw new Unauthorized("The given password was incorrect");
      }

      privateKey = existingUser.privateKey;
    }

    const publicKey = new ethers.Wallet("0x" + privateKey).publicKey.slice(2);
    const emailBase64 = ethers.utils.base64.encode(
      ethers.utils.toUtf8Bytes(user.email)
    );

    return {
      id: emailBase64,
      email: existingUser?.email || user.email,
      name: existingUser?.name || user.name,
      publicKey: publicKey,
      privateKey: privateKey,
    };
  }

  static async postFriend(userId, request) {
    let userEmail;

    if (!Controller._isValidBase64(userId)) {
      throw new BadRequest("The user id was invalid");
    }

    userEmail = ethers.utils.toUtf8String(ethers.utils.base64.decode(userId));

    try {
      request = await Schema.FriendRequest.validate(request);
    } catch (e) {
      throw new UnprocessableEntity("Invalid request format");
    }

    const user = await Store.getUserByEmail(userEmail);

    if (!user) {
      throw new NotFound("Cannot POST friend to user that cannot be found");
    }

    const friendEmail = request.friend.email;

    if (userEmail === friendEmail) {
      throw new UnprocessableEntity("Cannot be friends with oneself");
    }

    const friend = await Store.getUserByEmail(friendEmail);

    if (!friend) {
      throw new NotFound("A friend with that email could not be found");
    }

    const friendship = await Store.addFriend(userEmail, friendEmail);

    const friendPublicKey = new ethers.Wallet(
      "0x" + friend.privateKey
    ).publicKey.slice(2);

    return {
      email: friend.email,
      name: friend.name,
      pending: friendship.pending,
      publicKey: friendPublicKey,
    };
  }

  static async getFriends(userId) {
    if (!Controller._isValidBase64(userId)) {
      throw new BadRequest("The user id was invalid");
    }

    const userEmail = ethers.utils.toUtf8String(
      ethers.utils.base64.decode(userId)
    );

    const user = await Store.getUserByEmail(userEmail);

    if (!user) {
      throw new NotFound("A user with that email could not be found");
    }

    return await Store.getFriendsOfUser(userEmail);
  }
}

module.exports = { Controller };
