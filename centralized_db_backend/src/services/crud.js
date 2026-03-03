'use strict';

const ApiError = require('../errors/apiError');
const { dbQuery } = require('../db/query');

const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertIdent(name, label) {
  if (!IDENT_RE.test(name)) {
    throw new ApiError(400, `Invalid ${label}`, { code: 'INVALID_IDENTIFIER', details: { name } });
  }
}

function normalizeSchema(schema) {
  return schema || 'public';
}

// PUBLIC_INTERFACE
async function listRows({ schema, table, limit = 100, offset = 0 }, { reqId, userId } = {}) {
  /** List rows with paging (no dynamic filters in v1). */
  const s = normalizeSchema(schema);
  assertIdent(s, 'schema');
  assertIdent(table, 'table');

  const lim = Math.min(Math.max(Number(limit) || 0, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const result = await dbQuery(
    `SELECT * FROM "${s}"."${table}" LIMIT $1 OFFSET $2`,
    [lim, off],
    { reqId, userId, purpose: 'crud.list' }
  );
  return result.rows;
}

// PUBLIC_INTERFACE
async function getRow({ schema, table, idColumn = 'id', id }, { reqId, userId } = {}) {
  /** Get row by id. */
  const s = normalizeSchema(schema);
  assertIdent(s, 'schema');
  assertIdent(table, 'table');
  assertIdent(idColumn, 'idColumn');

  const result = await dbQuery(
    `SELECT * FROM "${s}"."${table}" WHERE "${idColumn}" = $1 LIMIT 1`,
    [id],
    { reqId, userId, purpose: 'crud.get' }
  );
  return result.rows[0] || null;
}

// PUBLIC_INTERFACE
async function insertRow({ schema, table, data }, { reqId, userId } = {}) {
  /** Insert a row from an object of column->value. */
  const s = normalizeSchema(schema);
  assertIdent(s, 'schema');
  assertIdent(table, 'table');

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(400, 'data must be an object', { code: 'INVALID_DATA' });
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new ApiError(400, 'data must not be empty', { code: 'INVALID_DATA' });
  }
  keys.forEach((k) => assertIdent(k, 'column'));

  const cols = keys.map((k) => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map((k) => data[k]);

  const result = await dbQuery(
    `INSERT INTO "${s}"."${table}" (${cols}) VALUES (${placeholders}) RETURNING *`,
    values,
    { reqId, userId, purpose: 'crud.insert' }
  );
  return result.rows[0];
}

// PUBLIC_INTERFACE
async function updateRow({ schema, table, idColumn = 'id', id, data }, { reqId, userId } = {}) {
  /** Update a row by id. */
  const s = normalizeSchema(schema);
  assertIdent(s, 'schema');
  assertIdent(table, 'table');
  assertIdent(idColumn, 'idColumn');

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(400, 'data must be an object', { code: 'INVALID_DATA' });
  }
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new ApiError(400, 'data must not be empty', { code: 'INVALID_DATA' });
  }
  keys.forEach((k) => assertIdent(k, 'column'));

  const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
  const values = keys.map((k) => data[k]);
  values.push(id);

  const result = await dbQuery(
    `UPDATE "${s}"."${table}" SET ${sets} WHERE "${idColumn}" = $${keys.length + 1} RETURNING *`,
    values,
    { reqId, userId, purpose: 'crud.update' }
  );
  return result.rows[0] || null;
}

// PUBLIC_INTERFACE
async function deleteRow({ schema, table, idColumn = 'id', id }, { reqId, userId } = {}) {
  /** Delete row by id. */
  const s = normalizeSchema(schema);
  assertIdent(s, 'schema');
  assertIdent(table, 'table');
  assertIdent(idColumn, 'idColumn');

  const result = await dbQuery(
    `DELETE FROM "${s}"."${table}" WHERE "${idColumn}" = $1 RETURNING *`,
    [id],
    { reqId, userId, purpose: 'crud.delete' }
  );
  return result.rows[0] || null;
}

module.exports = {
  listRows,
  getRow,
  insertRow,
  updateRow,
  deleteRow,
};
