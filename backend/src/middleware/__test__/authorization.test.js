const sinon = require("sinon");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const env = require("../../env");
const authorizationMiddleware = require("../middleware.authorization");

before(() => {
  env.JWT_SECRET = "SECRET";
});

describe("Authorization Middleware", () => {
  let ctx, next;

  beforeEach(() => {
    ctx = {
      body: {},
      request: {
        params: {},
        body: {},
        query: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBQkMxMjMiLCJpYXQiOjE2MzYzMzY2NzJ9.yasyDOlpdvkr_g2atX1qHj-JNKUGy04vEdsYO-I9_-o",
        },
      },
    };

    next = sinon.spy(async () => {});
  });

  afterEach(() => {
    sinon.restore();
  });

  it("strips the provided options from the ctx object", async () => {
    await authorizationMiddleware(ctx, async () => null);

    assert(!ctx.hasOwnProperty("requireAuthorization"));
  });

  it("sends a token if it is enabled for the route", async () => {
    const token = Symbol();
    sinon.stub(jwt, "sign").returns(token);

    await authorizationMiddleware(ctx, next);

    assert.strictEqual(ctx.body.token, token);
  });

  it("verifies the token given in the request query", async () => {
    // With a valid token, there should be no error
    await authorizationMiddleware(ctx, next);

    ctx.request.query.token = "definitely not a token";

    await assert.rejects(
      authorizationMiddleware(ctx, next),
      (e) => e.statusCode === 400
    );
  });

  it("sets the auth token on the context and removes it afterwards", async () => {
    sinon
      .stub(jwt, "verify")
      .callsArgWith(2, null, { userId: "amFuZS5kb2VAZXhhbXBsZS5jb20=" });

    await authorizationMiddleware(ctx, async () => {
      assert.deepEqual(ctx.auth, { userId: "amFuZS5kb2VAZXhhbXBsZS5jb20=" });
    });

    assert(!ctx.hasOwnProperty("auth"));
  });
});
