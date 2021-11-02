const sinon = require("sinon");
const assert = require("assert");
const mock = require("mock-require");

mock("../database", {
  query: () => {
    throw new Error("Check that all database functions are mocked");
  },
});

const { Store } = require("../store");
const { Controller } = require("../controller");

after(() => {
  mock.stop("../database");
});

describe("Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("postUser", () => {
    beforeEach(() => {
      sinon.stub(Store, "createUser").callsFake(async () => {});
    });

    it("rejects with 422 if the body is not formatted correctly", async () => {
      const inputs = [
        {},
        { user: { email: "john.doe@example.com" } },
        { user: { password: "password" } },
        { notUser: { password: "password" } },
        undefined,
      ];

      for (const x of inputs) {
        try {
          await Controller.postUser(x);
          assert.fail();
        } catch (e) {
          assert.strictEqual(e.statusCode, 422);
        }
      }
    });

    it("requires a name if the user does not exist", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => {
        return null;
      });

      await assert.rejects(
        Controller.postUser({
          user: { email: "john.doe@example.com", password: "password" },
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
        user: { email: "john.doe@example.com", password: "password" },
      });
    });

    it("propagates any error `Store.getUserByEmail` throws", async () => {
      sinon.stub(Store, "getUserByEmail").callsFake(async (email) => {
        throw "do not propagate";
      });

      await assert.rejects(
        Controller.postUser({
          user: { email: "john.doe@example.com", password: "password" },
        })
      );
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
          user: { email: "john.doe@example.com", password: "password" },
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
      sinon.restore();

      const createUserStub = sinon
        .stub(Store, "createUser")
        .callsFake(async () => {});

      sinon.stub(Store, "getUserByEmail").callsFake(async () => null);

      await Controller.postUser({
        user: {
          email: "john.doe@example.com",
          name: "John",
          password: "password",
        },
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
          user: {
            email: "john.doe@example.com",
            name: "John",
            password: "password1",
          },
        });
        assert.fail();
      } catch (e) {
        assert.strictEqual(e.statusCode, 401);
      }
    });
  });

  describe("postFriend", () => {
    it("rejects with 422 if the request is malformatted", async () => {
      const getUserStub = sinon.stub(Store, "getUserByEmail");

      const inputs = [
        {},
        { friend: {} },
        { friend: { notEmail: "john@example.com" } },
        undefined,
      ];

      for (const x of inputs) {
        try {
          await Controller.postFriend("john.doe@example.com", x);
          assert.fail();
        } catch (e) {
          assert.strictEqual(e.statusCode, 422);
          assert(!getUserStub.called);
        }
      }
    });

    it("rejects with 404 if the user themself does not exist", async () => {
      const getUserStub = sinon.stub(Store, "getUserByEmail").resolves(null);

      try {
        await Controller.postFriend("john@example.com", {
          friend: { email: "alan@example.com" },
        });
        assert.fail();
      } catch (e) {
        assert(getUserStub.calledOnce);
        assert(getUserStub.calledWith("john@example.com"));
        assert.strictEqual(e.statusCode, 404);
      }
    });

    it("does not allow user to be friends with oneself", async () => {
      sinon.stub(Store, "getUserByEmail").resolves({
        email: "john.doe@example.com",
        name: "John",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      });

      try {
        await Controller.postFriend("john.doe@example.com", {
          friend: { email: "john.doe@example.com" },
        });
        assert.fail();
      } catch (e) {
        assert.strictEqual(e.statusCode, 422);
      }
    });

    it("gives status 404 if the friend in question could not be found", async () => {
      sinon
        .stub(Store, "getUserByEmail")
        .onCall(0)
        .resolves({
          email: "john.doe@example.com",
          name: "John",
          privateKey:
            "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        })
        .onCall(1)
        .resolves(null);

      try {
        await Controller.postFriend("john.doe@example.com", {
          friend: { email: "jane.doe@example.com" },
        });
        assert.fail();
      } catch (e) {
        assert.strictEqual(e.statusCode, 404);
      }
    });

    it("adds and returns the friend if there is such a user", async () => {
      sinon
        .stub(Store, "getUserByEmail")
        .onCall(0)
        .resolves({
          email: "john.doe@example.com",
          name: "John",
          privateKey:
            "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        })
        .onCall(1)
        .resolves({
          email: "jane.doe@example.com",
          name: "Jane",
          privateKey:
            "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        });

      const addFriendStub = sinon.stub(Store, "addFriend").resolves({
        email: "jane.doe@example.com",
        name: "Jane",
        pending: true,
      });

      const friend = await Controller.postFriend("john.doe@example.com", {
        friend: { email: "jane.doe@example.com" },
      });

      assert(addFriendStub.called);

      assert.deepEqual(friend, {
        email: "jane.doe@example.com",
        name: "Jane",
        pending: true,
        publicKey:
          "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
      });
    });
  });

  describe("getFriends", () => {
    it("throws a 404 if the user does not exist", async () => {
      sinon.stub(Store, "getUserByEmail").resolves(null);

      try {
        await Controller.getFriends("john.doe@example.com");
        assert.fail();
      } catch (e) {
        assert.strictEqual(e.statusCode, 404);
      }
    });

    it("gets the user's friends if the user exists", async () => {
      sinon.stub(Store, "getUserByEmail").resolves({
        email: "james.smith@example.com",
        name: "James",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
      });

      const getFriendsStub = sinon.stub(Store, "getFriendsOfUser").resolves([]);

      const friends = await Controller.getFriends("james.smith@example.com");

      assert(getFriendsStub.called);
      assert.deepEqual(friends, []);
    });

    it("returns friends if they can be fetched from the store", async () => {
      sinon.stub(Store, "getUserByEmail").resolves({
        email: "james.smith@example.com",
        name: "James",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
      });

      const getFriendsStub = sinon.stub(Store, "getFriendsOfUser").resolves([
        {
          email: "john.doe@example.com",
          name: "John",
          pending: false,
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
        },
        {
          email: "jane.doe@example.com",
          name: "Jane",
          pending: true,
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
        },
      ]);

      const friends = await Controller.getFriends("james.smith@example.com");

      assert(getFriendsStub.called);
      assert.deepEqual(friends, [
        {
          email: "john.doe@example.com",
          name: "John",
          pending: false,
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
        },
        {
          email: "jane.doe@example.com",
          name: "Jane",
          pending: true,
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
        },
      ]);
    });
  });
});
