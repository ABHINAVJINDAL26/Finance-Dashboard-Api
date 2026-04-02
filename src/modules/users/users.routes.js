const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/authorize');
const { list, getById, create, update, updateStatus, remove } = require('./users.controller');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.patch('/:id/status', updateStatus);
router.delete('/:id', remove);

module.exports = router;
