const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake, match } = require("sinon");

const deps = require("../deps");
const gateway = require("..");
const whitelist = "some-whitelist";
const permissionsLookupFn = "some-permissions-fn";
const terminatedSessionCheckFn = "some-terminated-session-check-fn";
const domain = "some-domain";
const context = "some-context";
const service = "some-service";
const network = "some-network";
const algorithm = "some-algorithm";
const audience = "some-audience";

process.env.CONTEXT = context;
process.env.NETWORK = network;

describe("View gateway", () => {
  beforeEach(() => {
    process.env.SERVICE = service;
    process.env.DOMAIN = domain;
  });
  afterEach(() => {
    restore();
  });
  it("should call with the correct params", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const getFake = fake.returns({
      listen: listenFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissionService = "some-permission-service";
    const permissionDomain = "some-permission-domain";
    const permissionPrivilege = "some-permission-privilege";
    const permissions = [
      `${permissionService}:${permissionDomain}:${permissionPrivilege}`,
    ];

    const name = "some-name";
    const stores = [{ name, permissions, context }];

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    await gateway({
      stores,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });

    expect(gatewayGetFake).to.have.been.calledWith({ name, domain, service });
    expect(gatewayGetFake).to.have.been.calledOnce;
    expect(listenFake).to.have.been.calledWith();
    expect(serverFake).to.have.been.calledWith({
      prehook: match((fn) => {
        const app = "some-app";
        fn(app);
        return corsMiddlewareFake.calledWith({
          app,
          whitelist,
          credentials: true,
          methods: ["GET"],
        });
      }),
    });
    expect(getFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name}`,
      preMiddleware: [authenticationResult, authorizationResult],
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: true,
    });
    expect(verifyFnFake).to.have.been.calledWith({ key: "access" });
    expect(authorizationFake).to.have.been.calledWith({
      permissionsLookupFn,
      terminatedSessionCheckFn,
      context,
      permissions: [
        {
          service: permissionService,
          domain: permissionDomain,
          privilege: permissionPrivilege,
        },
      ],
    });
  });
  it("should call with the correct params with no domain or service in env", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const getFake = fake.returns({
      listen: listenFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissionService = "some-permission-service";
    const permissionDomain = "some-permission-domain";
    const permissionPrivilege = "some-permission-privilege";
    const permissions = [
      `${permissionService}:${permissionDomain}:${permissionPrivilege}`,
    ];
    const name = "some-name";
    const stores = [{ name, permissions, context }];

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    delete process.env.DOMAIN;
    delete process.env.SERVICE;
    await gateway({
      stores,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });

    expect(gatewayGetFake).to.have.been.calledWith({ name });
    expect(gatewayGetFake).to.have.been.calledOnce;
    expect(listenFake).to.have.been.calledWith();
    expect(serverFake).to.have.been.calledWith({
      prehook: match((fn) => {
        const app = "some-app";
        fn(app);
        return corsMiddlewareFake.calledWith({
          app,
          whitelist,
          credentials: true,
          methods: ["GET"],
        });
      }),
    });
    expect(getFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name}`,
      preMiddleware: [authenticationResult, authorizationResult],
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: true,
    });
    expect(verifyFnFake).to.have.been.calledWith({ key: "access" });
    expect(authorizationFake).to.have.been.calledWith({
      permissionsLookupFn,
      terminatedSessionCheckFn,
      context,
      permissions: [
        {
          service: permissionService,
          domain: permissionDomain,
          privilege: permissionPrivilege,
        },
      ],
    });
  });
  it("should call with the correct params with privileges set to none", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const getFake = fake.returns({
      listen: listenFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissions = "none";
    const name = "some-name";
    const stores = [{ name, permissions, context }];

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    await gateway({
      stores,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });

    expect(gatewayGetFake).to.have.been.calledWith({ name, domain, service });
    expect(gatewayGetFake).to.have.been.calledOnce;
    expect(listenFake).to.have.been.calledWith();
    expect(serverFake).to.have.been.calledWith({
      prehook: match((fn) => {
        const app = "some-app";
        fn(app);
        return corsMiddlewareFake.calledWith({
          app,
          whitelist,
          credentials: true,
          methods: ["GET"],
        });
      }),
    });
    expect(getFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name}`,
      preMiddleware: [authenticationResult, authorizationResult],
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: true,
    });
    expect(verifyFnFake).to.have.been.calledWith({ key: "access" });
    expect(authorizationFake).to.have.been.calledWith({
      permissionsLookupFn,
      terminatedSessionCheckFn,
      context,
      permissions: "none",
    });
  });
  it("should call with the correct params with store key", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const getFake = fake.returns({
      listen: listenFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissions = ["some-permission"];
    const name = "some-name";
    const key = "some-key";
    const stores = [{ name, permissions, key }];

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    await gateway({
      stores,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: true,
    });
    expect(verifyFnFake).to.have.been.calledWith({ key });
  });
  it("should call with the correct params with multiple stores with different protections", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const thirdGetFake = fake.returns({
      listen: listenFake,
    });
    const secondGetFake = fake.returns({
      get: thirdGetFake,
    });
    const getFake = fake.returns({
      get: secondGetFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissionService = "some-permission-service";
    const permissionDomain = "some-permission-domain";
    const permissionPrivilege = "some-permission-privilege";
    const permissions = [
      `${permissionService}:${permissionDomain}:${permissionPrivilege}`,
    ];
    const name1 = "some-name1";
    const name2 = "some-name2";
    const name3 = "some-name3";
    const stores = [
      { name: name1, protection: "none" },
      { name: name2, protection: "context" },
      { name: name3, permissions, context },
    ];

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    await gateway({
      stores,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });

    expect(gatewayGetFake).to.have.been.calledWith({
      name: name1,
      domain,
      service,
    });
    expect(gatewayGetFake).to.have.been.calledWith({
      name: name2,
      domain,
      service,
    });
    expect(gatewayGetFake).to.have.been.calledWith({
      name: name3,
      domain,
      service,
    });
    expect(gatewayGetFake).to.have.been.calledThrice;
    expect(getFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name1}`,
    });
    expect(secondGetFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name2}`,
      preMiddleware: [authenticationResult],
    });
    expect(thirdGetFake).to.have.been.calledWith(gatewayGetResult, {
      path: `/${name3}`,
      preMiddleware: [authenticationResult, authorizationResult],
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: false,
    });
    expect(authenticationFake).to.have.been.calledWith({
      verifyFn: verifyFnResult,
      audience,
      algorithm,
      strict: true,
    });
    expect(verifyFnFake).to.have.been.calledWith({ key: "access" });
    expect(authorizationFake).to.have.been.calledOnce;
    expect(authorizationFake).to.have.been.calledWith({
      permissionsLookupFn,
      terminatedSessionCheckFn,
      context,
      permissions: [
        {
          service: permissionService,
          domain: permissionDomain,
          privilege: permissionPrivilege,
        },
      ],
    });
  });
  it("should call with the correct params with passed in domain and context", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authenticationResult = "some-authentication";
    const authenticationFake = fake.returns(authenticationResult);
    replace(deps, "authentication", authenticationFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const getFake = fake.returns({
      listen: listenFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);

    const gatewayGetResult = "some-get-result";
    const gatewayGetFake = fake.returns(gatewayGetResult);
    replace(deps, "get", gatewayGetFake);

    const permissionService = "some-permission-service";
    const permissionDomain = "some-permission-domain";
    const permissionPrivilege = "some-permission-privilege";
    const permissions = [
      `${permissionService}:${permissionDomain}:${permissionPrivilege}`,
    ];
    const name = "some-name";
    const stores = [{ name, permissions, context }];

    const otherDomain = "some-other-domain";
    const otherService = "some-other-service";
    const otherContext = "some-other-context";

    const verifyFnResult = "some-verify-fn";
    const verifyFnFake = fake.returns(verifyFnResult);

    await gateway({
      stores,
      domain: otherDomain,
      service: otherService,
      context: otherContext,
      whitelist,
      permissionsLookupFn,
      terminatedSessionCheckFn,
      verifyFn: verifyFnFake,
      algorithm,
      audience,
    });

    expect(gatewayGetFake).to.have.been.calledWith({
      name,
      domain: otherDomain,
      service: otherService,
    });
    expect(authorizationFake).to.have.been.calledWith({
      permissionsLookupFn,
      terminatedSessionCheckFn,
      context: otherContext,
      permissions: [
        {
          service: permissionService,
          domain: permissionDomain,
          privilege: permissionPrivilege,
        },
      ],
    });
  });
  it("should throw correctly", async () => {
    const errorMessage = "error-message";
    const serverFake = fake.throws(new Error(errorMessage));
    replace(deps, "server", serverFake);
    try {
      await gateway({
        stores: [],
        whitelist,
        permissionsLookupFn,
        terminatedSessionCheckFn,
        algorithm,
      });
      //shouldn't get called
      expect(2).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
});
