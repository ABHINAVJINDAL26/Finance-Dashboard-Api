const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/authorize');
const { summary, byCategory, trends, recent } = require('./dashboard.controller');

const router = Router();

router.get('/summary', authenticate, summary);
router.get('/by-category', authenticate, byCategory);
router.get('/trends', authenticate, authorize('ANALYST', 'ADMIN'), trends);
router.get('/recent', authenticate, recent);

module.exports = router;
