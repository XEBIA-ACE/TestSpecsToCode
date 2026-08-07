/**
 * monitoringService.test.ts
 *
 * Unit tests for the post-deployment monitoring service.
 * Verifies that events, errors, and metrics are queued and flushed correctly,
 * and that the stability report thresholds work as expected.
 */

import {
  initMonitoring,
  trackEvent,
  reportError,
  recordMetric,
  flushQueues,
  getQueueStatus,
} from "./monitoringService";

import {
  generateStabilityReport,
  formatStabilityReport,
  AggregatedMetrics,
} from "./monitoringDashboard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMetrics(overrides: Partial<AggregatedMetrics> = {}): AggregatedMetrics {
  return {
    totalSessions: 100,
    profileCreationSuccessCount: 97,
    profileCreationFailureCount: 3,
    averageCreationDurationMs: 3_500,
    validationErrorRate: 0.1,
    criticalErrorCount: 0,
    averageFeedbackRating: 4.2,
    feedbackCount: 20,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// monitoringService tests
// ---------------------------------------------------------------------------

describe("monitoringService", () => {
  let flushedEvents: unknown[] = [];
  let flushedErrors: unknown[] = [];
  let flushedMetrics: unknown[] = [];

  beforeEach(() => {
    flushedEvents = [];
    flushedErrors = [];
    flushedMetrics = [];

    initMonitoring({
      userId: "test-user-1",
      flushIntervalMs: 999_999, // prevent auto-flush during tests
      flushHandler: async (events, errors, metrics) => {
        flushedEvents.push(...events);
        flushedErrors.push(...errors);
        flushedMetrics.push(...metrics);
      },
    });
  });

  it("should report as active after initialisation", () => {
    const status = getQueueStatus();
    expect(status.isActive).toBe(true);
  });

  it("should queue a tracked event", () => {
    trackEvent({ category: "profile_creation", action: "test_action" });
    const status = getQueueStatus();
    // At least the init event + our test event
    expect(status.events).toBeGreaterThanOrEqual(1);
  });

  it("should queue an error report", () => {
    reportError(new Error("test error"), { severity: "medium" });
    const status = getQueueStatus();
    expect(status.errors).toBeGreaterThanOrEqual(1);
  });

  it("should queue a performance metric", () => {
    recordMetric({ metricName: "test_metric", value: 42, unit: "ms" });
    const status = getQueueStatus();
    expect(status.metrics).toBeGreaterThanOrEqual(1);
  });

  it("should flush queued data and clear queues", async () => {
    trackEvent({ category: "profile_creation", action: "flush_test" });
    recordMetric({ metricName: "flush_metric", value: 1, unit: "count" });

    await flushQueues();

    const status = getQueueStatus();
    expect(status.events).toBe(0);
    expect(status.metrics).toBe(0);
    expect(flushedEvents.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// monitoringDashboard tests
// ---------------------------------------------------------------------------

describe("generateStabilityReport", () => {
  it("returns STABLE when all metrics are within thresholds", () => {
    const report = generateStabilityReport(makeMetrics());
    expect(report.status).toBe("STABLE");
    expect(report.issues).toHaveLength(0);
  });

  it("returns CRITICAL when there are critical errors", () => {
    const report = generateStabilityReport(
      makeMetrics({ criticalErrorCount: 1 })
    );
    expect(report.status).toBe("CRITICAL");
    expect(report.issues.some((i) => i.includes("critical error"))).toBe(true);
  });

  it("returns DEGRADED when success rate is below threshold", () => {
    const report = generateStabilityReport(
      makeMetrics({
        totalSessions: 100,
        profileCreationSuccessCount: 90,
        profileCreationFailureCount: 10,
      })
    );
    expect(report.status).toBe("DEGRADED");
    expect(report.issues.some((i) => i.includes("success rate"))).toBe(true);
  });

  it("returns DEGRADED when validation error rate is too high", () => {
    const report = generateStabilityReport(
      makeMetrics({ validationErrorRate: 0.35 })
    );
    expect(report.status).toBe("DEGRADED");
    expect(
      report.issues.some((i) => i.includes("Validation error rate"))
    ).toBe(true);
    expect(
      report.recommendations.some((r) => r.includes("guided prompts"))
    ).toBe(true);
  });

  it("returns DEGRADED when average creation duration exceeds threshold", () => {
    const report = generateStabilityReport(
      makeMetrics({ averageCreationDurationMs: 15_000 })
    );
    expect(report.status).toBe("DEGRADED");
    expect(report.issues.some((i) => i.includes("duration"))).toBe(true);
  });

  it("flags low feedback rating when sample size is sufficient", () => {
    const report = generateStabilityReport(
      makeMetrics({ averageFeedbackRating: 2.8, feedbackCount: 15 })
    );
    expect(report.issues.some((i) => i.includes("feedback rating"))).toBe(true);
  });

  it("does not flag low feedback rating when sample size is too small", () => {
    const report = generateStabilityReport(
      makeMetrics({ averageFeedbackRating: 1.0, feedbackCount: 5 })
    );
    expect(report.issues.some((i) => i.includes("feedback rating"))).toBe(
      false
    );
  });

  it("includes a generatedAt ISO timestamp", () => {
    const report = generateStabilityReport(makeMetrics());
    expect(() => new Date(report.generatedAt)).not.toThrow();
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("formatStabilityReport", () => {
  it("includes status and metric values in the formatted output", () => {
    const report = generateStabilityReport(makeMetrics());
    const text = formatStabilityReport(report);
    expect(text).toContain("STABLE");
    expect(text).toContain("Sessions");
    expect(text).toContain("100");
  });

  it("includes issues and recommendations when present", () => {
    const report = generateStabilityReport(
      makeMetrics({ criticalErrorCount: 2 })
    );
    const text = formatStabilityReport(report);
    expect(text).toContain("Issues");
    expect(text).toContain("Recommendations");
  });
});
