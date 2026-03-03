'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registration and login
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthRegisterRequest:
 *       type: object
 *       required: [email, password, role]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [admin, developer, viewer]
 *     AuthLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *             role:
 *               type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post(
  '/register',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('role').isIn(['admin', 'developer', 'viewer']),
  validate,
  authController.register.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 1 }),
  validate,
  authController.login.bind(authController)
);

module.exports = router;
