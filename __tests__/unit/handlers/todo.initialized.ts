import { handle } from "../../../src/handlers/todo.initialized.js";

jest.spyOn(process, "exit").mockImplementation(() => {
  return undefined as never;
});

jest.mock("axios", () => {
  return {
    post: jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolve({
            data: {
              insert_todos_one: {
                id: "test-1",
              },
            },
          });
        })
    ),
  };
});

describe("todo.initialized event handler", () => {
  it("should export minimum exports", () => {
    expect(handle).toBeDefined();
    expect(typeof handle === "function").toBe(true);
  });

  it("should handle event", async () => {
    const request = {
      body: {},
      log: {
        info: jest.fn(),
      },
    };
    const reply = {
      status: jest.fn(() => ({
        send: jest.fn(),
        json: jest.fn(),
      })),
    };
    const event = {
      type: "todo.initialized",
      data: {
        id: "test-1",
      },
      source: "tests",
    };
    await handle(request, reply, event);
  });

  it("should handle event that has already been processed", async () => {
    const request = {
      body: {},
      log: {
        info: jest.fn(),
      },
    };
    const reply = {
      status: jest.fn(() => ({
        send: jest.fn(),
        json: jest.fn(),
      })),
    };
    const event = {
      type: "todo.initialized",
      data: {
        id: "test-1",
        completedDenormalizers: ["example-hasura"],
      },
      source: "tests",
    };
    await handle(request, reply, event);
  });

  it("should handle hasura error", async () => {
    const request = {
      body: {},
      log: {
        info: jest.fn(),
      },
    };
    const reply = {
      status: jest.fn(() => ({
        send: jest.fn(),
        json: jest.fn(),
      })),
    };
    const event = {
      type: "todo.initialized",
      data: {
        id: "test-1",
      },
      source: "tests",
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const axios = require("axios");
    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({
            data: {
              errors: ["Fake error"],
            },
          });
        })
    );
    await handle(request, reply, event);
  });
});
