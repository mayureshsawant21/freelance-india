const router = require('express').Router();
const { initiateConnection, getUserConnections } = require('../controllers/connectionController');
const { authenticate } = require('../middleware/auth');
const checkConnectCredits = require('../middleware/creditCheck');

router.post('/initiate', authenticate, checkConnectCredits, initiateConnection);
router.get('/', authenticate, getUserConnections);
module.exports = router;