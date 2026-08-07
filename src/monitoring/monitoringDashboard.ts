/**
 * monitoringDashboard.ts
 *
 * Server-side / Node utility that aggregates monitoring events and produces
 * a stability report for the Profile Creation Interface.
 *
 * Acceptance criteria addressed:
 *  - Stable usage patterns with no critical issues are confirmed
 *    (generateStabilityReport() returns a structured report with pass/fail
 *     thresholds that can be consumed by CI or an ops dashboard).
 */

export interface AggregatedMetrics {
  totalSessions: number;
  profileCreationSuccessCount: number;
  profileCreationFailureCount: number;
  averageCreationDurationMs: number;
  validationErrorRate: number; // 0–1
  criticalErrorCount: number;
  averageFeedbackRating: number | null; // null if no feedback yet
  feedbackCount: number;
}

export interface StabilityReport {
  generatedAt: string; // ISO-8601
  status: "STABLE" | "DEGRADED" | "CRITICAL";
  metrics: AggregatedMetrics;
  issues: string[];
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Thresholds (tune per SLA)
// ---------------------------------------------------------------------------

const THRESHOLDS = {
  /** Minimum acceptable profile-creation success rate (0–1). */
  minSuccessRate: 0.95,
  /** Maximum acceptable validation error rate (0–1). */
  maxValidationErrorRate: 0.2,
  /** Maximum average creation duration before flagging a performance issue. */
  maxAvgCreationDurationMs: 10_000,
  /** Any critical errors trigger CRITICAL status. */
  maxCriticalErrors: 0,
  /** Minimum average feedback rating to consider UX acceptable. */
  minFeedbackRating: 3.5,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a stability report from aggregated metrics.
 *
 * In production, `metrics` would be fetched from your analytics store
 * (e.g. a time-series DB, Segment, or a custom /api/monitoring/summary
 * endpoint). Here the function accepts pre-aggregated data so it can be
 * unit-tested and used in CI health checks.
 */
export function generateStabilityReport(
  metrics: AggregatedMetrics
): StabilityReport {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // --- Success rate check ---
  const successRate =
    metrics.totalSessions > 0
      ? metrics.profileCreationSuccessCount / metrics.totalSessions
      : 1;

  if (successRate < THRESHOLDS.minSuccessRate) {
    issues.push(
      `Profile creation success rate is ${(successRate * 100).toFixed(1)}% ` +
        `(threshold: ${THRESHOLDS.minSuccessRate * 100}%).`
    );
    recommendations.push(
      "Investigate API errors and form submission failures in the error log."
    );
  }

  // --- Critical errors ---
  if (metrics.criticalErrorCount > THRESHOLDS.maxCriticalErrors) {
    issues.push(
      `${metrics.criticalErrorCount} critical error(s) detected since last report.`
    );
    recommendations.push(
      "Review critical error stack traces in the monitoring error queue immediately."
    );
  }

  // --- Validation error rate ---
  if (metrics.validationErrorRate > THRESHOLDS.maxValidationErrorRate) {
    issues.push(
      `Validation error rate is ${(metrics.validationErrorRate * 100).toFixed(1)}% ` +
        `(threshold: ${THRESHOLDS.maxValidationErrorRate * 100}%).`
    );
    recommendations.push(
      "Review form field labels and guided prompts — users may be confused by the current UI."
    );
  }

  // --- Performance ---
  if (
    metrics.averageCreationDurationMs > THRESHOLDS.maxAvgCreationDurationMs
  ) {
    issues.push(
      `Average profile creation duration is ${metrics.averageCreationDurationMs} ms ` +
        `(threshold: ${THRESHOLDS.maxAvgCreationDurationMs} ms).`
    );
    recommendations.push(
      "Profile API response times may be degraded — check UserProfileService latency."
    );
  }

  // --- Feedback rating ---
  if (
    metrics.averageFeedbackRating !== null &&
    metrics.feedbackCount >= 10 &&
    metrics.averageFeedbackRating < THRESHOLDS.minFeedbackRating
  ) {
    issues.push(
      `Average user feedback rating is ${metrics.averageFeedbackRating.toFixed(2)} ` +
        `(threshold: ${THRESHOLDS.minFeedbackRating}).`
    );
    recommendations.push(
      "Analyse free-text feedback comments to identify specific UX pain points."
    );
  }

  // --- Determine overall status ---
  let status: StabilityReport["status"] = "STABLE";
  if (metrics.criticalErrorCount > THRESHOLDS.maxCriticalErrors) {
    status = "CRITICAL";
  } else if (issues.length > 0) {
    status = "DEGRADED";
  }

  return {
    generatedAt: new Date().toISOString(),
    status,
    metrics,
    issues,
    recommendations,
  };
}

/**
 * Formats a StabilityReport as a human-readable string suitable for
 * logging, Slack notifications, or CI output.
 */
export function formatStabilityReport(report: StabilityReport): string {
  const lines: string[] = [
    `=== Profile Creation Interface — Stability Report ===`,
    `Generated : ${report.generatedAt}`,
    `Status    : ${report.status}`,
    ``,
    `--- Metrics ---`,
    `  Sessions              : ${report.metrics.totalSessions}`,
    `  Successes             : ${report.metrics.profileCreationSuccessCount}`,
    `  Failures              : ${report.metrics.profileCreationFailureCount}`,
    `  Avg creation time     : ${report.metrics.averageCreationDurationMs} ms`,
    `  Validation error rate : ${(report.metrics.validationErrorRate * 100).toFixed(1)}%`,
    `  Critical errors       : ${report.metrics.criticalErrorCount}`,
    `  Avg feedback rating   : ${
      report.metrics.averageFeedbackRating !== null
        ? report.metrics.averageFeedbackRating.toFixed(2)
        : "N/A"
    } (n=${report.metrics.feedbackCount})`,
  ];

  if (report.issues.length > 0) {
    lines.push(``, `--- Issues ---`);
    report.issues.forEach((issue, i) => lines.push(`  ${i + 1}. ${issue}`));
  }

  if (report.recommendations.length > 0) {
    lines.push(``, `--- Recommendations ---`);
    report.recommendations.forEach((rec, i) =>
      lines.push(`  ${i + 1}. ${rec}`)
    );
  }

  lines.push(``, `=====================================================`);
  return lines.join("\n");
}
