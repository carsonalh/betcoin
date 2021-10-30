const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "will",
  password: "will",
  database: "hackathon",
  multipleStatements: true,
});

module.exports = connection;

// connection.query(
//     'SELECT * FROM users',
//     function(err, results, fields) {
// 	console.log(results);
// 	console.log(fields);
//     }
// );

/*
Initial thoughts on constructing SQL queries.
--------------------------------------------
Create user:
We are given email, name, and password.

emailBase64 = ethers.utils.base64.encode(email)
wallet = ethers.Wallet.createRandom()
privateKey = wallet.privateKey
publicKey = wallet.publicKey
passwordHash = ethers.utils.sha256(password)

'INSERT INTO users VALUES (?, ?, ?, ?)',
[email, name, passwordHash, privateKey],

Respond with
user: {
  id: emailBase64,
  email: email,
  name: name,
  publicKey: publicKey,
  privateKey: privateKey
}
--------------------------------------------
Make friend:
We are given toEmail and fromEmail (I don't understand how, help me Carson).

'INSERT INTO friends VALUES (?, ?)',
[toEmail, fromEmail]

We also have to determine if the request is "pending".
Maybe this?

SELECT fromEmail FROM friends WHERE EXISTS
(SELECT toEmail FROM friends WHERE fromEmail = toEmail);

If this request returns no records, the request is pending.
*/
