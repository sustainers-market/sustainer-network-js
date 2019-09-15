const { expect } = require("chai").use(require("sinon-chai"));
const { restore, fake, replace } = require("sinon");
const deps = require("../deps");
const gcpToken = require("..");

describe("Gcp token", () => {
  afterEach(() => {
    restore();
  });
  it("should call correctly", async () => {
    const body = "some-body";
    const response = {
      body
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const operation = "some.url";
    const result = await gcpToken({ operation });

    const url = "https://url-some-ixixyzl3ea-uc.a.run.app";

    expect(getFake).to.have.been.calledWith(
      `https://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`,
      null,
      { "Metadata-Flavor": "Google" }
    );
    expect(result).to.equal(body);
  });
});
