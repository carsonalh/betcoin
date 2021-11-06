const Router = require("@koa/router");
const { HttpError } = require("http-errors");

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
      ctx.status = 500;
      ctx.body = {
        message: "Internal server error",
      };
    }
  }
});

router.post("/", async (ctx, next) => {
  const user = await Controller.postUser(ctx.request.body);
  ctx.body = Schema.UserResponse.cast({ user });
});

router.post("/:userId/friends", async (ctx, next) => {
  const friend = await Controller.postFriend(
    ctx.params.userId,
    ctx.request.body
  );
  ctx.body = Schema.FriendResponse.cast({ friend });
});

router.get("/:userId/friends", async (ctx, next) => {
  const friends = await Controller.getFriends(ctx.params.userId);
  ctx.body = Schema.FriendsResponse.cast({ friends });
});

module.exports = router;
