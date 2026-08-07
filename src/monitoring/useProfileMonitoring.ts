/**
 * useProfileMonitoring.ts
 *
 * React hook that wires the Profile Creation Interface to the monitoring
 * service. Tracks form interactions, validation errors, submission outcomes,
 * and render performance.
 *
 * Acceptance criteria addressed:
 *  - Monitoring tools are set up and active (hook auto-tracks on mount).
 *  - Stable usage patterns with no critical issues are confirmed
 *    (tracks success / failure rates).
 */

import { useCallback, useEffect, useRef } from "react";
import {
  trackEvent,
  reportError,
  recordMetric,
} from "./monitoringService";

export interface ProfileMonitoringHook {
  /** Call when the user starts filling in the profile form. */
  trackFormStart: () => void;
  /** Call on every field change to track engagement. */
  trackFieldChange: (fieldName: string) => void;
  /** Call when client-side validation fails for a field. */
  trackValidationError: (fieldName: string, errorMessage: string) => void;
  /** Call just before the form is submitted. */
  trackFormSubmitAttempt: () => void;
  /** Call when the profile is successfully created. */
  trackProfileCreated: (userId?: string) => void;
  /** Call when profile creation fails (API or network error). */
  trackProfileCreationError: (error: Error | string) => void;
}

/**
 * Hook for monitoring the Profile Creation Interface.
 *
 * @param componentName - Identifies the component in error reports.
 */
export function useProfileMonitoring(
  componentName = "ProfileCreationInterface"
): ProfileMonitoringHook {
  const mountTimeRef = useRef<number>(Date.now());

  // Track component mount / unmount lifecycle
  useEffect(() => {
    const mountTime = Date.now();
    mountTimeRef.current = mountTime;

    trackEvent({
      category: "profile_creation",
      action: "component_mounted",
      label: componentName,
    });

    return () => {
      recordMetric({
        metricName: "profile_form_session_duration",
        value: Date.now() - mountTime,
        unit: "ms",
      });

      trackEvent({
        category: "profile_creation",
        action: "component_unmounted",
        label: componentName,
      });
    };
  }, [componentName]);

  const trackFormStart = useCallback(() => {
    trackEvent({
      category: "profile_creation",
      action: "form_started",
      label: componentName,
      value: Date.now() - mountTimeRef.current, // ms since mount
    });
  }, [componentName]);

  const trackFieldChange = useCallback(
    (fieldName: string) => {
      trackEvent({
        category: "profile_creation",
        action: "field_changed",
        label: fieldName,
        metadata: { component: componentName },
      });
    },
    [componentName]
  );

  const trackValidationError = useCallback(
    (fieldName: string, errorMessage: string) => {
      trackEvent({
        category: "form_validation",
        action: "validation_error",
        label: fieldName,
        metadata: { errorMessage, component: componentName },
      });
    },
    [componentName]
  );

  const trackFormSubmitAttempt = useCallback(() => {
    trackEvent({
      category: "profile_creation",
      action: "form_submit_attempted",
      label: componentName,
    });
  }, [componentName]);

  const trackProfileCreated = useCallback(
    (userId?: string) => {
      const duration = Date.now() - mountTimeRef.current;

      trackEvent({
        category: "profile_creation",
        action: "profile_created_success",
        label: componentName,
        value: duration,
        metadata: { userId },
      });

      recordMetric({
        metricName: "profile_creation_duration",
        value: duration,
        unit: "ms",
      });
    },
    [componentName]
  );

  const trackProfileCreationError = useCallback(
    (error: Error | string) => {
      reportError(error, {
        componentName,
        severity: "high",
      });

      trackEvent({
        category: "error",
        action: "profile_creation_failed",
        label: componentName,
        metadata: {
          errorMessage:
            typeof error === "string" ? error : error.message,
        },
      });
    },
    [componentName]
  );

  return {
    trackFormStart,
    trackFieldChange,
    trackValidationError,
    trackFormSubmitAttempt,
    trackProfileCreated,
    trackProfileCreationError,
  };
}
