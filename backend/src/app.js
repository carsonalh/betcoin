require("dotenv").config();

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const usersRouter = require("./routes/routes.users");

const app = new Koa();

usersRouter.prefix("/api/users");

app.use(bodyParser());
app.use(usersRouter.routes());
app.use(usersRouter.allowedMethods());
app.use(async (ctx, next) => {
  ctx.status = 404;
  ctx.body = { message: "The requested route could not be found" };
});

app.listen(5000, () => console.log("Started the server"));
