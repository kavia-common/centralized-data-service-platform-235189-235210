'use strict';

const { registerUser, loginUser } = require('../services/auth');
const { signAccessToken } = require('../middleware/auth');
const { writeAuditLog } = require('../services/audit');

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res, next) {
    /** Register endpoint: creates user and returns JWT + user. */
    try {
      const { email, password, role } = req.body;

      const user = await registerUser({ email, password, role }, { reqId: req.requestId });

      const token = signAccessToken({ id: user.id, email: user.email, role: user.role });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: user.id,
        actorRole: user.role,
        action: 'auth.register',
        targetType: 'user',
        targetId: String(user.id),
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { email: user.email, role: user.role },
      });

      return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      // Best-effort audit in error path is handled by error middleware centrally.
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Login endpoint: validates credentials and returns JWT + user. */
    try {
      const { email, password } = req.body;

      const user = await loginUser({ email, password }, { reqId: req.requestId });

      const token = signAccessToken({ id: user.id, email: user.email, role: user.role });

      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: user.id,
        actorRole: user.role,
        action: 'auth.login',
        targetType: 'user',
        targetId: String(user.id),
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { email: user.email },
      });

      return res.status(200).json({ token, user });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
