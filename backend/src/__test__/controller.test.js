const sinon = require("sinon");
const assert = require("assert");
const { isHttpError } = require("http-errors");

const { Store } = require("../store");
const { Controller } = require("../controller");

describe("Controller", () => {
  describe("postUser", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if an email and a password are not given", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => {
        return null;
      });

      await assert.rejects(Controller.postUser());

      await assert.rejects(
        Controller.postUser({
          email: "john.doe@example.com",
        })
      );

      await assert.rejects(
        Controller.postUser({
          password: "password",
        })
      );
    });

    it("requires a name if the user does not exist", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => {
        return null;
      });

      await assert.rejects(
        Controller.postUser({
          email: "john.doe@example.com",
          password: "password",
        })
      );
    });

    it("does not throw if a name is not given but user exists", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => ({
        id: "am9obi5kb2VAZXhhbXBsZS5jb20=",
        email: "john.doe@example.com",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
      }));

      await Controller.postUser({
        email: "john.doe@example.com",
        password: "password",
      });
    });

    it('throws an "internal" error if `Store.getUserByEmail` does', async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => {
        throw "do not propagate";
      });

      try {
        await Controller.postUser({
          email: "john.doe@example.com",
          password: "password",
        });
        assert.fail();
      } catch (e) {
        // TODO: Add assert `isHttpError(e)` (throws TypeError for some reason
        // when I try it)
        assert.strictEqual(e.statusCode, 500);
      }
    });

    it("returns the public-facing user if `Store.getUserByEmail` returns something", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => ({
        email: "john.doe@example.com",
        name: "John",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
      }));

      assert.deepEqual(
        await Controller.postUser({
          email: "john.doe@example.com",
          password: "password",
        }),
        {
          id: "am9obi5kb2VAZXhhbXBsZS5jb20=",
          email: "john.doe@example.com",
          name: "John",
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
          privateKey:
            "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
        }
      );
    });

    it("attempts to create a user if no user exists", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async () => null);
      const createUserStub = sinon
        .stub(Store, "createUser")
        .callsFake(async () => {});

      await Controller.postUser({
        email: "john.doe@example.com",
        name: "John",
        password: "password",
      });

      assert(createUserStub.calledOnce);
    });

    it("rejects with 401 unauthorized if an incorrect password is given for existing user", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => ({
        email: "john.doe@example.com",
        name: "John",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
      }));

      try {
        await Controller.postUser({
          email: "john.doe@example.com",
          name: "John",
          password: "password1",
        });
        assert.fail();
      } catch (e) {
        assert.strictEqual(e.statusCode, 401);
      }
    });
  });
});
