// api/predict.ts
export type PredictOutcome =
  | { ok: true; ms: number }
  | {
      ok: false;
      ms: number;
      kind: "timeout" | "4xx" | "5xx" | "network" | "parse" | "unknown";
      status?: number;
    };

export async function callPredict(
  userToken: string,
  timeoutMs = 20000
): Promise<{ data?: any; outcome: PredictOutcome }> {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_HEADFREE_API}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        prediction_date: new Date().toISOString().slice(0, 10),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const ms = Date.now() - t0;
    if (!res.ok) {
      const kind = res.status >= 400 && res.status < 500 ? "4xx" : "5xx";
      return { outcome: { ok: false, ms, kind, status: res.status } };
    }
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return { outcome: { ok: false, ms, kind: "parse" } };
    }
    return { data, outcome: { ok: true, ms } };
  } catch (err: any) {
    clearTimeout(timer);
    const ms = Date.now() - t0;
    if (err?.name === "AbortError")
      return { outcome: { ok: false, ms, kind: "timeout" } };
    return { outcome: { ok: false, ms, kind: "network" } };
  }
}
