const { expect } = require("chai").use(require("sinon-chai"));
const { restore, fake, replace } = require("sinon");

const authorize = require("..");

const domain = "some-domain";
const service = "some-service";
const network = "some-network";
const priviledge = "some-priviledge";

const principle = "some-priciple-root";

const context = {
  network,
  service,
  any: "any-root"
};

const claims = {
  sub: principle
};

const deps = require("../deps");

describe("Authorize", () => {
  afterEach(() => {
    restore();
  });
  it("should authorize with matching priviledge, domain, and service from permission", async () => {
    const permissions = [`${service}:${domain}:${priviledge}`];

    const permissionsLookupFn = fake.returns(permissions);

    const document = await authorize({
      claims,
      context,
      permissionsLookupFn,
      permissions: [`${service}:${domain}:${priviledge}`],
      network
    });

    expect(permissionsLookupFn).to.have.been.calledWith({ principle, context });
    expect(document).to.deep.equal({
      permissions,
      principle
    });
  });
  it("should not authorize if theres a mismatch", async () => {
    const permissions = [`${service}:${domain}:bogus`];

    const permissionsLookupFn = fake.returns(permissions);

    const error = "some-error";
    const tokenInvalidFake = fake.returns(error);
    replace(deps, "invalidCredentialsError", {
      tokenInvalid: tokenInvalidFake
    });

    try {
      await authorize({
        claims,
        context,
        permissionsLookupFn,
        network
      });

      //shouldnt be called;
      expect(1).to.equal(2);
    } catch (e) {
      expect(e).to.equal(e);
    }
  });
  it("should authorize with permissions as none", async () => {
    const permissions = ["*:bogus:*"];

    const permissionsLookupFn = fake.returns(permissions);

    const document = await authorize({
      claims,
      context,
      permissionsLookupFn,
      permissions: "none",
      network
    });
    expect(document).to.deep.equal({
      permissions: [],
      principle
    });
  });
  it("should authorize with no sub and permissions as none", async () => {
    const document = await authorize({
      context,
      claims: {},
      permissions: "none",
      network
    });

    expect(document).to.deep.equal({
      permissions: []
    });
  });
});
