import { config } from "../../src/config.js";

describe("config", () => {
  it("should configure important things", () => {
    expect(config.port).toBeDefined();
  });
});
