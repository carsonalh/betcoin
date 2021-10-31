const ethers = require("ethers");
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
}

module.exports = { Controller };
