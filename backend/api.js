const app = require('express').Router();

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
    const body = req.body;
    res
        .status(200)
        .json({
            user: {
                id: 'dGVzdEBleGFtcGxlLmNvbQ==',
                email: 'test@example.com',
                name: 'Test User',
                publicKey: 'FAKE_PUB_KEY',
                privateKey: 'FAKE_PRIV_KEY'
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
            pending: boolean
        }
    }
 */
app.post('/users/:userId/friends', (req, res) => {
    req.params.userId
    res
        .status(200)
        .json({
            friend: {
                email: 'example@example.com',
                name: 'Example User',
                pending: true
            }
        });
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
