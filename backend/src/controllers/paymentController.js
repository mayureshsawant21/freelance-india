const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order, CreditPackage, Freelancer, Employer } = require('../models');
const { sequelize } = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  const { packageId } = req.body;
  const pkg = await CreditPackage.findByPk(packageId);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  const options = {
    amount: pkg.price_inr * 100, // paisa
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  };
  const razorpayOrder = await razorpay.orders.create(options);

  const order = await Order.create({
    user_id: req.user.id,
    package_id: packageId,
    razorpay_order_id: razorpayOrder.id,
    amount: pkg.price_inr,
    credits_awarded: pkg.credits
  });

  res.json({ orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: pkg.price_inr });
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  const transaction = await sequelize.transaction();
  try {
    if (expectedSign !== razorpay_signature) throw new Error('Invalid signature');

    const order = await Order.findOne({ where: { razorpay_order_id }, transaction });
    if (!order) throw new Error('Order not found');

    order.razorpay_payment_id = razorpay_payment_id;
    order.status = 'paid';
    await order.save({ transaction });

    // Add credits to user profile
    const user = req.user;
    if (user.role === 'freelancer') {
      const freelancer = await Freelancer.findByPk(user.id, { transaction });
      freelancer.connect_credits += order.credits_awarded;
      await freelancer.save({ transaction });
    } else {
      const employer = await Employer.findByPk(user.id, { transaction });
      employer.connect_credits += order.credits_awarded;
      await employer.save({ transaction });
    }
    await transaction.commit();
    res.json({ success: true, credits: order.credits_awarded });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};