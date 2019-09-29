const { expect } = require("chai");

const normalize = require("..");

describe("Event store normalize", () => {
  it("should call with the correct string", async () => {
    const result = normalize;
    expect(result).to.equal(
      `() => {
  const key = this.headers.root;
  const value = {
    headers: {
      root: this.headers.root
    },
    ...this.payload,
    _metadata: {
      count: 0
    }
  };
  emit(key, value);
}`
    );
  });
});
