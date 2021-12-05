import { healthcheck } from "../../../src/lib/healthcheck.js";

describe("healthcheck", () => {
  it("should respond with 200", () => {
    const send = jest.fn();
    const reply = {
      code: jest.fn(() => ({
        send,
      })),
    };
    healthcheck({}, reply);
    expect(reply.code).toBeCalledWith(200);
    expect(send).toBeCalledWith("ok");
  });
});
