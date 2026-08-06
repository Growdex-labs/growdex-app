import { beforeEach, describe, expect, it, vi } from "vitest";

const io = vi.fn(() => ({
  disconnect: vi.fn(),
}));

vi.mock("socket.io-client", () => ({ io }));

describe("getSocket", () => {
  beforeEach(() => {
    vi.resetModules();
    io.mockClear();
  });

  it("uses the browser session cookie for the connection", async () => {
    const { getSocket } = await import("./socket");

    getSocket();

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        withCredentials: true,
        autoConnect: false,
      }),
    );
    expect(io.mock.calls[0]?.[1]).not.toHaveProperty("auth");
  });
});
