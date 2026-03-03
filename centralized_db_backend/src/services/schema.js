'use strict';

const ApiError = require('../errors/apiError');
const { dbQuery } = require('../db/query');

const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertIdent(name, label) {
  if (!IDENT_RE.test(name)) {
    throw new ApiError(400, `Invalid ${label}`, { code: 'INVALID_IDENTIFIER', details: { name } });
  }
}

function assertColumnType(type) {
  // Allow a conservative subset of types; extend as needed.
  const allowed = new Set(['text', 'int', 'integer', 'bigint', 'boolean', 'timestamptz', 'timestamp', 'date', 'jsonb', 'uuid', 'numeric']);
  const normalized = String(type || '').toLowerCase();
  if (!allowed.has(normalized)) {
    throw new ApiError(400, 'Unsupported column type', { code: 'UNSUPPORTED_COLUMN_TYPE', details: { type } });
  }
  return normalized;
}

// PUBLIC_INTERFACE
async function createTable({ schema = 'public', table, columns }, { reqId, userId } = {}) {
  /** Create a table with validated identifiers. */
  assertIdent(schema, 'schema');
  assertIdent(table, 'table');

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new ApiError(400, 'columns must be a non-empty array', { code: 'INVALID_COLUMNS' });
  }

  const columnSql = columns
    .map((c) => {
      assertIdent(c.name, 'column name');
      const type = assertColumnType(c.type);
      const nullable = c.nullable === false ? 'NOT NULL' : '';
      return `"${c.name}" ${type} ${nullable}`.trim();
    })
    .join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (${columnSql});`;
  await dbQuery(sql, [], { reqId, userId, purpose: 'schema.createTable' });
}

// PUBLIC_INTERFACE
async function addColumn({ schema = 'public', table, column }, { reqId, userId } = {}) {
  /** Add a column to an existing table. */
  assertIdent(schema, 'schema');
  assertIdent(table, 'table');
  if (!column || typeof column !== 'object') {
    throw new ApiError(400, 'column is required', { code: 'INVALID_COLUMN' });
  }
  assertIdent(column.name, 'column name');
  const type = assertColumnType(column.type);
  const nullable = column.nullable === false ? 'NOT NULL' : '';
  const sql = `ALTER TABLE "${schema}"."${table}" ADD COLUMN IF NOT EXISTS "${column.name}" ${type} ${nullable};`;
  await dbQuery(sql, [], { reqId, userId, purpose: 'schema.addColumn' });
}

module.exports = {
  createTable,
  addColumn,
};
