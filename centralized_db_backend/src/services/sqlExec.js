'use strict';

const ApiError = require('../errors/apiError');
const { dbQuery } = require('../db/query');

function isSingleStatement(sql) {
  // Basic safeguard: reject semicolons other than optional trailing.
  const trimmed = String(sql || '').trim();
  if (!trimmed) return false;
  const noTrailing = trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed;
  return !noTrailing.includes(';');
}

function classify(sql) {
  const s = String(sql || '').trim().toLowerCase();
  const first = s.split(/\s+/)[0];
  return first;
}

function containsDangerous(sql) {
  const s = String(sql || '').toLowerCase();
  // Conservative block list.
  const blocked = ['drop ', 'truncate ', 'alter ', 'create ', 'grant ', 'revoke ', 'copy ', 'vacuum ', 'analyze ', 'pg_', 'information_schema'];
  return blocked.some((b) => s.includes(b));
}

// PUBLIC_INTERFACE
async function executeValidatedSql({ sql, params = [] }, { reqId, userId } = {}) {
  /**
   * Execute a validated SQL statement.
   * Safeguards:
   * - single statement only
   * - only SELECT/INSERT/UPDATE/DELETE
   * - block dangerous keywords/schemas
   * - require parameter placeholders if params are provided
   */
  if (!isSingleStatement(sql)) {
    throw new ApiError(400, 'Only single SQL statements are allowed', { code: 'SQL_MULTIPLE_STATEMENTS' });
  }

  const op = classify(sql);
  const allowedOps = new Set(['select', 'insert', 'update', 'delete']);
  if (!allowedOps.has(op)) {
    throw new ApiError(400, 'Only SELECT/INSERT/UPDATE/DELETE are allowed', { code: 'SQL_OP_NOT_ALLOWED', details: { op } });
  }

  if (containsDangerous(sql)) {
    throw new ApiError(400, 'SQL contains blocked keywords/schemas', { code: 'SQL_BLOCKED' });
  }

  if (!Array.isArray(params)) {
    throw new ApiError(400, 'params must be an array', { code: 'INVALID_PARAMS' });
  }

  // If params are given, ensure at least one placeholder exists.
  if (params.length > 0 && !/\$\d+/.test(sql)) {
    throw new ApiError(400, 'Parameterized queries must use $1, $2... placeholders', { code: 'SQL_PARAMS_PLACEHOLDER_REQUIRED' });
  }

  const result = await dbQuery(sql, params, { reqId, userId, purpose: 'sql.execute' });
  return { rows: result.rows, rowCount: result.rowCount };
}

module.exports = { executeValidatedSql };
