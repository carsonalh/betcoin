const connection = require("./database");
const ethers = require("ethers");
const Schema = require("./schema");

/**
 * Wrapper class for data storage.
 */
class Store {
  /**
   * @param email The email of the user to get
   * @returns The user that has the given email
   */
  static async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      connection.query(
        `
        SELECT * FROM users WHERE users.email = ?
        `,
        [email],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            // Because of the uniqueness of the "email" property, there will
            // either be 0 or 1 rows returned by "query"
            if (results.length === 0) {
              resolve(null);
            } else if (results.length === 1) {
              resolve(results[0]);
            } else {
              reject(
                new Error(
                  "THIS SHOULD NEVER EVER BE THROWN; YOUR DATABASE IS LIKELY MISCONFIGURED"
                )
              );
            }
          }
        }
      );
    });
  }

  /**
   * @param user The properties with which to create the user
   * @throws If there was a connection error, or if the user already exists.
   */
  static async createUser(user) {
    try {
      user = await Schema.StoredUser.validate(user);
    } catch (e) {
      throw new TypeError("User does not have required shape");
    }

    return new Promise((resolve, reject) => {
      connection.query(
        `
        INSERT INTO users VALUES (?, ?, ?, ?);
        `,
        [user.email, user.name, user.passwordSha256, user.privateKey],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * @param {*} fromEmail The email sending the friend request
   * @param {*} toEmail The user receiving the friend request
   * @returns An object with the from email, to email, and "pending" property,
   *          which indicates if the friendship is pending. This is only false
   *          if there was already a reverse friendship.
   */
  static async addFriend(fromEmail, toEmail) {
    return new Promise((resolve, reject) => {
      connection.query(
        `
        INSERT IGNORE INTO friends (fromEmail, toEmail) VALUES (?, ?);
        SELECT COUNT(*) < 1 AS \`pending\`
          FROM friends
          WHERE toEmail = ? AND fromEmail = ?;
        `,
        [fromEmail, toEmail, fromEmail, toEmail],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            // Will ignore the result of the "INSERT" statement
            const { pending } = results[1][0];

            resolve({
              from: fromEmail,
              to: toEmail,
              pending: !!pending,
            });
          }
        }
      );
    });
  }

  static async getFriendsOfUser(userEmail) {
    return new Promise((resolve, reject) => {
      connection.query(
        `
        (
          SELECT email, name, privateKey, FALSE AS pending FROM users
          WHERE
          email IN
          (
            SELECT toEmail AS email FROM friends WHERE fromEmail = ?
            INTERSECT
            SELECT fromEmail AS email FROM friends WHERE toEmail = ?
          )
        )
        UNION
        (
          SELECT email, name, privateKey, TRUE AS pending FROM users
          WHERE
          email IN
          (
            SELECT toEmail AS email FROM friends X
            WHERE
                fromEmail = ?
              AND
                NOT EXISTS(
                  SELECT * FROM friends WHERE fromEmail = X.toEmail AND toEmail = X.fromEmail
                )
          )
        )
        `,
        [userEmail, userEmail, userEmail, userEmail],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              results.map((r) => {
                const wallet = new ethers.Wallet("0x" + r.privateKey);
                const publicKey = wallet.publicKey.slice(2);
                return {
                  email: r.email,
                  name: r.name,
                  pending: !!r.pending,
                  publicKey: publicKey,
                };
              })
            );
          }
        }
      );
    });
  }
}

module.exports = { Store };
