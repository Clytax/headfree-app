// 1) Extend the outcome types
export type PredictOutcome =
  | {
      ok: true;
      ms: number;
      samples?: number[];
      avgMs?: number;
      p50Ms?: number;
      p90Ms?: number;
      // NEW: RSS aggregation (KB)
      rssSamplesKb?: number[];
      rssAvgKb?: number;
      rssP50Kb?: number;
      rssP90Kb?: number;
    }
  | {
      ok: false;
      ms: number;
      kind: "timeout" | "4xx" | "5xx" | "network" | "parse" | "unknown";
      status?: number;
      samples?: number[];
      // Optional: if some successes happened before failure
      rssSamplesKb?: number[];
    };
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1)
  );
  return sorted[idx];
}
// 2) Have singlePredictCall return the parsed RSS value
async function singlePredictCall(
  userToken: string,
  timeoutMs: number,
  opts?: {
    force?: boolean;
    headers?: Record<string, string>;
    predictionDate?: string;
  }
): Promise<{ data?: any; outcome: PredictOutcome; rssKb?: number }> {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const base =
      process.env.EXPO_PUBLIC_HEADFREE_API?.replace(/\/+$/, "") ?? "";
    const url = new URL(base + "/predict");
    if (opts?.force) url.searchParams.set("force", "1");

    const predictionDate =
      opts?.predictionDate ?? new Date().toISOString().slice(0, 10);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        ...(opts?.force ? { "X-Benchmark": "1" } : null),
        ...(opts?.headers ?? {}),
      },
      body: JSON.stringify({ prediction_date: predictionDate }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const ms = Date.now() - t0;

    const peakHeader = res.headers.get("X-Peak-RSS-KB");
    const rssKb =
      peakHeader !== null && Number.isFinite(Number(peakHeader))
        ? Number(peakHeader)
        : undefined;
    if (rssKb !== undefined) {
      console.log(`[PERF] server peak RSS Δ=${rssKb} KB`);
    }

    if (!res.ok) {
      const kind = res.status >= 400 && res.status < 500 ? "4xx" : "5xx";
      return { outcome: { ok: false, ms, kind, status: res.status }, rssKb };
    }

    try {
      const data = await res.json();
      return { data, outcome: { ok: true, ms }, rssKb };
    } catch {
      return { outcome: { ok: false, ms, kind: "parse" }, rssKb };
    }
  } catch (err: any) {
    clearTimeout(timer);
    const ms = Date.now() - t0;
    if (err?.name === "AbortError")
      return { outcome: { ok: false, ms, kind: "timeout" } };
    return { outcome: { ok: false, ms, kind: "network" } };
  }
}

// 3) Aggregate RSS in multi-run path
export async function callPredict(
  userToken: string,
  timeoutMs = 20000,
  opts?: {
    amountOfTests?: number;
    force?: boolean;
    headers?: Record<string, string>;
    predictionDate?: string;
  }
): Promise<{ data?: any; outcome: PredictOutcome }> {
  const runs = Math.max(1, opts?.amountOfTests ?? 1);
  if (runs === 1) return singlePredictCall(userToken, timeoutMs, opts);

  const samples: number[] = []; // latency ms of successful runs
  const rssSamplesKb: number[] = []; // NEW: peak RSS KB of successful runs
  let lastData: any = undefined;

  let success = 0,
    c4xx = 0,
    c5xx = 0,
    cTimeout = 0,
    cNetwork = 0,
    cParse = 0,
    cUnknown = 0;

  for (let i = 0; i < runs; i++) {
    const { data, outcome, rssKb } = await singlePredictCall(
      userToken,
      timeoutMs,
      opts
    );

    if (outcome.ok) {
      success += 1;
      samples.push(outcome.ms);
      if (rssKb !== undefined && Number.isFinite(rssKb))
        rssSamplesKb.push(rssKb);
      lastData = data;
      console.log(
        `[BENCH] run ${i + 1}/${runs} → ${outcome.ms} ms${
          rssKb !== undefined ? `, RSSΔ=${rssKb}KB` : ""
        }`
      );
    } else {
      if (outcome.kind === "4xx") c4xx += 1;
      else if (outcome.kind === "5xx") c5xx += 1;
      else if (outcome.kind === "timeout") cTimeout += 1;
      else if (outcome.kind === "network") cNetwork += 1;
      else if (outcome.kind === "parse") cParse += 1;
      else cUnknown += 1;

      console.log(
        `[BENCH] run ${i + 1}/${runs} → ERR:${outcome.kind}${
          outcome.status ? ` (status ${outcome.status})` : ""
        } in ${outcome.ms} ms`
      );
    }
  }

  const total = runs;
  const succPct = ((success / total) * 100).toFixed(1);
  console.log(
    `[RELIABILITY] success=${success}/${total} (${succPct}%) 4xx=${c4xx} 5xx=${c5xx} timeout=${cTimeout} network=${cNetwork} parse=${cParse} unknown=${cUnknown}`
  );

  if (success === 0) {
    return {
      outcome: {
        ok: false,
        ms: 0,
        kind: cTimeout
          ? "timeout"
          : cNetwork
          ? "network"
          : c5xx
          ? "5xx"
          : c4xx
          ? "4xx"
          : cParse
          ? "parse"
          : "unknown",
        samples,
        rssSamplesKb, // probably empty
      },
    };
  }

  // latency stats
  const sum = samples.reduce((a, b) => a + b, 0);
  const avg = sum / samples.length;
  const p50 = percentile(samples, 0.5);
  const p90 = percentile(samples, 0.9);

  // RSS stats (only from runs that had the header)
  let rssAvgKb: number | undefined,
    rssP50Kb: number | undefined,
    rssP90Kb: number | undefined;
  if (rssSamplesKb.length > 0) {
    const rssSum = rssSamplesKb.reduce((a, b) => a + b, 0);
    rssAvgKb = rssSum / rssSamplesKb.length;
    rssP50Kb = percentile(rssSamplesKb, 0.5);
    rssP90Kb = percentile(rssSamplesKb, 0.9);
    console.log(
      `[PERF][RSS] avg=${rssAvgKb.toFixed(1)}KB p50=${rssP50Kb.toFixed(
        1
      )}KB p90=${rssP90Kb.toFixed(1)}KB samples=${rssSamplesKb.length}`
    );
  } else {
    console.log(`[PERF][RSS] no X-Peak-RSS-KB headers observed`);
  }

  console.log(
    `[PERF] avg=${avg.toFixed(1)}ms p50=${p50.toFixed(1)} p90=${p90.toFixed(
      1
    )} samples=${samples.length}`
  );

  return {
    data: lastData,
    outcome: {
      ok: true,
      ms: avg,
      samples,
      avgMs: avg,
      p50Ms: p50,
      p90Ms: p90,
      rssSamplesKb,
      rssAvgKb,
      rssP50Kb,
      rssP90Kb,
    },
  };
}
