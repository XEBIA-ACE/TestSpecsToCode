/**
 * monitoringService.ts
 *
 * Post-deployment monitoring service for the Profile Creation Interface.
 * Tracks UI events, errors, and performance metrics. Feeds data into
 * the feedback loop described in constitution.md (Continuous Feedback Loop).
 *
 * Acceptance criteria addressed:
 *  - Monitoring tools are set up and active.
 *  - Stable usage patterns with no critical issues are confirmed.
 */

export type EventCategory =
  | "profile_creation"
  | "form_validation"
  | "navigation"
  | "error"
  | "performance";

export interface MonitoringEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface PerformanceMetric {
  metricName: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  timestamp: number;
  sessionId: string;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let _sessionId: string = generateSessionId();
let _userId: string | undefined;
let _isActive = false;
let _eventQueue: MonitoringEvent[] = [];
let _errorQueue: ErrorReport[] = [];
let _performanceQueue: PerformanceMetric[] = [];

// Pluggable flush handler — replace in production with your analytics endpoint
let _flushHandler: (
  events: MonitoringEvent[],
  errors: ErrorReport[],
  metrics: PerformanceMetric[]
) => Promise<void> = defaultFlushHandler;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the monitoring service.
 * Must be called once at application startup (e.g. in main.tsx / index.tsx).
 */
export function initMonitoring(options: {
  userId?: string;
  flushHandler?: typeof _flushHandler;
  flushIntervalMs?: number;
}): void {
  _userId = options.userId;
  _isActive = true;

  if (options.flushHandler) {
    _flushHandler = options.flushHandler;
  }

  const intervalMs = options.flushIntervalMs ?? 30_000; // default: flush every 30 s
  setInterval(flushQueues, intervalMs);

  // Flush remaining events when the user leaves the page
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      flushQueues();
    });
  }

  trackEvent({
    category: "profile_creation",
    action: "monitoring_initialised",
    label: "session_start",
  });
}

/** Update the authenticated user id after login. */
export function setMonitoringUser(userId: string): void {
  _userId = userId;
}

/** Track a UI interaction or lifecycle event. */
export function trackEvent(
  event: Omit<MonitoringEvent, "timestamp" | "sessionId" | "userId">
): void {
  if (!_isActive) return;

  _eventQueue.push({
    ...event,
    timestamp: Date.now(),
    sessionId: _sessionId,
    userId: _userId,
  });
}

/** Report a caught or uncaught error. */
export function reportError(
  error: Error | string,
  options: {
    componentName?: string;
    severity?: ErrorReport["severity"];
    userId?: string;
  } = {}
): void {
  const report: ErrorReport = {
    message: typeof error === "string" ? error : error.message,
    stack: typeof error === "object" ? error.stack : undefined,
    componentName: options.componentName,
    timestamp: Date.now(),
    sessionId: _sessionId,
    userId: options.userId ?? _userId,
    severity: options.severity ?? "medium",
  };

  _errorQueue.push(report);

  // Critical errors are flushed immediately
  if (report.severity === "critical") {
    flushQueues();
  }
}

/** Record a performance measurement (e.g. form render time, API latency). */
export function recordMetric(
  metric: Omit<PerformanceMetric, "timestamp" | "sessionId">
): void {
  if (!_isActive) return;

  _performanceQueue.push({
    ...metric,
    timestamp: Date.now(),
    sessionId: _sessionId,
  });
}

/** Manually flush all queued data to the analytics backend. */
export async function flushQueues(): Promise<void> {
  if (
    _eventQueue.length === 0 &&
    _errorQueue.length === 0 &&
    _performanceQueue.length === 0
  ) {
    return;
  }

  const events = [..._eventQueue];
  const errors = [..._errorQueue];
  const metrics = [..._performanceQueue];

  // Clear queues before async flush to avoid double-sending
  _eventQueue = [];
  _errorQueue = [];
  _performanceQueue = [];

  try {
    await _flushHandler(events, errors, metrics);
  } catch (err) {
    // Re-queue on failure so data is not lost
    _eventQueue = [...events, ..._eventQueue];
    _errorQueue = [...errors, ..._errorQueue];
    _performanceQueue = [...metrics, ..._performanceQueue];
    console.error("[MonitoringService] Flush failed:", err);
  }
}

/** Returns a snapshot of the current queue sizes (useful for health checks). */
export function getQueueStatus(): {
  events: number;
  errors: number;
  metrics: number;
  isActive: boolean;
  sessionId: string;
} {
  return {
    events: _eventQueue.length,
    errors: _errorQueue.length,
    metrics: _performanceQueue.length,
    isActive: _isActive,
    sessionId: _sessionId,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Default flush handler — logs to console in development.
 * Replace with a real analytics endpoint (e.g. Segment, Mixpanel, custom API)
 * by passing a custom flushHandler to initMonitoring().
 */
async function defaultFlushHandler(
  events: MonitoringEvent[],
  errors: ErrorReport[],
  metrics: PerformanceMetric[]
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    if (events.length) console.debug("[Monitoring] Events:", events);
    if (errors.length) console.warn("[Monitoring] Errors:", errors);
    if (metrics.length) console.debug("[Monitoring] Metrics:", metrics);
  }
  // TODO: Replace with real HTTP POST to analytics endpoint, e.g.:
  // await fetch("/api/monitoring/ingest", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ events, errors, metrics }),
  // });
}
