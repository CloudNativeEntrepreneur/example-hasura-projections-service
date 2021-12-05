import { start, shutdown } from "../../../src/bin/start.js";

jest.mock("register-server-handlers");

jest.mock("express", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn(() => ({
      close: jest.fn(),
    })),
  })),
  Router: jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

jest.spyOn(process, "exit").mockImplementation(() => {
  return undefined as never;
});

describe("bin/start.ts", () => {
  it("should start our service", async () => {
    const express = await (await import("express")).default;
    const server = express();
    const { registerHandlers } = await import("register-server-handlers");
    await start(server, "./handlers");
    expect(registerHandlers).toBeCalled();
  });

  it("should shutdown server and persistencelayer", async () => {
    const server = {
      log: {
        info: jest.fn(),
      },
      close: jest.fn(() => Promise.resolve(true)),
    };
    await shutdown(server)();

    expect(server.close).toBeCalled();
  });
});
