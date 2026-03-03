'use strict';

const express = require('express');
const { param, query } = require('express-validator');
const crudController = require('../controllers/crud');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CRUD
 *     description: Generic CRUD operations (Developer+)
 */

/**
 * @swagger
 * /data/{schema}/{table}:
 *   get:
 *     tags: [CRUD]
 *     summary: List rows
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schema
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: table
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/:schema/:table',
  requireAuth,
  requireRole('developer'),
  param('schema').isString(),
  param('table').isString(),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  crudController.list.bind(crudController)
);

/**
 * @swagger
 * /data/{schema}/{table}/{id}:
 *   get:
 *     tags: [CRUD]
 *     summary: Get row by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schema
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: table
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get(
  '/:schema/:table/:id',
  requireAuth,
  requireRole('developer'),
  param('schema').isString(),
  param('table').isString(),
  param('id').isString(),
  validate,
  crudController.get.bind(crudController)
);

/**
 * @swagger
 * /data/{schema}/{table}:
 *   post:
 *     tags: [CRUD]
 *     summary: Insert a row
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schema
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: table
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/:schema/:table',
  requireAuth,
  requireRole('developer'),
  param('schema').isString(),
  param('table').isString(),
  validate,
  crudController.insert.bind(crudController)
);

/**
 * @swagger
 * /data/{schema}/{table}/{id}:
 *   put:
 *     tags: [CRUD]
 *     summary: Update a row by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schema
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: table
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.put(
  '/:schema/:table/:id',
  requireAuth,
  requireRole('developer'),
  param('schema').isString(),
  param('table').isString(),
  param('id').isString(),
  validate,
  crudController.update.bind(crudController)
);

/**
 * @swagger
 * /data/{schema}/{table}/{id}:
 *   delete:
 *     tags: [CRUD]
 *     summary: Delete a row by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schema
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: table
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete(
  '/:schema/:table/:id',
  requireAuth,
  requireRole('developer'),
  param('schema').isString(),
  param('table').isString(),
  param('id').isString(),
  validate,
  crudController.remove.bind(crudController)
);

module.exports = router;
