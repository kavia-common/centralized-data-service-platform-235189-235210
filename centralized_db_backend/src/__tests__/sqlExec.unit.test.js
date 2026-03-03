'use strict';

const { executeValidatedSql } = require('../services/sqlExec');

jest.mock('../db/query', () => ({
  dbQuery: jest.fn(async () => ({ rows: [{ ok: 1 }], rowCount: 1 })),
}));

describe('executeValidatedSql safeguards', () => {
  test('allows SELECT single statement', async () => {
    const res = await executeValidatedSql({ sql: 'SELECT 1', params: [] }, { reqId: 'r1', userId: 1 });
    expect(res.rowCount).toBe(1);
  });

  test('rejects multiple statements', async () => {
    await expect(executeValidatedSql({ sql: 'SELECT 1; SELECT 2', params: [] })).rejects.toMatchObject({
      statusCode: 400,
      code: 'SQL_MULTIPLE_STATEMENTS',
    });
  });

  test('rejects disallowed op', async () => {
    await expect(executeValidatedSql({ sql: 'CREATE TABLE x(id int)', params: [] })).rejects.toMatchObject({
      statusCode: 400,
      code: 'SQL_OP_NOT_ALLOWED',
    });
  });

  test('rejects blocked keywords', async () => {
    await expect(executeValidatedSql({ sql: 'SELECT * FROM information_schema.tables', params: [] })).rejects.toMatchObject({
      statusCode: 400,
      code: 'SQL_BLOCKED',
    });
  });

  test('requires placeholders when params supplied', async () => {
    await expect(executeValidatedSql({ sql: 'SELECT 1', params: [123] })).rejects.toMatchObject({
      statusCode: 400,
      code: 'SQL_PARAMS_PLACEHOLDER_REQUIRED',
    });
  });
});
