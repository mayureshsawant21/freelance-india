const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
module.exports = router;