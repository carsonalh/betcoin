const assert = require("assert");
const sinon = require("sinon");
const connection = require("../database");
const { Store } = require("../store");

describe("Store", () => {
  describe("getUserByEmail", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if `connection.query` givesn an error", async () => {
      const error = Symbol("Connection error");

      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(error, [], []);
      });

      await assert.rejects(Store.getUserByEmail("test@example.com"));
    });

    it("resolves if `connection.query` gives no error", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [], []);
      });

      await assert.doesNotReject(Store.getUserByEmail("john@example.com"));
    });

    it('returns "null" if zero results are given back fron `connection.query`', async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [], []);
      });

      const user = await Store.getUserByEmail("i.do.not.exist@example.com");

      assert.equal(user, null);
    });

    it("returns the user if one result is given back from `connection.query`", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(
          null,
          [
            {
              email: "test@example.com",
              name: "Test User",
              passwordHash:
                "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
              privateKey:
                "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
            },
          ],
          []
        );
      });

      const user = await Store.getUserByEmail("test@example.com");

      assert.deepEqual(user, {
        email: "test@example.com",
        name: "Test User",
        passwordHash:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      });
    });

    it("rejects if more than one result is given back from `connection.query` (this should never happen)", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(
          null,
          [
            {
              email: "test@example.com",
              name: "Test User",
              passwordHash:
                "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
              privateKey:
                "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
            },
            {
              email: "test@example.com",
              name: "Test User",
              passwordHash:
                "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
              privateKey:
                "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
            },
          ],
          []
        );
      });

      await assert.rejects(Store.getUserByEmail("john.doe@example.com"));
    });
  });

  describe("createUser", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("rejects if a falsey user is given", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [], []);
      });

      await assert.rejects(Store.createUser(null));
      await assert.rejects(Store.createUser(undefined));
    });

    it("rejects if any of the properties are not given (all are mandatory)", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [], []);
      });

      await assert.rejects(
        Store.createUser({
          name: "John Doe",
          passwordHash:
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
          passwordHash:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        })
      );
    });

    it("calls `connection.query` given a correct user object", async () => {
      const stub = sinon
        .stub(connection, "query")
        .callsFake((query, values, fn) => {
          fn(null, [], []);
        });

      await Store.createUser({
        email: "test@example.com",
        name: "John Doe",
        passwordHash:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        privateKey:
          "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
      });

      assert(stub.calledOnce);
    });

    it("rejects if `connection.query` gives an error", async () => {
      const error = Symbol();

      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(error, [], []);
      });

      await assert.rejects(
        Store.createUser({
          email: "test@example.com",
          name: "John Doe",
          passwordHash:
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          privateKey:
            "d4d8a89826d109eb2302b68f4cb09d45d916123827d7f3d084c166c11448e757",
        })
      );
    });
  });

  describe("addFriend", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("calls `connection.query` with the given emails", async () => {
      const stub = sinon
        .stub(connection, "query")
        .callsFake((query, values, fn) => {
          fn(null, [null, { pending: true }], []);
        });

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
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(341, [null, { pending: false }], []);
      });

      try {
        await Store.addFriend("john.doe@example.com", "jane.doe@example.com");
        assert.fail();
      } catch (e) {
        assert.equal(e, 341);
      }
    });

    it("resolves to inserted data (+ pending) if there is no error", async () => {
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [null, { pending: true }], ["pending"]);
      });

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
      sinon.stub(connection, "query").callsFake((query, values, fn) => {
        fn(null, [null, { pending: false }], ["pending"]);
      });

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
});
