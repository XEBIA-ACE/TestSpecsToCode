/**
 * index.ts
 *
 * Public barrel export for the monitoring module.
 * Import from here rather than individual files.
 *
 * Usage:
 *   import { initMonitoring, useProfileMonitoring, UserFeedbackWidget } from "./monitoring";
 */

export {
  initMonitoring,
  setMonitoringUser,
  trackEvent,
  reportError,
  recordMetric,
  flushQueues,
  getQueueStatus,
} from "./monitoringService";

export type {
  MonitoringEvent,
  ErrorReport,
  PerformanceMetric,
  EventCategory,
} from "./monitoringService";

export { useProfileMonitoring } from "./useProfileMonitoring";
export type { ProfileMonitoringHook } from "./useProfileMonitoring";

export { UserFeedbackWidget } from "./UserFeedbackWidget";
export type { FeedbackPayload, FeedbackRating } from "./UserFeedbackWidget";

export {
  generateStabilityReport,
  formatStabilityReport,
} from "./monitoringDashboard";

export type {
  AggregatedMetrics,
  StabilityReport,
} from "./monitoringDashboard";
