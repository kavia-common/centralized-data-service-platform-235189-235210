'use strict';

const { executeValidatedSql } = require('../services/sqlExec');
const { writeAuditLog } = require('../services/audit');

class SqlController {
  // PUBLIC_INTERFACE
  async execute(req, res, next) {
    /** Execute a validated SQL statement (developer+). */
    try {
      const { sql, params } = req.body;
      const result = await executeValidatedSql({ sql, params }, { reqId: req.requestId, userId: req.user.id });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'sql.execute',
        targetType: 'sql',
        targetId: null,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { sql, params, rowCount: result.rowCount },
      });

      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new SqlController();
