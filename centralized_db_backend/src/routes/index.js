'use strict';

const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const schemaRoutes = require('./schema');
const crudRoutes = require('./crud');
const sqlRoutes = require('./sql');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service health checks
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 db:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 */
router.get('/', healthController.check.bind(healthController));

router.use('/auth', authRoutes);
router.use('/schema', schemaRoutes);
router.use('/data', crudRoutes);
router.use('/sql', sqlRoutes);

module.exports = router;
