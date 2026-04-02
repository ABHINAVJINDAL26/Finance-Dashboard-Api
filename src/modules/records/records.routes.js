const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/authorize');
const { list, getById, create, update, remove } = require('./records.controller');

const router = Router();

router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, authorize('ADMIN'), create);
router.patch('/:id', authenticate, authorize('ADMIN'), update);
router.delete('/:id', authenticate, authorize('ADMIN'), remove);

module.exports = router;
