const { expect } = require("chai")
  .use(require("chai-datetime"))
  .use(require("sinon-chai"));
const { restore, replace, fake, stub, useFakeTimers } = require("sinon");

const main = require("../../main");
const deps = require("../../deps");

let clock;
const now = new Date();

const newSceneRoot = "some-new-scene-root";
const newSceneService = "some-new-scene-service";
const newSceneNetwork = "some-new-scene-network";

const payload = {
  scene: {
    root: newSceneRoot,
    service: newSceneService,
    network: newSceneNetwork
  }
};
const token = "some-token";
const project = "some-projectl";
const root = "some-root";
const identity = "some-identity";
const contextSession = "some-context-session";
const oldDomain = "some-old-domain";
const context = {
  identity,
  session: contextSession,
  domain: oldDomain,
  [oldDomain]: "some-old-domain"
};
const sceneAggregateRoot = "some-scene-aggregate-root";
const sceneAggregateDomain = "some-scene-aggregate-domain";
const sceneAggregateService = "some-scene-aggregate-service";
const sceneAggregateNetwork = "some-scene-aggregate-network";

const iss = "some-iss";
const aud = "some-aud";
const sub = "some-sub";
const exp = deps.stringFromDate(new Date(deps.fineTimestamp() + 300));
const claims = {
  iss,
  aud,
  sub,
  exp
};

process.env.GCP_PROJECT = project;

describe("Command handler unit tests", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
  });
  afterEach(() => {
    clock.restore();
    restore();
  });
  it("should return successfully", async () => {
    const signature = "some-signature";
    const signFake = fake.returns(signature);
    replace(deps, "sign", signFake);

    const createJwtFake = fake.returns(token);
    replace(deps, "createJwt", createJwtFake);

    const aggregateFake = stub()
      .onFirstCall()
      .returns({
        aggregate: {
          scenes: [
            {
              root: newSceneRoot,
              service: newSceneService,
              network: newSceneNetwork
            }
          ]
        }
      })
      .onSecondCall()
      .returns({ aggregate: { terminated: false } })
      .onThirdCall()
      .returns({
        aggregate: {
          domain: sceneAggregateDomain,
          service: sceneAggregateService,
          network: sceneAggregateNetwork,
          root: sceneAggregateRoot
        }
      });

    const result = await main({
      payload,
      root,
      context,
      claims,
      aggregateFn: aggregateFake
    });

    expect(result).to.deep.equal({
      events: [
        {
          action: "change-scene",
          payload,
          root
        }
      ],
      response: { tokens: { session: token } }
    });
    expect(aggregateFake).to.have.been.calledWith(sub, {
      domain: "principle"
    });
    expect(aggregateFake).to.have.been.calledWith(root);
    expect(aggregateFake).to.have.been.calledWith(newSceneRoot, {
      domain: "scene"
    });
    expect(aggregateFake).to.have.callCount(3);
    expect(signFake).to.have.been.calledWith({
      ring: "jwt",
      key: "session",
      location: "global",
      version: "1",
      project
    });
    expect(createJwtFake).to.have.been.calledWith({
      options: {
        issuer: iss,
        subject: sub,
        audience: aud,
        expiresIn: Date.parse(exp) - deps.fineTimestamp()
      },
      payload: {
        context: {
          identity,
          session: contextSession,
          scene: {
            root: newSceneRoot,
            service: newSceneService,
            network: newSceneNetwork
          },
          domain: sceneAggregateDomain,
          [sceneAggregateDomain]: {
            root: sceneAggregateRoot,
            service: sceneAggregateService,
            network: sceneAggregateNetwork
          }
        }
      },
      signFn: signature
    });
  });
  it("should throw correctly if context isnt accessible", async () => {
    const signature = "some-signature";
    const signFake = fake.returns(signature);
    replace(deps, "sign", signFake);

    const createJwtFake = fake.returns(token);
    replace(deps, "createJwt", createJwtFake);

    const error = "some-error";
    const messageFake = fake.returns(error);
    replace(deps, "unauthorizedError", {
      message: messageFake
    });

    const aggregateFake = stub()
      .onFirstCall()
      .returns({
        aggregate: { scenes: [{ root: "bogus" }] }
      })
      .onSecondCall()
      .returns({ aggregate: { terminated: false } })
      .onThirdCall()
      .returns({
        aggregate: {
          domain: sceneAggregateDomain,
          service: sceneAggregateService,
          network: sceneAggregateNetwork,
          root: sceneAggregateRoot
        }
      });

    try {
      await main({
        payload,
        root,
        context,
        claims,
        aggregateFn: aggregateFake
      });
      //shouldn't get called
      expect(2).to.equal(3);
    } catch (e) {
      expect(messageFake).to.have.been.calledWith(
        "This scene isn't accessible.",
        {
          info: {
            scene: {
              root: newSceneRoot,
              service: newSceneService,
              network: newSceneNetwork
            }
          }
        }
      );
      expect(e).to.equal(error);
    }
  });
  it("should throw correctly if session terminated", async () => {
    const signature = "some-signature";
    const signFake = fake.returns(signature);
    replace(deps, "sign", signFake);

    const createJwtFake = fake.returns(token);
    replace(deps, "createJwt", createJwtFake);

    const aggregateFake = stub()
      .onFirstCall()
      .returns({
        aggregate: {
          scenes: [
            {
              root: newSceneRoot,
              service: newSceneService,
              network: newSceneNetwork
            }
          ]
        }
      })
      .onSecondCall()
      .returns({ aggregate: { terminated: true } })
      .onThirdCall()
      .returns({
        aggregate: {
          domain: sceneAggregateDomain,
          root: sceneAggregateRoot
        }
      });

    const error = "some-error";
    const sessionTerminatedFake = fake.returns(error);
    replace(deps, "badRequestError", {
      sessionTerminated: sessionTerminatedFake
    });

    try {
      await main({
        payload,
        root,
        context,
        claims,
        aggregateFn: aggregateFake
      });
      //shouldn't get called
      expect(2).to.equal(3);
    } catch (e) {
      expect(e).to.equal(error);
    }
  });
  it("should throw correctly", async () => {
    const signature = "some-signature";
    const signFake = fake.returns(signature);
    replace(deps, "sign", signFake);

    const errorMessage = "some-error";
    const createJwtFake = fake.rejects(errorMessage);
    replace(deps, "createJwt", createJwtFake);

    const aggregateFake = stub()
      .onFirstCall()
      .returns({
        aggregate: {
          scenes: [
            {
              root: newSceneRoot,
              service: newSceneService,
              network: newSceneNetwork
            }
          ]
        }
      })
      .onSecondCall()
      .returns({ aggregate: { terminated: false } })
      .onThirdCall()
      .returns({
        aggregate: {
          domain: sceneAggregateDomain,
          service: sceneAggregateService,
          network: sceneAggregateNetwork,
          root: sceneAggregateRoot
        }
      });

    try {
      await main({
        payload,
        root,
        context,
        claims,
        aggregateFn: aggregateFake
      });
      //shouldn't get called
      expect(2).to.equal(3);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
});
