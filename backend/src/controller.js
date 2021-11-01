const ethers = require("ethers");
const { NotFound } = require("http-errors");
const createHttpError = require("http-errors");
const { Store } = require("./store");
const { UnprocessableEntity, InternalServerError, Unauthorized } =
  createHttpError;

class Controller {
  static async postUser(userOptions) {
    if (!userOptions || !userOptions.email || !userOptions.password) {
      throw new UnprocessableEntity("Invalid data format");
    }

    let existingUser;

    try {
      existingUser = await Store.getUserByEmail(userOptions.email);
    } catch (_) {
      throw new InternalServerError();
    }

    let privateKey;

    if (!existingUser) {
      if (!userOptions.name) {
        throw new UnprocessableEntity("New accounts must give a 'name' field");
      }

      const passwordSha256 = ethers.utils
        .sha256(ethers.utils.toUtf8Bytes(userOptions.password))
        .slice(2);

      privateKey = new ethers.Wallet.createRandom().privateKey.slice(2);

      await Store.createUser({
        email: userOptions.email,
        passwordSha256: passwordSha256,
        name: userOptions.name,
        privateKey: privateKey,
      });
    } else {
      const givenHash = ethers.utils
        .sha256(ethers.utils.toUtf8Bytes(userOptions.password))
        .slice(2);
      const storedHash = existingUser.passwordSha256;

      if (givenHash !== storedHash) {
        throw new Unauthorized("The given password was incorrect");
      }

      privateKey = existingUser.privateKey;
    }

    const publicKey = new ethers.Wallet("0x" + privateKey).publicKey.slice(2);
    const emailBase64 = ethers.utils.base64.encode(
      ethers.utils.toUtf8Bytes(userOptions.email)
    );

    return {
      id: emailBase64,
      email: existingUser?.email || userOptions.email,
      name: existingUser?.name || userOptions.name,
      publicKey: publicKey,
      privateKey: privateKey,
    };
  }

  static async postFriend(fromEmail, toEmail) {
    const user = await Store.getUserByEmail(fromEmail);

    if (!user) {
      throw new NotFound("Cannot POST friend to user that cannot be found");
    }

    if (fromEmail === toEmail) {
      throw new UnprocessableEntity("Cannot be friends with oneself");
    }

    const friend = await Store.getUserByEmail(toEmail);

    if (!friend) {
      throw new NotFound("A friend with that email could not be found");
    }

    const friendship = await Store.addFriend(fromEmail, toEmail);

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

  static async getFriends(userEmail) {
    const user = await Store.getUserByEmail(userEmail);

    if (!user) {
      throw new NotFound("A user with that email could not be found");
    }

    return await Store.getFriendsOfUser(userEmail);
  }
}

module.exports = { Controller };
