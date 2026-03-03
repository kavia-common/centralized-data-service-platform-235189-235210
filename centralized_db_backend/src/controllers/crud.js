'use strict';

const { listRows, getRow, insertRow, updateRow, deleteRow } = require('../services/crud');
const { writeAuditLog } = require('../services/audit');
const ApiError = require('../errors/apiError');

class CrudController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** List rows in table (developer+). */
    try {
      const { schema, table } = req.params;
      const { limit, offset } = req.query;

      const rows = await listRows({ schema, table, limit, offset }, { reqId: req.requestId, userId: req.user.id });

      return res.status(200).json({ rows });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async get(req, res, next) {
    /** Get row by ID (developer+). */
    try {
      const { schema, table, id } = req.params;
      const row = await getRow({ schema, table, id }, { reqId: req.requestId, userId: req.user.id });
      if (!row) {
        throw new ApiError(404, 'Not found', { code: 'NOT_FOUND' });
      }
      return res.status(200).json({ row });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async insert(req, res, next) {
    /** Insert row (developer+). */
    try {
      const { schema, table } = req.params;
      const row = await insertRow({ schema, table, data: req.body }, { reqId: req.requestId, userId: req.user.id });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'crud.insert',
        targetType: 'table',
        targetId: `${schema || 'public'}.${table}`,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { inserted: row },
      });

      return res.status(201).json({ row });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Update row by ID (developer+). */
    try {
      const { schema, table, id } = req.params;
      const row = await updateRow({ schema, table, id, data: req.body }, { reqId: req.requestId, userId: req.user.id });
      if (!row) {
        throw new ApiError(404, 'Not found', { code: 'NOT_FOUND' });
      }

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'crud.update',
        targetType: 'table',
        targetId: `${schema || 'public'}.${table}`,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { id, updated: row },
      });

      return res.status(200).json({ row });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Delete row by ID (developer+). */
    try {
      const { schema, table, id } = req.params;
      const row = await deleteRow({ schema, table, id }, { reqId: req.requestId, userId: req.user.id });
      if (!row) {
        throw new ApiError(404, 'Not found', { code: 'NOT_FOUND' });
      }

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'crud.delete',
        targetType: 'table',
        targetId: `${schema || 'public'}.${table}`,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { id, deleted: row },
      });

      return res.status(200).json({ row });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new CrudController();
