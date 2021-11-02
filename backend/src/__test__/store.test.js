const assert = require("assert");
const mock = require("mock-require");
const sinon = require("sinon");
const connection = require("../database");

mock("../database", {
  query: () => {
    throw new Error("Check that all database functions are mocked");
  },
});

const { Store } = require("../store");

after(() => {
  mock.stop("../database");
});

describe("Store", () => {
  describe("getUserByEmail", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if `connection.query` gives an error", async () => {
      const error = Symbol();

      sinon.stub(connection, "query").callsArgWith(2, error, [], []);

      try {
        await Store.getUserByEmail("test@example.com");
        assert.fail();
      } catch (e) {
        assert.strictEqual(e, error);
      }
    });

    it("resolves if `connection.query` gives no error", async () => {
      sinon.stub(connection, "query").callsArgWith(2, null, [], []);

      await Store.getUserByEmail("john@example.com");
    });

    it('returns "null" if zero results are given back fron `connection.query`', async () => {
      sinon.stub(connection, "query").callsArgWith(2, null, [], []);

      assert.strictEqual(
        await Store.getUserByEmail("i.do.not.exist@example.com"),
        null
      );
    });

    it("returns the user if one result is given back from `connection.query`", async () => {
      sinon.stub(connection, "query").callsArgWith(
        2,
        null,
        [
          {
            email: "test@example.com",
            name: "Test User",
            passwordSha256:
              "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            privateKey:
              "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
          },
        ],
        []
      );

      assert.deepEqual(await Store.getUserByEmail("test@example.com"), {
        email: "test@example.com",
        name: "Test User",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      });
    });

    it("rejects if more than one result is given back from `connection.query` (this should never happen)", async () => {
      sinon.stub(connection, "query").callsArgWith(
        2,
        null,
        [
          {
            email: "test@example.com",
            name: "Test User",
            passwordSha256:
              "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            privateKey:
              "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
          },
          {
            email: "test@example.com",
            name: "Test User",
            passwordSha256:
              "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            privateKey:
              "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
          },
        ],
        []
      );

      await assert.rejects(Store.getUserByEmail("john.doe@example.com"));
    });
  });

  describe("createUser", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if a falsey user is given", async () => {
      sinon.stub(connection, "query").callsArgWith(2, null, [], []);

      await assert.rejects(Store.createUser(null));
      await assert.rejects(Store.createUser(undefined));
    });

    it("rejects if any of the properties are not given (all are mandatory)", async () => {
      sinon.stub(connection, "query").callsArgWith(2, null, [], []);

      await assert.rejects(
        Store.createUser({
          name: "John Doe",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        })
      );

      await assert.rejects(
        Store.createUser({
          email: "test@example.com",
          name: "John Doe",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        })
      );

      await assert.rejects(
        Store.createUser({
          email: "test@example.com",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        })
      );
    });

    it("calls `connection.query` given a correct user object", async () => {
      const stub = sinon
        .stub(connection, "query")
        .callsArgWith(2, null, [], []);

      await Store.createUser({
        email: "test@example.com",
        name: "John Doe",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      });

      assert(stub.calledOnce);
    });

    it("rejects if `connection.query` gives an error", async () => {
      const error = Symbol();

      sinon.stub(connection, "query").callsArgWith(2, error, [], []);

      try {
        await Store.createUser({
          email: "test@example.com",
          name: "John Doe",
          passwordSha256:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        });
        assert.fail();
      } catch (e) {
        assert.strictEqual(e, error);
      }
    });

    it("gives the correct fields to `connection.query`", async () => {
      const queryStub = sinon.stub(connection, "query").callsArgWith(
        2,
        null,
        [
          {
            email: "test@example.com",
            name: "Test User",
            passwordSha256:
              "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            privateKey:
              "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
          },
        ],
        []
      );

      await Store.createUser({
        email: "test@example.com",
        name: "John Doe",
        passwordSha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      });

      assert(queryStub.calledOnce);
      assert.deepEqual(queryStub.getCall(0).args[1], [
        "test@example.com",
        "John Doe",
        "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      ]);
    });
  });

  describe("addFriend", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("calls `connection.query` with the given emails", async () => {
      const stub = sinon
        .stub(connection, "query")
        .callsArgWith(2, null, [null, [{ pending: true }]], []);

      await Store.addFriend("john.doe@example.com", "jane.doe@example.com");

      assert(stub.calledOnce);

      // Not too sure if this is a good detail to test, but ok for now
      assert.deepEqual(stub.getCall(0).args[1], [
        "john.doe@example.com",
        "jane.doe@example.com",
        "john.doe@example.com",
        "jane.doe@example.com",
      ]);
    });

    it("rejects if `connection.query` passes an error", async () => {
      const error = Symbol();

      sinon
        .stub(connection, "query")
        .callsArgWith(2, error, [null, [{ pending: false }]], []);

      try {
        await Store.addFriend("john.doe@example.com", "jane.doe@example.com");
        assert.fail();
      } catch (e) {
        assert.equal(e, error);
      }
    });

    it("resolves to inserted data (+ pending) if there is no error", async () => {
      sinon
        .stub(connection, "query")
        .callsArgWith(2, null, [null, [{ pending: true }]], []);

      assert.deepEqual(
        await Store.addFriend("jane.doe@example.com", "john.doe@example.com"),
        {
          from: "jane.doe@example.com",
          to: "john.doe@example.com",
          pending: true,
        }
      );
    });

    it("resolves to inserted data (+ pending = false) where the inverse relationship exists", async () => {
      sinon
        .stub(connection, "query")
        .callsArgWith(2, null, [null, [{ pending: false }]], ["pending"]);

      assert.deepEqual(
        await Store.addFriend("jane.doe@example.com", "john.doe@example.com"),
        {
          from: "jane.doe@example.com",
          to: "john.doe@example.com",
          pending: false,
        }
      );
    });
  });

  describe("getFriendsOfUser", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if `connection.query` gives an error", async () => {
      const error = Symbol();

      sinon.stub(connection, "query").callsArgWith(2, error, [], []);

      try {
        await Store.getFriendsOfUser("john.doe@example.com");
        assert.fail();
      } catch (e) {
        assert.equal(e, error);
      }
    });

    it("correctly maps the returned items to valid friend objects", async () => {
      sinon.stub(connection, "query").callsArgWith(
        2,
        null,
        [
          {
            email: "john.doe@example.com",
            name: "John",
            privateKey:
              "6f0714b966f68b9e856484f8d66cae944bb5efc51664f883c9e098d13f47081e",
            pending: false,
          },
          {
            email: "jane.doe@example.com",
            name: "Jane",
            privateKey:
              "d67386cea815e7b28c9bd72276d203d82bf10e68624a9afe44c728947aec70fb",
            pending: false,
          },
          {
            email: "bill.doe@example.com",
            name: "Bill",
            privateKey:
              "5cd2414c151fbfc7dc0edfd0ef9227dfcd609ea9883906c2669a7cd7903509f2",
            pending: true,
          },
        ],
        ["email", "name", "privateKey", "pending"]
      );

      assert.deepEqual(await Store.getFriendsOfUser("alex.doe@example.com"), [
        {
          email: "john.doe@example.com",
          name: "John",
          publicKey:
            "04f706393af66b9cc39559bc3167e38af5fb3ba969477cca052028a85a4511e463a59fee11943eec26f80b8d92fa88770cbbd9e14e2c7095b46b9ef3b817b60e63",
          pending: false,
        },
        {
          email: "jane.doe@example.com",
          name: "Jane",
          publicKey:
            "04d3ef7c9f64aca07313ac6a9005b11e3b874c86e3cc7a17b6247b80716650987d8d558c7afdc187e516b9039200a7d2fe24bf58eabc8e97305e0701ed5b5a736b",
          pending: false,
        },
        {
          email: "bill.doe@example.com",
          name: "Bill",
          publicKey:
            "047e0aae6d734daa15fc635443679c3a47a4f3c99c00cbace42018796bc44e24f197e66e03dfc0007aa3a2f541802e657176c8494f7759409965703d6cd490067a",
          pending: true,
        },
      ]);
    });
  });
});
