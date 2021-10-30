const connection = require("./database");

/**
 * Wrapper class for data storage.
 */
class Store {
  /**
   * @param {string} email The email of the user to get
   * @returns The user that has the given email
   */
  static async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users WHERE users.email = ?",
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
   * @param {object} user The properties with which to create the user
   * @throws If there was a connection error, or if the user already exists.
   */
  static async createUser(user) {
    // TODO: Make some cleaner validation with yup or something
    if (!user) {
      return Promise.reject(new TypeError("User must be an object"));
    }

    if (typeof user.email !== "string") {
      return Promise.reject(new TypeError("A property from user is missing"));
    }

    if (typeof user.name !== "string") {
      return Promise.reject(new TypeError("A property from user is missing"));
    }

    if (typeof user.privateKey !== "string") {
      return Promise.reject(new TypeError("A property from user is missing"));
    }

    if (typeof user.passwordHash !== "string") {
      return Promise.reject(new TypeError("A property from user is missing"));
    }

    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO users VALUES (?, ?, ?, ?);`,
        [user.email, user.name, user.passwordHash, user.privateKey],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(123);
          }
        }
      );
    });
  }

  static async addFriend(fromEmail, toEmail) {
    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT IGNORE INTO friends (fromEmail, toEmail) VALUES (?, ?);
SELECT COUNT(*) < 1 AS \`pending\` FROM friends WHERE toEmail = ? AND fromEmail = ?;
`,
        // SELECT NOT (COUNT(*) >= 1) AS \`pending\` FROM (SELECT * FROM friends WHERE toEmail = ? AND fromEmail = ?);`,
        [fromEmail, toEmail, fromEmail, toEmail],
        (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            // Will ignore the result of the "INSERT" statement
            const { pending } = results[1];

            resolve({
              from: fromEmail,
              to: toEmail,
              pending,
            });
          }
        }
      );
    });
  }
}

module.exports = { Store };
