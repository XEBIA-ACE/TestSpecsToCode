/**
 * UserFeedbackWidget.tsx
 *
 * Lightweight in-app feedback widget for the Profile Creation Interface.
 * Collects qualitative user feedback post-profile-creation and feeds it
 * into the monitoring pipeline.
 *
 * Acceptance criteria addressed:
 *  - Adjustments to UI are made based on real user feedback
 *    (widget captures ratings + free-text comments and emits them as
 *     monitoring events so the team can act on them).
 */

import React, { useState, useCallback } from "react";
import { trackEvent, reportError } from "./monitoringService";

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackPayload {
  rating: FeedbackRating;
  comment: string;
  context: string; // e.g. "profile_creation"
  submittedAt: number;
}

interface UserFeedbackWidgetProps {
  /** Logical context label sent with the feedback event. */
  context?: string;
  /** Called after the user successfully submits feedback. */
  onSubmitted?: (payload: FeedbackPayload) => void;
  /** Called when the user dismisses the widget without submitting. */
  onDismissed?: () => void;
}

/**
 * Renders a star-rating + optional comment form.
 * Submits feedback as a monitoring event and optionally POSTs to an API.
 */
export const UserFeedbackWidget: React.FC<UserFeedbackWidgetProps> = ({
  context = "profile_creation",
  onSubmitted,
  onDismissed,
}) => {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (rating === null) {
        setError("Please select a rating before submitting.");
        return;
      }

      setSubmitting(true);
      setError(null);

      const payload: FeedbackPayload = {
        rating,
        comment: comment.trim(),
        context,
        submittedAt: Date.now(),
      };

      try {
        // Emit as a monitoring event so it appears in the analytics stream
        trackEvent({
          category: "profile_creation",
          action: "user_feedback_submitted",
          label: context,
          value: rating,
          metadata: { comment: payload.comment },
        });

        // TODO: POST to feedback API endpoint when available, e.g.:
        // await fetch("/api/feedback", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });

        setSubmitted(true);
        onSubmitted?.(payload);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Feedback submission failed.";
        setError(message);
        reportError(err instanceof Error ? err : new Error(message), {
          componentName: "UserFeedbackWidget",
          severity: "low",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [rating, comment, context, onSubmitted]
  );

  const handleDismiss = useCallback(() => {
    trackEvent({
      category: "profile_creation",
      action: "user_feedback_dismissed",
      label: context,
    });
    onDismissed?.();
  }, [context, onDismissed]);

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={styles.container}
        data-testid="feedback-thank-you"
      >
        <p style={styles.thankYou}>
          Thank you for your feedback! We use it to improve the profile
          creation experience.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="feedback-widget">
      <form onSubmit={handleSubmit} noValidate aria-label="Profile creation feedback">
        <h3 style={styles.heading}>How was your profile creation experience?</h3>

        {/* Star rating */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Rating (required)</legend>
          <div style={styles.stars} role="group" aria-label="Star rating">
            {([1, 2, 3, 4, 5] as FeedbackRating[]).map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating === star}
                onClick={() => setRating(star)}
                style={{
                  ...styles.starButton,
                  color: rating !== null && star <= rating ? "#f5a623" : "#ccc",
                }}
                data-testid={`star-${star}`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        {/* Optional comment */}
        <label htmlFor="feedback-comment" style={styles.label}>
          Additional comments (optional)
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what we can improve…"
          maxLength={500}
          rows={3}
          style={styles.textarea}
          data-testid="feedback-comment"
        />

        {error && (
          <p role="alert" style={styles.errorText} data-testid="feedback-error">
            {error}
          </p>
        )}

        <div style={styles.actions}>
          <button
            type="submit"
            disabled={submitting}
            style={styles.submitButton}
            data-testid="feedback-submit"
          >
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            style={styles.dismissButton}
            data-testid="feedback-dismiss"
          >
            Dismiss
          </button>
        </div>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Minimal inline styles (replace with CSS modules / Tailwind as appropriate)
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.25rem",
    maxWidth: 420,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  heading: {
    margin: "0 0 0.75rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1a202c",
  },
  fieldset: {
    border: "none",
    padding: 0,
    margin: "0 0 0.75rem",
  },
  legend: {
    fontSize: "0.875rem",
    color: "#4a5568",
    marginBottom: "0.25rem",
  },
  stars: {
    display: "flex",
    gap: "0.25rem",
  },
  starButton: {
    background: "none",
    border: "none",
    fontSize: "1.75rem",
    cursor: "pointer",
    padding: "0 0.1rem",
    lineHeight: 1,
    transition: "color 0.15s",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    color: "#4a5568",
    marginBottom: "0.25rem",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #cbd5e0",
    borderRadius: 4,
    fontSize: "0.875rem",
    resize: "vertical",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "0.8rem",
    margin: "0.5rem 0 0",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
  },
  submitButton: {
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  dismissButton: {
    background: "none",
    color: "#718096",
    border: "1px solid #cbd5e0",
    borderRadius: 4,
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  thankYou: {
    color: "#276749",
    fontWeight: 500,
    margin: 0,
  },
};

export default UserFeedbackWidget;
