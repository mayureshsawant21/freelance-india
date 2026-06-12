const router = require('express').Router();
const { getStats, getUsers } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('admin'), getStats);
router.get('/users', authenticate, authorize('admin'), getUsers);
module.exports = router;