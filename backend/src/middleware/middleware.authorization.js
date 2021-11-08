const { BadRequest } = require("http-errors");
const jwt = require("jsonwebtoken");
const env = require("../env");

const authorizationMiddleware = async (ctx, next) => {
  const token = ctx.request.query.token;

  // There's probably a nicer overload of `jwt.verify`, but this _does_ work at
  // the moment
  const verification = new Promise((resolve, reject) =>
    jwt.verify(token, env.JWT_SECRET, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    })
  );

  let tokenInfo;

  try {
    tokenInfo = await verification;
  } catch (e) {
    throw new BadRequest("The given token was invalid");
  }

  ctx.auth = tokenInfo;

  await next();

  delete ctx.auth;

  ctx.body.token = jwt.sign(
    {
      userId: tokenInfo.userId,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_TOKEN_EXPIRY,
    }
  );
};

module.exports = authorizationMiddleware;
