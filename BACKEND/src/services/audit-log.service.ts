/**
 * audit-log.service.ts
 *
 * Fire-and-forget audit trail for sensitive read access (e.g. US-001: viewing
 * account info). Logging must never block or fail the request it's auditing,
 * so logAccess is synchronous-looking but internally deferred, and swallows
 * its own errors. Only userId/action/ip are recorded — no additional PII.
 */

export interface AuditLogService {
  logAccess(userId: string, action: string, ip: string): void;
}

export class ConsoleAuditLogService implements AuditLogService {
  logAccess(userId: string, action: string, ip: string): void {
    setImmediate(() => {
      try {
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            userId,
            action,
            ip: ip || 'unknown',
          }),
        );
      } catch (err) {
        console.error('[AuditLogService] Failed to record audit log entry:', err);
      }
    });
  }
}
