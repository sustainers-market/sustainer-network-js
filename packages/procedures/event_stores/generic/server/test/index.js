const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const deps = require("../deps");

const aggregateFn = "some-aggregate-fn";
const reserveRootCountsFn = "some-reserve-root-counts-fn";
const queryFn = "some-query-fn";
const streamFn = "some-stream-fn";
const rootStreamFn = "some-root-stream-fn";
const saveEventsFn = "some-save-events-fn";
const publishFn = "some-publish-fn";

describe("Event store", () => {
  beforeEach(() => {
    delete require.cache[require.resolve("..")];
  });
  afterEach(() => {
    restore();
  });
  it("should call with the correct params", async () => {
    const eventStore = require("..");
    const listenFake = fake();
    const postFake = fake.returns({
      listen: listenFake,
    });
    const rootStreamFake = fake.returns({
      post: postFake,
    });
    const streamFake = fake.returns({
      get: rootStreamFake,
    });
    const getFake = fake.returns({
      get: streamFake,
    });
    const serverFake = fake.returns({
      get: getFake,
    });
    replace(deps, "server", serverFake);
    const eventStoreGetResult = "some-get-result";
    const eventStoreGetFake = fake.returns(eventStoreGetResult);
    replace(deps, "get", eventStoreGetFake);
    const eventStoreStreamResult = "some-stream-result";
    const eventStoreStreamFake = fake.returns(eventStoreStreamResult);
    replace(deps, "stream", eventStoreStreamFake);
    const eventStoreRootStreamResult = "some-root-stream-result";
    const eventStoreRootStreamFake = fake.returns(eventStoreRootStreamResult);
    replace(deps, "rootStream", eventStoreRootStreamFake);
    const eventStorePostResult = "some-post-result";
    const eventStorePostFake = fake.returns(eventStorePostResult);
    replace(deps, "post", eventStorePostFake);
    await eventStore({
      aggregateFn,
      reserveRootCountsFn,
      saveEventsFn,
      queryFn,
      streamFn,
      publishFn,
      rootStreamFn,
    });
    expect(listenFake).to.have.been.calledOnce;
    expect(serverFake).to.have.been.calledOnce;
    expect(getFake).to.have.been.calledWith(eventStoreGetResult, {
      path: "/:root?",
    });
    expect(streamFake).to.have.been.calledWith(eventStoreStreamResult, {
      path: "/stream/:root?",
    });
    expect(rootStreamFake).to.have.been.calledWith(eventStoreRootStreamResult, {
      path: "/roots",
    });
    expect(postFake).to.have.been.calledWith(eventStorePostResult);
    expect(eventStoreGetFake).to.have.been.calledWith({ aggregateFn, queryFn });
    expect(eventStoreStreamFake).to.have.been.calledWith({ streamFn });
    expect(eventStoreRootStreamFake).to.have.been.calledWith({ rootStreamFn });
    expect(eventStorePostFake).to.have.been.calledWith({
      saveEventsFn,
      reserveRootCountsFn,
      publishFn,
    });
  });
});
