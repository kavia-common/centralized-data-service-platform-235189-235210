'use strict';

const { dbQuery } = require('../db/query');

// PUBLIC_INTERFACE
async function writeAuditLog({
  requestId,
  actorUserId,
  actorRole,
  action,
  targetType,
  targetId,
  success,
  ip,
  userAgent,
  metadata,
}) {
  /** Write an audit log record. */
  await dbQuery(
    `
    INSERT INTO audit_log
      (request_id, actor_user_id, actor_role, action, target_type, target_id, success, ip, user_agent, metadata)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `,
    [
      requestId || null,
      actorUserId || null,
      actorRole || null,
      action,
      targetType || null,
      targetId || null,
      Boolean(success),
      ip || null,
      userAgent || null,
      metadata ? JSON.stringify(metadata) : null,
    ],
    { reqId: requestId, userId: actorUserId, purpose: 'audit.insert' }
  );
}

module.exports = { writeAuditLog };
