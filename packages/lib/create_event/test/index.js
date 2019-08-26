const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake, useFakeTimers } = require("sinon");
const createEvent = require("../");
const datetime = require("@sustainer-network/datetime");
const deps = require("../deps");

let clock;

const now = new Date();

const traceId = "tradeId!";
const commandId = "command-id!";
const commandAction = "command-action!";
const commandDomain = "command-domain!";
const commandService = "command-service!";
const commandNetwork = "command-network!";
const commandIssuedTimestamp = 23;
const root = "root!";
const context = "some-context";

const payload = { a: 1 };
const version = 0;

describe("Create event", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
    process.env.NODE_ENV = "production";
  });
  afterEach(() => {
    clock.restore();
    restore();
  });
  it("should get called with expected params", async () => {
    const value = await createEvent({
      traceId,
      context,
      command: {
        id: commandId,
        issuedTimestamp: commandIssuedTimestamp,
        action: commandAction,
        domain: commandDomain,
        service: commandService,
        network: commandNetwork
      },
      root,
      payload,
      version
    });

    expect(value).to.deep.equal({
      context,
      fact: {
        root,
        topic: `did-${commandAction}.${commandDomain}.${commandService}.${commandNetwork}`,
        version,
        traceId,
        createdTimestamp: datetime.fineTimestamp(),
        command: {
          id: commandId,
          action: commandAction,
          domain: commandDomain,
          service: commandService,
          network: commandNetwork,
          issuedTimestamp: commandIssuedTimestamp
        }
      },
      payload
    });
  });

  it("should get called with expected params in staging", async () => {
    process.env.NODE_ENV = "staging";
    const value = await createEvent({
      command: {
        id: commandId,
        issuedTimestamp: commandIssuedTimestamp,
        action: commandAction,
        domain: commandDomain,
        service: commandService,
        network: commandNetwork
      },
      traceId,
      context,
      root,
      payload,
      version
    });

    expect(value).to.deep.equal({
      context,
      fact: {
        root,
        topic: `did-${commandAction}.${commandDomain}.${commandService}.staging.${commandNetwork}`,
        version,
        traceId,
        createdTimestamp: datetime.fineTimestamp(),
        command: {
          id: commandId,
          action: commandAction,
          domain: commandDomain,
          service: commandService,
          network: commandNetwork,
          issuedTimestamp: commandIssuedTimestamp
        }
      },
      payload
    });
  });
  it("should get called with expected params if root is missin", async () => {
    const newUuid = "newUuid!";
    replace(deps, "makeUuid", fake.returns(newUuid));

    const value = await createEvent({
      traceId,
      command: {
        action: commandAction,
        domain: commandDomain,
        service: commandService,
        network: commandNetwork,
        id: commandId,
        issuedTimestamp: commandIssuedTimestamp
      },
      context,
      payload,
      version
    });

    expect(value).to.deep.equal({
      context,
      fact: {
        root: newUuid,
        topic: `did-${commandAction}.${commandDomain}.${commandService}.${commandNetwork}`,
        version,
        traceId,
        createdTimestamp: datetime.fineTimestamp(),
        command: {
          id: commandId,
          action: commandAction,
          domain: commandDomain,
          service: commandService,
          network: commandNetwork,
          issuedTimestamp: commandIssuedTimestamp
        }
      },
      payload
    });
  });
  it("should get called with expected params if authorized is missing", async () => {
    const value = await createEvent({
      traceId,
      context,
      command: {
        action: commandAction,
        domain: commandDomain,
        service: commandService,
        network: commandNetwork,
        id: commandId,
        issuedTimestamp: commandIssuedTimestamp
      },
      root,
      payload,
      version
    });

    expect(value).to.deep.equal({
      context,
      fact: {
        root,
        topic: `did-${commandAction}.${commandDomain}.${commandService}.${commandNetwork}`,
        version,
        traceId,
        createdTimestamp: datetime.fineTimestamp(),
        command: {
          id: commandId,
          action: commandAction,
          domain: commandDomain,
          service: commandService,
          network: commandNetwork,
          issuedTimestamp: commandIssuedTimestamp
        }
      },
      payload
    });
  });
  it("should get called with expected params if context is missing", async () => {
    const value = await createEvent({
      traceId,
      command: {
        id: commandId,
        issuedTimestamp: commandIssuedTimestamp,
        action: commandAction,
        domain: commandDomain,
        service: commandService,
        network: commandNetwork
      },
      root,
      payload,
      version
    });

    expect(value).to.deep.equal({
      fact: {
        root,
        topic: `did-${commandAction}.${commandDomain}.${commandService}.${commandNetwork}`,
        version,
        traceId,
        createdTimestamp: datetime.fineTimestamp(),
        command: {
          id: commandId,
          action: commandAction,
          domain: commandDomain,
          service: commandService,
          network: commandNetwork,
          issuedTimestamp: commandIssuedTimestamp
        }
      },
      payload
    });
  });
});
