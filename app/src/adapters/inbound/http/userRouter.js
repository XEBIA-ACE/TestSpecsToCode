'use strict';

const { Router } = require('express');
const UserService = require('../../../application/userService');
const PostgresUserRepository = require('../../outbound/db/postgresUserRepository');
const NodemailerEmailService = require('../../outbound/email/nodemailerEmailService');
const {
  validate,
  registerRules,
  loginRules,
  verifyOtpRules,
  resendOtpRules,
  userIdRules,
} = require('./validators');

// ── Dependency wiring (composition root) ──────────────────────────────────
const userRepository = new PostgresUserRepository();
const emailService = new NodemailerEmailService();
const userService = new UserService({ userRepository, emailService });

const router = Router();

// ── POST /api/v1/users/register ────────────────────────────────────────────
router.post('/register', registerRules, validate, async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/users/login ───────────────────────────────────────────────
router.post('/login', loginRules, validate, async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/users/verify-otp ─────────────────────────────────────────
router.post('/verify-otp', verifyOtpRules, validate, async (req, res, next) => {
  try {
    const user = await userService.verifyOtp(req.body);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/v1/users/resend-otp ─────────────────────────────────────────
router.post('/resend-otp', resendOtpRules, validate, async (req, res, next) => {
  try {
    await userService.resendOtp(req.body);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/v1/users/:id ──────────────────────────────────────────────────
router.get('/:id', userIdRules, validate, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/v1/users/:id ───────────────────────────────────────────────
router.delete('/:id', userIdRules, validate, async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
