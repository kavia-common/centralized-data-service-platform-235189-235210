'use strict';

const { createTable, addColumn } = require('../services/schema');
const { writeAuditLog } = require('../services/audit');

class SchemaController {
  // PUBLIC_INTERFACE
  async createTable(req, res, next) {
    /** Create table endpoint (admin only). */
    try {
      const { schema, table, columns } = req.body;

      await createTable({ schema, table, columns }, { reqId: req.requestId, userId: req.user.id });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'schema.createTable',
        targetType: 'table',
        targetId: `${schema || 'public'}.${table}`,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { schema: schema || 'public', table, columns },
      });

      return res.status(201).json({ status: 'ok' });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async addColumn(req, res, next) {
    /** Add column endpoint (admin only). */
    try {
      const { schema, table, column } = req.body;

      await addColumn({ schema, table, column }, { reqId: req.requestId, userId: req.user.id });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'schema.addColumn',
        targetType: 'table',
        targetId: `${schema || 'public'}.${table}`,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { schema: schema || 'public', table, column },
      });

      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new SchemaController();
