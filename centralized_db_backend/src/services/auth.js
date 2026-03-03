'use strict';

const bcrypt = require('bcrypt');
const ApiError = require('../errors/apiError');
const { dbQuery } = require('../db/query');

const SALT_ROUNDS = 12;

// PUBLIC_INTERFACE
async function registerUser({ email, password, role }, { reqId } = {}) {
  /** Register a user with bcrypt password hashing. */
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await dbQuery(
      `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `,
      [email.toLowerCase(), passwordHash, role],
      { reqId, purpose: 'auth.register' }
    );
    return result.rows[0];
  } catch (err) {
    // Unique violation
    if (err && err.code === '23505') {
      throw new ApiError(409, 'Email already registered', { code: 'EMAIL_EXISTS' });
    }
    throw err;
  }
}

// PUBLIC_INTERFACE
async function loginUser({ email, password }, { reqId } = {}) {
  /** Validate credentials and return user if ok. */
  const result = await dbQuery(
    `
    SELECT id, email, role, password_hash
    FROM users
    WHERE email = $1
  `,
    [email.toLowerCase()],
    { reqId, purpose: 'auth.login.lookup' }
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, 'Invalid credentials', { code: 'INVALID_CREDENTIALS' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials', { code: 'INVALID_CREDENTIALS' });
  }

  return { id: user.id, email: user.email, role: user.role };
}

module.exports = {
  registerUser,
  loginUser,
};
