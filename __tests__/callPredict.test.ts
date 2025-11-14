/* eslint-env jest */
import { callPredict } from "@/utils/prediction/predict";

describe("callPredict", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns ok:true and aggregates latency stats for successful responses", async () => {
    // Mock a successful fetch response with X-Peak-RSS-KB header
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name === "X-Peak-RSS-KB" ? "123" : null),
      },
      json: async () => ({ some: "data" }),
    });

    const { data, outcome } = await callPredict("fake-token", 5000, {
      amountOfTests: 3,
      force: false,
    });

    expect(data).toEqual({ some: "data" });
    expect(outcome.ok).toBe(true);

    // got 3 latency samples from 3 runs
    expect(outcome.samples).toHaveLength(3);

    // average latency is a non-negative number
    expect(outcome.ms).toBeGreaterThanOrEqual(0);

    // RSS stats picked up the header
    expect(outcome.rssSamplesKb).toContain(123);
  });

  it("returns ok:false with kind timeout when fetch aborts", async () => {
    // Mock AbortError
    // @ts-ignore
    global.fetch.mockImplementation(() => {
      const error: any = new Error("Aborted");
      error.name = "AbortError";
      throw error;
    });

    const { outcome } = await callPredict("fake-token", 10, {
      amountOfTests: 1,
    });

    expect(outcome.ok).toBe(false);
  });
});
