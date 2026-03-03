'use strict';

const express = require('express');
const { body } = require('express-validator');
const schemaController = require('../controllers/schema');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Schema
 *     description: Dynamic schema management (DDL). Admin only.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTableRequest:
 *       type: object
 *       required: [table, columns]
 *       properties:
 *         schema:
 *           type: string
 *           example: public
 *         table:
 *           type: string
 *           example: projects
 *         columns:
 *           type: array
 *           items:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: text
 *               nullable:
 *                 type: boolean
 *     AddColumnRequest:
 *       type: object
 *       required: [table, column]
 *       properties:
 *         schema:
 *           type: string
 *         table:
 *           type: string
 *         column:
 *           type: object
 *           required: [name, type]
 *           properties:
 *             name:
 *               type: string
 *             type:
 *               type: string
 *             nullable:
 *               type: boolean
 */

/**
 * @swagger
 * /schema/tables:
 *   post:
 *     tags: [Schema]
 *     summary: Create a table
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTableRequest'
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/tables',
  requireAuth,
  requireRole('admin'),
  body('schema').optional().isString(),
  body('table').isString().isLength({ min: 1 }),
  body('columns').isArray({ min: 1 }),
  validate,
  schemaController.createTable.bind(schemaController)
);

/**
 * @swagger
 * /schema/columns:
 *   post:
 *     tags: [Schema]
 *     summary: Add a column to a table
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddColumnRequest'
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/columns',
  requireAuth,
  requireRole('admin'),
  body('schema').optional().isString(),
  body('table').isString().isLength({ min: 1 }),
  body('column').isObject(),
  body('column.name').isString().isLength({ min: 1 }),
  body('column.type').isString().isLength({ min: 1 }),
  body('column.nullable').optional().isBoolean(),
  validate,
  schemaController.addColumn.bind(schemaController)
);

module.exports = router;
