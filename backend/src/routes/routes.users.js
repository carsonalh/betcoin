const Router = require("@koa/router");
const { HttpError } = require("http-errors");

const authorizationMiddleware = require("../middleware/middleware.authorization");
const { Controller } = require("../controller");
const Schema = require("../schema");

const router = new Router();

router.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      ctx.status = e.statusCode;
      ctx.body = {
        message: e.message,
      };
    } else {
      console.error(e);
      ctx.status = 500;
      ctx.body = {
        message: "Internal server error",
      };
    }
  }
});

router.post("/", async (ctx, next) => {
  const response = await Controller.postUser(ctx.request.body);
  ctx.body = Schema.UserResponse.cast(response);
});

router.post("/:userId/friends", authorizationMiddleware, async (ctx, next) => {
  const friend = await Controller.postFriend(
    ctx.auth.userId,
    ctx.params.userId,
    ctx.request.body
  );
  ctx.body = Schema.FriendResponse.cast({ friend });
});

router.get("/:userId/friends", authorizationMiddleware, async (ctx, next) => {
  const friends = await Controller.getFriends(ctx.params.userId);
  ctx.body = Schema.FriendsResponse.cast({ friends });
});

module.exports = router;
