const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const deps = require("../deps");
const get = require("..");

const results = "some-result";
const query = { a: 1 };
const name = "some-name";
const service = "some-service";
const domain = "some-domain";
const context = "some-context";
const root = "some-root";

const internalTokenFn = "some-internal-token-fn";
const externalTokenFn = "some-external-token-fn";
const key = "some-key";

const coreNetwork = "some-core-network";
const network = "some-network";
const envContext = "some-env-context";
process.env.CORE_NETWORK = coreNetwork;
process.env.NETWORK = network;
process.env.CONTEXT = envContext;

describe("View gateway get", () => {
  afterEach(() => {
    restore();
  });
  it("should call with the correct params with view-store procedure", async () => {
    const readFake = fake.returns({ body: results });
    const setFake = fake.returns({
      read: readFake,
    });
    const viewStoreFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewStore", viewStoreFake);

    const req = {
      context,
      query,
      params: {},
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    await get({
      procedure: "view-store",
      name,
      internalTokenFn,
      externalTokenFn,
      key,
    })(req, res);

    expect(viewStoreFake).to.have.been.calledWith({ name });
    expect(setFake).to.have.been.calledWith({
      context,
      token: { internalFn: internalTokenFn, externalFn: externalTokenFn, key },
    });
    expect(readFake).to.have.been.calledWith(query);
    expect(sendFake).to.have.been.calledWith(results);
  });
  it("should call with the correct params with context, domain, and params with view-store procedure", async () => {
    const readFake = fake.returns({ body: results });
    const setFake = fake.returns({
      read: readFake,
    });
    const viewStoreFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewStore", viewStoreFake);

    const req = {
      context,
      query,
      params: {
        root,
      },
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    await get({
      procedure: "view-store",
      name,
      domain,
      service,
      internalTokenFn,
      externalTokenFn,
      key,
    })(req, res);

    expect(viewStoreFake).to.have.been.calledWith({
      name,
      domain,
      service,
    });
    expect(setFake).to.have.been.calledWith({
      context,
      token: { internalFn: internalTokenFn, externalFn: externalTokenFn, key },
    });
    expect(readFake).to.have.been.calledWith({ ...query, root });
    expect(sendFake).to.have.been.calledWith(results);
  });
  it("should throw correctly with view-store procedure", async () => {
    const errorMessage = "error-message";
    const readFake = fake.rejects(new Error(errorMessage));
    const setFake = fake.returns({
      read: readFake,
    });
    const viewStoreFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewStore", viewStoreFake);

    const req = {
      context,
      query,
      params: {},
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    try {
      await get({ procedure: "view-store", name, domain })(req, res);
      //shouldn't get called
      expect(2).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
  it("should call with the correct params with view-composite procedure", async () => {
    const readFake = fake.returns({ body: results });
    const setFake = fake.returns({
      read: readFake,
    });
    const viewCompositeFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewComposite", viewCompositeFake);

    const req = {
      context,
      query,
      params: {},
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    await get({
      procedure: "view-composite",
      name,
      internalTokenFn,
      externalTokenFn,
      key,
    })(req, res);

    expect(viewCompositeFake).to.have.been.calledWith({ name });
    expect(setFake).to.have.been.calledWith({
      context,
      token: { internalFn: internalTokenFn, externalFn: externalTokenFn, key },
    });
    expect(readFake).to.have.been.calledWith(query);
    expect(sendFake).to.have.been.calledWith(results);
  });
  it("should call with the correct params with context, domain, and root with view-composite procedure", async () => {
    const readFake = fake.returns({ body: results });
    const setFake = fake.returns({
      read: readFake,
    });
    const viewCompositeFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewComposite", viewCompositeFake);

    const req = {
      context,
      query,
      params: {
        root,
      },
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    await get({
      procedure: "view-composite",
      name,
      domain,
      service,
      internalTokenFn,
      externalTokenFn,
      key,
    })(req, res);

    expect(viewCompositeFake).to.have.been.calledWith({
      name,
      domain,
      service,
    });
    expect(setFake).to.have.been.calledWith({
      context,
      token: { internalFn: internalTokenFn, externalFn: externalTokenFn, key },
    });
    expect(readFake).to.have.been.calledWith({ ...query, root });
    expect(sendFake).to.have.been.calledWith(results);
  });
  it("should throw correctly with view-composite procedure", async () => {
    const errorMessage = "error-message";
    const readFake = fake.rejects(new Error(errorMessage));
    const setFake = fake.returns({
      read: readFake,
    });
    const viewCompositeFake = fake.returns({
      set: setFake,
    });
    replace(deps, "viewComposite", viewCompositeFake);

    const req = {
      context,
      query,
      params: {},
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake,
    });
    const res = {
      status: statusFake,
    };

    try {
      await get({ procedure: "view-composite", name, domain })(req, res);
      //shouldn't get called
      expect(2).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
});
