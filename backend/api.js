const app = require('express').Router();
const connection = require('./database');
const ethers = require('ethers');

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

app.post('/users', (req, res) => {
    const { user } = req.body;
    const passwordHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(user.password)).slice(2);
    const name = user.name || 'Anonymous';
    const id = ethers.utils.base64.encode(ethers.utils.toUtf8Bytes(user.email));
    connection.query(
        'SELECT * FROM users WHERE users.email = ?',
        [user.email],
        (err, results, fields) => {
            if (!err) {
                if (results.length) {
                    const row = results[0];
                    const { passwordSha256, privateKey } = row;
                    if (passwordHash !== passwordSha256) {
                        res.status(403).json({ message: 'FAILED' });
                    } else {
                        const wallet = new ethers.Wallet('0x' + privateKey);
                        const publicKey = wallet.publicKey.slice(2);
                        res
                            .status(200)
                            .json({
                                user: {
                                    id,
                                    email: user.email,
                                    name,
                                    publicKey,
                                    privateKey
                                }
                            });
                    }
                } else {
                    const wallet = ethers.Wallet.createRandom();
                    const privateKey = wallet.privateKey.slice(2);
                    const publicKey = wallet.publicKey.slice(2);
                    connection.query(
                        `INSERT INTO users VALUES (?, ?, ?, ?);`,
                        [user.email, name, passwordHash, privateKey],
                        (err, results, fields) => {
                            // Put the response here...
                            if (!err) {
                                res
                                    .status(200)
                                    .json({
                                        user: {
                                            id,
                                            email: user.email,
                                            name,
                                            publicKey,
                                            privateKey
                                        }
                                    })
                            } else {
                                res.status(500).json({ message: 'FAILED' });
                            }
                        }
                    );
                }
            } else {
                res.status(500).json({ message: 'FAILED' });
            }
        }
    );
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
            pending: boolean
        }
    }
 */
app.post('/users/:userId/friends', (req, res) => {
    const email = ethers.utils.toUtf8String(ethers.utils.base64.decode(req.params.userId));
    const { friend } = req.body;

    if (email === friend.email) {
        res
            .status(300)
            .json({
                message: 'Cannot be friends with oneself'
            });
    }

    console.log('FRIEND REQUEST', email, friend.email);

    // Add the friendship if it does not exist
    connection.query(
        'INSERT INTO friends VALUES (?, ?);',
        [email, friend.email],
        (err, results, fields) => {
            if (!err || (err && err.code === 'ER_DUP_ENTRY')) {
                // Check if the reverse relationship exists
                connection.query(
                    `SELECT users.name as \`friendName\`, friends.fromEmail, friends.toEmail
                    FROM friends
                        JOIN users ON users.email = friends.fromEmail
                    WHERE fromEmail = ? AND toEmail = ?`,
                    [friend.email, email],
                    (err, results, fields) => {
                        if (!err) {
                            if (results.length) {
                                // Accepting a friend request
                                const row = results[0];
                                res
                                    .status(200)
                                    .json({
                                        friend: {
                                            email: friend.email,
                                            name: row.friendName,
                                            pending: false
                                        }
                                    });
                            } else {
                                // Making a friend request
                                connection.query(
                                    `SELECT users.name AS \`friendName\` FROM users WHERE users.email = ?`,
                                    [friend.email],
                                    (err, results, fields) => {
                                        if (!err) {
                                            if (results.length) {
                                                // The friend actually exists
                                                const row = results[0];
                                                res
                                                    .status(200)
                                                    .json({
                                                        friend: {
                                                            email: friend.email,
                                                            name: row.friendName,
                                                            pending: true
                                                        }
                                                    });
                                            } else {
                                                // They don't
                                                res
                                                    .status(300)
                                                    .json({
                                                        message: 'The friend does not exist'
                                                    });
                                            }
                                        } else {
                                            res
                                                .status(500)
                                                .json({
                                                    message: 'Database error'
                                                });
                                        }
                                    }
                                );
                            }
                        } else {
                            res
                                .status(500)
                                .json({
                                    message: 'Database error'
                                });
                        }
                    }
                );
            } else {
                res
                    .status(500)
                    .json({
                        message: 'Database error'
                    });
            }
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
            pending: boolean
        }]
    }
 */
app.get('/users/:userId/friends', (req, res) => {
    res
        .status(200)
        .json({
            friends: [
                {
                    email: 'test@example.com',
                    name: 'Test User',
                    pending: false
                },
                {
                    email: 'example@example.com',
                    name: 'Example User',
                    pending: true
                },
                {
                    email: 'carson@example.com',
                    name: 'Carson',
                    pending: true
                },
                {
                    email: 'will@example.com',
                    name: 'Will',
                    pending: false
                },
                {
                    email: 'isaac@example.com',
                    name: 'Isaac',
                    pending: false
                }
            ]
        });
});

module.exports = app;
