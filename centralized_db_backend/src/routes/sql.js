'use strict';

const express = require('express');
const { body } = require('express-validator');
const sqlController = require('../controllers/sql');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: SQL
 *     description: Validated SQL execution (Developer+)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SqlExecuteRequest:
 *       type: object
 *       required: [sql]
 *       properties:
 *         sql:
 *           type: string
 *           example: SELECT 1
 *         params:
 *           type: array
 *           items: {}
 *     SqlExecuteResponse:
 *       type: object
 *       properties:
 *         rowCount:
 *           type: integer
 *         rows:
 *           type: array
 *           items: {}
 */

/**
 * @swagger
 * /sql/execute:
 *   post:
 *     tags: [SQL]
 *     summary: Execute validated SQL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SqlExecuteRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SqlExecuteResponse'
 */
router.post(
  '/execute',
  requireAuth,
  requireRole('developer'),
  body('sql').isString().isLength({ min: 1, max: 20000 }),
  body('params').optional().isArray(),
  validate,
  sqlController.execute.bind(sqlController)
);

module.exports = router;
